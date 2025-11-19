
-- Migration: 20251028003726

-- Migration: 20251027234800

-- Migration: 20251027233353
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('staff', 'patient', 'caregiver');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE privacy_mode AS ENUM ('standard', 'private');
CREATE TYPE notify_mode AS ENUM ('fallback', 'parallel');
CREATE TYPE medication_form AS ENUM ('tablet', 'capsule', 'liquid', 'injection', 'cream', 'inhaler', 'patch', 'other');
CREATE TYPE code_type AS ENUM ('NDC', 'GTIN', 'UPC', 'OTHER');
CREATE TYPE prescription_status AS ENUM ('uploaded', 'parsed', 'confirmed');
CREATE TYPE dose_status AS ENUM ('pending', 'notified', 'taken', 'missed', 'skipped');
CREATE TYPE intake_status AS ENUM ('on_time', 'late', 'missed', 'skipped');
CREATE TYPE intake_source AS ENUM ('web_push', 'whatsapp', 'sms', 'web');
CREATE TYPE owner_type AS ENUM ('patient', 'clinic');
CREATE TYPE txn_reason AS ENUM ('intake', 'add', 'adjust', 'expire');
CREATE TYPE contact_type AS ENUM ('sms', 'whatsapp', 'web_push');
CREATE TYPE notification_channel AS ENUM ('web_push', 'whatsapp', 'sms');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'interacted');
CREATE TYPE action_token_type AS ENUM ('confirm_intake', 'snooze', 'skip', 'login');
CREATE TYPE caregiver_channel AS ENUM ('sms', 'whatsapp', 'web_push');

-- Clinics table
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone_e164 TEXT,
  role user_role NOT NULL,
  password_hash TEXT,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  dob DATE,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  language TEXT NOT NULL DEFAULT 'en',
  privacy_mode privacy_mode NOT NULL DEFAULT 'standard',
  notify_mode notify_mode NOT NULL DEFAULT 'fallback',
  dnd_start TIME,
  dnd_end TIME,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Caregivers table
CREATE TABLE caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone_e164 TEXT NOT NULL,
  channels caregiver_channel[] NOT NULL DEFAULT '{}',
  escalate_after_mins INTEGER NOT NULL DEFAULT 30,
  verified_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  form medication_form NOT NULL,
  strength TEXT,
  code_type code_type,
  code_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_url TEXT,
  parsed_json JSONB,
  prescriber TEXT,
  issued_at DATE,
  status prescription_status NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL,
  dose_value NUMERIC NOT NULL,
  dose_unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  regimen_json JSONB NOT NULL,
  prn BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dose plans table
CREATE TABLE dose_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  planned_at_utc TIMESTAMPTZ NOT NULL,
  window_start_utc TIMESTAMPTZ NOT NULL,
  window_end_utc TIMESTAMPTZ NOT NULL,
  status dose_status NOT NULL DEFAULT 'pending',
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dose intakes table
CREATE TABLE dose_intakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dose_plan_id UUID NOT NULL REFERENCES dose_plans(id) ON DELETE CASCADE,
  taken_at_utc TIMESTAMPTZ,
  status intake_status NOT NULL,
  source intake_source NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory lots table
CREATE TABLE inventory_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type owner_type NOT NULL,
  owner_id UUID NOT NULL,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  lot_no TEXT,
  qty NUMERIC NOT NULL DEFAULT 0,
  expiry_date DATE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory transactions table
CREATE TABLE inventory_txns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID NOT NULL REFERENCES inventory_lots(id) ON DELETE CASCADE,
  delta NUMERIC NOT NULL,
  reason txn_reason NOT NULL,
  dose_intake_id UUID REFERENCES dose_intakes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact points table
CREATE TABLE contact_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type contact_type NOT NULL,
  phone_e164 TEXT,
  push_endpoint TEXT,
  push_p256dh TEXT,
  push_auth TEXT,
  browser TEXT,
  last_seen_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ,
  preferred BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  to_ref TEXT NOT NULL,
  template TEXT NOT NULL,
  provider_msg_id TEXT,
  payload_json JSONB,
  status notification_status NOT NULL DEFAULT 'queued',
  error TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  interacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Action tokens table
CREATE TABLE action_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type action_token_type NOT NULL,
  entity_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role user_role,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_json JSONB,
  after_json JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_caregivers_patient_id ON caregivers(patient_id);
