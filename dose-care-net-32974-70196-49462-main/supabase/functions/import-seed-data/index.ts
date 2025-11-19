import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HospitalRow {
  hospital_id: string;
  name: string;
  city: string;
  state: string;
  pin: string;
  contact: string;
  type: string;
  address: string;
  lat: string;
  lon: string;
}

interface MedicationRow {
  med_id: string;
  brand_name: string;
  generic_name: string;
  dosage: string;
  unit: string;
  mrp: string;
  manufacturer: string;
}

interface PatientRow {
  patient_id: string;
  name: string;
  gender: string;
  age: string;
  city: string;
  phone: string;
  hospital_id: string;
  consent_sms: string;
  consent_whatsapp: string;
  consent_push: string;
}

interface InventoryRow {
  inv_id: string;
  hospital_id: string;
  med_id: string;
  batch_no: string;
  qty: string;
  expiry_date: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { hospitalData, medicationData, patientData, inventoryData } = await req.json();

    console.log('Starting seed data import...');
    const results = {
      clinics: 0,
      medications: 0,
      patients: 0,
      inventory: 0,
      errors: [] as string[],
    };

    // Map to store old IDs to new UUIDs
    const clinicIdMap = new Map<string, string>();
    const medicationIdMap = new Map<string, string>();
    const patientIdMap = new Map<string, string>();

    // 1. Import Hospitals as Clinics
    console.log('Importing hospitals...');
    for (const row of hospitalData as HospitalRow[]) {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .insert({
            name: row.name,
            address: `${row.address}, ${row.city}, ${row.state} ${row.pin}`,
            timezone: row.state === 'Uttarakhand' ? 'Asia/Kolkata' : 'Asia/Kolkata',
          })
          .select('id')
          .single();

        if (error) throw error;
        clinicIdMap.set(row.hospital_id, data.id);
        results.clinics++;
      } catch (error: any) {
        results.errors.push(`Hospital ${row.hospital_id}: ${error.message}`);
      }
    }

    // 2. Import Medications
    console.log('Importing medications...');
    for (const row of medicationData as MedicationRow[]) {
      try {
        // Determine form based on dosage/unit
        let form = 'tablet';
        if (row.unit === 'ml' || row.brand_name.toLowerCase().includes('syrup')) {
          form = 'liquid';
        } else if (row.brand_name.toLowerCase().includes('inhaler')) {
          form = 'inhaler';
        } else if (row.brand_name.toLowerCase().includes('injection') || row.unit === 'IU') {
          form = 'injection';
        } else if (row.brand_name.toLowerCase().includes('cream')) {
          form = 'cream';
        }

        const { data, error } = await supabase
          .from('medications')
          .insert({
            name: row.brand_name,
            form: form,
            strength: `${row.dosage} ${row.unit}`,
            code_type: 'OTHER',
            code_value: row.med_id,
            notes: `Generic: ${row.generic_name}, Manufacturer: ${row.manufacturer}, MRP: ₹${row.mrp}`,
          })
          .select('id')
          .single();

        if (error) throw error;
        medicationIdMap.set(row.med_id, data.id);
        results.medications++;
      } catch (error: any) {
        results.errors.push(`Medication ${row.med_id}: ${error.message}`);
      }
    }

    // 3. Import Patients
    console.log('Importing patients...');
    for (const row of patientData as PatientRow[]) {
      try {
        const clinicId = clinicIdMap.get(row.hospital_id);
        if (!clinicId) {
          results.errors.push(`Patient ${row.patient_id}: Hospital ${row.hospital_id} not found`);
          continue;
        }

        // Calculate approximate DOB from age
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - parseInt(row.age);
        const dob = `${birthYear}-01-01`;

        const { data, error } = await supabase
          .from('patients')
          .insert({
            clinic_id: clinicId,
            full_name: row.name,
            dob: dob,
            timezone: 'Asia/Kolkata',
            language: 'en',
            privacy_mode: 'standard',
            notify_mode: 'fallback',
            consent_at: (row.consent_sms === 'true' || row.consent_whatsapp === 'true' || row.consent_push === 'true') 
              ? new Date().toISOString() 
              : null,
          })
          .select('id')
          .single();

        if (error) throw error;
        patientIdMap.set(row.patient_id, data.id);
        results.patients++;
      } catch (error: any) {
        results.errors.push(`Patient ${row.patient_id}: ${error.message}`);
      }
    }

    // 4. Import Inventory
    console.log('Importing inventory...');
    for (const row of inventoryData as InventoryRow[]) {
      try {
        const clinicId = clinicIdMap.get(row.hospital_id);
        const medicationId = medicationIdMap.get(row.med_id);

        if (!clinicId) {
          results.errors.push(`Inventory ${row.inv_id}: Hospital ${row.hospital_id} not found`);
          continue;
        }
        if (!medicationId) {
          results.errors.push(`Inventory ${row.inv_id}: Medication ${row.med_id} not found`);
          continue;
        }

        const { error } = await supabase
          .from('inventory_lots')
          .insert({
            medication_id: medicationId,
            owner_id: clinicId,
            owner_type: 'clinic',
            lot_no: row.batch_no,
            qty: parseInt(row.qty),
            expiry_date: row.expiry_date,
          });

        if (error) throw error;
        results.inventory++;
      } catch (error: any) {
        results.errors.push(`Inventory ${row.inv_id}: ${error.message}`);
      }
    }

    console.log('Import completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Seed data imported successfully',
        results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Import failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
