import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Database, CheckCircle, XCircle, Loader2 } from "lucide-react";

const SeedDataImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || '';
      });
      return obj;
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    setResults(null);

    try {
      // Fetch CSV files from public folder
      const [hospitalRes, medicationRes, patientRes, inventoryRes] = await Promise.all([
        fetch('/seed-data/hospital.csv'),
        fetch('/seed-data/medication.csv'),
        fetch('/seed-data/patient.csv'),
        fetch('/seed-data/inventory.csv'),
      ]);

      const hospitalText = await hospitalRes.text();
      const medicationText = await medicationRes.text();
      const patientText = await patientRes.text();
      const inventoryText = await inventoryRes.text();

      const hospitalData = parseCSV(hospitalText);
      const medicationData = parseCSV(medicationText);
      const patientData = parseCSV(patientText);
      const inventoryData = parseCSV(inventoryText);

      console.log('Parsed data:', {
        hospitals: hospitalData.length,
        medications: medicationData.length,
        patients: patientData.length,
        inventory: inventoryData.length,
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('import-seed-data', {
        body: {
          hospitalData,
          medicationData,
          patientData,
          inventoryData,
        },
      });

      if (error) throw error;

      setResults(data.results);
      toast.success('Seed data imported successfully!');
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(error.message || 'Failed to import seed data');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Seed Data Import</CardTitle>
                <CardDescription>
                  Import Delhi NCR + Dehradun hospital dataset for hackathon demo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                This will import 60 hospitals, 50 medications, 70 patients, and 120 inventory records.
                <br />
                <strong>Note:</strong> Run this only once for initial setup!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">60</div>
                <div className="text-sm text-muted-foreground">Hospitals</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">50</div>
                <div className="text-sm text-muted-foreground">Medications</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">70</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">120</div>
                <div className="text-sm text-muted-foreground">Inventory</div>
              </div>
            </div>

            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full bg-gradient-primary hover:opacity-90"
              size="lg"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Importing Data...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Start Import
                </>
              )}
            </Button>

            {results && (
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Import Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Clinics Imported
                    </span>
                    <span className="font-bold">{results.clinics}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Medications Imported
                    </span>
                    <span className="font-bold">{results.medications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Patients Imported
                    </span>
                    <span className="font-bold">{results.patients}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Inventory Imported
                    </span>
                    <span className="font-bold">{results.inventory}</span>
                  </div>

                  {results.errors && results.errors.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{results.errors.length} errors occurred:</strong>
                        <div className="mt-2 max-h-40 overflow-y-auto text-xs">
                          {results.errors.slice(0, 10).map((error: string, i: number) => (
                            <div key={i}>• {error}</div>
                          ))}
                          {results.errors.length > 10 && (
                            <div className="mt-1 text-muted-foreground">
                              ... and {results.errors.length - 10} more
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dataset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Coverage:</strong> Delhi NCR (Delhi, Gurugram, Noida, Ghaziabad) + Dehradun
            </div>
            <div>
              <strong>Hospitals:</strong> Mix of government and private healthcare facilities
            </div>
            <div>
              <strong>Medications:</strong> Common medicines with MRP and manufacturer info
            </div>
            <div>
              <strong>Patients:</strong> Realistic dummy data with consent flags
            </div>
            <div>
              <strong>Inventory:</strong> Stock levels with batch numbers and expiry dates
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedDataImport;