CREATE INDEX idx_schedules_patient_id ON schedules(patient_id);
CREATE INDEX idx_schedules_medication_id ON schedules(medication_id);
CREATE INDEX idx_dose_plans_schedule_id ON dose_plans(schedule_id);
CREATE INDEX idx_dose_plans_planned_at ON dose_plans(planned_at_utc);
CREATE INDEX idx_dose_plans_status ON dose_plans(status);
CREATE INDEX idx_dose_intakes_dose_plan_id ON dose_intakes(dose_plan_id);
CREATE INDEX idx_inventory_lots_owner ON inventory_lots(owner_type, owner_id);
CREATE INDEX idx_inventory_lots_medication_id ON inventory_lots(medication_id);
CREATE INDEX idx_inventory_txns_lot_id ON inventory_txns(lot_id);
CREATE INDEX idx_contact_points_patient_id ON contact_points(patient_id);
CREATE INDEX idx_notification_logs_patient_id ON notification_logs(patient_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_action_tokens_token ON action_tokens(token);
CREATE INDEX idx_action_tokens_entity_id ON action_tokens(entity_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_txns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff role
CREATE POLICY "Staff can view all clinics" ON clinics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can view all patients" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update patients" ON patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Staff can view all medications" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert medications" ON medications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can view all schedules" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert schedules" ON schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update schedules" ON schedules FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Staff can view all dose plans" ON dose_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can view all dose intakes" ON dose_intakes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can view inventory" ON inventory_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can modify inventory" ON inventory_lots FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_caregivers_updated_at BEFORE UPDATE ON caregivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dose_plans_updated_at BEFORE UPDATE ON dose_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_lots_updated_at BEFORE UPDATE ON inventory_lots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Migration: 20251027235737
-- Fix critical security issues: proper RLS policies with role-based access control

-- Step 1: Create user_roles table (DO NOT store roles in users table)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Step 2: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 3: Get user's clinic_id from users table
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT clinic_id
  FROM public.users
  WHERE id = _user_id
$$;

-- Step 4: Fix the update_updated_at_column function to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Step 5: Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Staff can view all clinics" ON clinics;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can view all patients" ON patients;
DROP POLICY IF EXISTS "Staff can insert patients" ON patients;
DROP POLICY IF EXISTS "Staff can update patients" ON patients;
DROP POLICY IF EXISTS "Staff can view all medications" ON medications;
DROP POLICY IF EXISTS "Staff can insert medications" ON medications;
DROP POLICY IF EXISTS "Staff can view all schedules" ON schedules;
DROP POLICY IF EXISTS "Staff can insert schedules" ON schedules;
DROP POLICY IF EXISTS "Staff can update schedules" ON schedules;
DROP POLICY IF EXISTS "Staff can view all dose plans" ON dose_plans;
DROP POLICY IF EXISTS "Staff can view all dose intakes" ON dose_intakes;
DROP POLICY IF EXISTS "Staff can view inventory" ON inventory_lots;
DROP POLICY IF EXISTS "Staff can modify inventory" ON inventory_lots;
DROP POLICY IF EXISTS "Staff can view audit logs" ON audit_logs;

-- Step 6: Create secure role-based policies

-- CLINICS: Staff can view clinics in their organization
CREATE POLICY "Deny anonymous access to clinics"
  ON clinics FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view their clinic"
  ON clinics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND id = public.get_user_clinic_id(auth.uid()));

-- USERS: Users can view their own record
CREATE POLICY "Deny anonymous access to users"
  ON users FOR ALL TO anon USING (false);

CREATE POLICY "Users can view their own record"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- PATIENTS: Staff can view patients in their clinic, patients can view own record
CREATE POLICY "Deny anonymous access to patients"
  ON patients FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view patients in their clinic"
  ON patients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Staff can insert patients in their clinic"
  ON patients FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'staff') AND clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Staff can update patients in their clinic"
  ON patients FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND clinic_id = public.get_user_clinic_id(auth.uid()));

CREATE POLICY "Patients can view their own record"
  ON patients FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- CAREGIVERS: Staff in same clinic can manage, patients can view their own caregivers
CREATE POLICY "Deny anonymous access to caregivers"
  ON caregivers FOR ALL TO anon USING (false);

CREATE POLICY "Staff can manage caregivers for their clinic patients"
  ON caregivers FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = caregivers.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- MEDICATIONS: Staff can view/insert, patients can view
CREATE POLICY "Deny anonymous access to medications"
  ON medications FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view all medications"
  ON medications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can insert medications"
  ON medications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

-- PRESCRIPTIONS: Staff can manage for their clinic, patients can view own
CREATE POLICY "Deny anonymous access to prescriptions"
  ON prescriptions FOR ALL TO anon USING (false);

CREATE POLICY "Staff can manage prescriptions in their clinic"
  ON prescriptions FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = prescriptions.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- SCHEDULES: Staff can manage for their clinic, patients can view own
CREATE POLICY "Deny anonymous access to schedules"
  ON schedules FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view schedules in their clinic"
  ON schedules FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = schedules.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Staff can insert schedules in their clinic"
  ON schedules FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = schedules.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

CREATE POLICY "Staff can update schedules in their clinic"
  ON schedules FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = schedules.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- DOSE_PLANS: Staff can view for their clinic
CREATE POLICY "Deny anonymous access to dose_plans"
  ON dose_plans FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view dose plans in their clinic"
  ON dose_plans FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM schedules s
      JOIN patients p ON p.id = s.patient_id
      WHERE s.id = dose_plans.schedule_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- DOSE_INTAKES: Staff can view for their clinic
CREATE POLICY "Deny anonymous access to dose_intakes"
  ON dose_intakes FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view dose intakes in their clinic"
  ON dose_intakes FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM dose_plans dp
      JOIN schedules s ON s.id = dp.schedule_id
      JOIN patients p ON p.id = s.patient_id
      WHERE dp.id = dose_intakes.dose_plan_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- INVENTORY: Staff can manage for their clinic
CREATE POLICY "Deny anonymous access to inventory_lots"
  ON inventory_lots FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view inventory in their clinic"
  ON inventory_lots FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    (owner_type = 'clinic' AND owner_id = public.get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Staff can modify inventory in their clinic"
  ON inventory_lots FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    (owner_type = 'clinic' AND owner_id = public.get_user_clinic_id(auth.uid()))
  );

-- INVENTORY_TXNS: Staff can view for their clinic
CREATE POLICY "Deny anonymous access to inventory_txns"
  ON inventory_txns FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view inventory transactions in their clinic"
  ON inventory_txns FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM inventory_lots il
      WHERE il.id = inventory_txns.lot_id
      AND il.owner_type = 'clinic'
      AND il.owner_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- CONTACT_POINTS: Staff can manage for their clinic, patients can manage own
CREATE POLICY "Deny anonymous access to contact_points"
  ON contact_points FOR ALL TO anon USING (false);

CREATE POLICY "Staff can manage contact points in their clinic"
  ON contact_points FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = contact_points.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- NOTIFICATION_LOGS: Staff can view for their clinic
CREATE POLICY "Deny anonymous access to notification_logs"
  ON notification_logs FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view notification logs in their clinic"
  ON notification_logs FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff') AND
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = notification_logs.patient_id
      AND p.clinic_id = public.get_user_clinic_id(auth.uid())
    )
  );

-- ACTION_TOKENS: No direct access (only via edge functions)
CREATE POLICY "Deny anonymous access to action_tokens"
  ON action_tokens FOR ALL TO anon USING (false);

CREATE POLICY "Deny direct access to action_tokens"
  ON action_tokens FOR ALL TO authenticated USING (false);

-- AUDIT_LOGS: Staff can view logs for their clinic
CREATE POLICY "Deny anonymous access to audit_logs"
  ON audit_logs FOR ALL TO anon USING (false);

CREATE POLICY "Staff can view audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff'));

-- USER_ROLES: Users can view their own roles
CREATE POLICY "Deny anonymous access to user_roles"
  ON user_roles FOR ALL TO anon USING (false);

CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Migration: 20251028000801
-- Create a test staff account for hackathon demo
-- Password: demo123 (you can change this later)

-- First, we need to insert into auth.users manually via a function
-- since we can't directly insert into auth schema

-- Insert a demo clinic if it doesn't exist
INSERT INTO public.clinics (name, address, timezone)
VALUES ('Demo Clinic', 'Demo Address, Delhi', 'Asia/Kolkata')
ON CONFLICT DO NOTHING;

-- Note: For actual user creation, you need to sign up through the app
-- This creates the structure, but you'll need to sign up at /login first

-- After signing up, run this to assign staff role:
-- Replace 'YOUR_USER_ID' with the actual UUID from auth.users after you sign up

-- Example comment for reference:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_ID_HERE', 'staff')
-- ON CONFLICT DO NOTHING;


-- Migration: 20251028004050
-- Refresh database types
-- This migration ensures all existing tables are properly recognized
COMMENT ON TABLE public.clinics IS 'Medical clinics and facilities';
COMMENT ON TABLE public.patients IS 'Patient records and profiles';
COMMENT ON TABLE public.medications IS 'Medication library';
COMMENT ON TABLE public.users IS 'Staff user accounts';

-- Migration: 20251028004413
-- Fix RLS policies to allow user signup
-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "Deny direct access to users" ON public.users;
DROP POLICY IF EXISTS "Deny direct access to user_roles" ON public.user_roles;

-- Add proper policies for users table
CREATE POLICY "Allow user creation during signup"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own record"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Add proper policies for user_roles table  
CREATE POLICY "Allow role creation during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Keep the existing SELECT policy for user_roles
-- (already exists: "Users can view their own roles")

-- Create a database function to auto-create user records on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_clinic_id uuid;
BEGIN
  -- Get the first clinic or create a default one
  SELECT id INTO default_clinic_id FROM public.clinics LIMIT 1;
  
  IF default_clinic_id IS NULL THEN
    INSERT INTO public.clinics (name, timezone, address)
    VALUES ('Default Clinic', 'America/New_York', 'Default Address')
    RETURNING id INTO default_clinic_id;
  END IF;

  -- Insert user record
  INSERT INTO public.users (id, email, role, clinic_id, status)
  VALUES (NEW.id, NEW.email, 'staff', default_clinic_id, 'active');
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff');
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create user records on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
