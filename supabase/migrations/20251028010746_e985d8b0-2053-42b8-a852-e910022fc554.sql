-- Create demo hospitals for Delhi and Dehradun with sample data

-- Insert Delhi Hospital (AIIMS)
INSERT INTO public.clinics (name, address, timezone)
VALUES (
  'All India Institute of Medical Sciences (AIIMS) - Delhi',
  'AIIMS Rd, Ansari Nagar, New Delhi, Delhi 110029',
  'Asia/Kolkata'
);

-- Insert Dehradun Hospital  
INSERT INTO public.clinics (name, address, timezone)
VALUES (
  'Govt. Hospital - Dehradun',
  'Civic Centre, Dehradun, Uttarakhand 248001',
  'Asia/Kolkata'
);

-- Add sample patients for Delhi
INSERT INTO public.patients (clinic_id, full_name, dob, timezone, privacy_mode, notify_mode, consent_at)
SELECT 
  c.id,
  patient.name,
  patient.dob,
  'Asia/Kolkata',
  'standard',
  'fallback',
  now()
FROM public.clinics c
CROSS JOIN (VALUES
  ('Rajesh Kumar', '1975-03-15'::date),
  ('Priya Sharma', '1980-07-22'::date),
  ('Amit Singh', '1965-11-08'::date)
) AS patient(name, dob)
WHERE c.name LIKE '%AIIMS%Delhi%';

-- Add sample patients for Dehradun
INSERT INTO public.patients (clinic_id, full_name, dob, timezone, privacy_mode, notify_mode, consent_at)
SELECT 
  c.id,
  patient.name,
  patient.dob,
  'Asia/Kolkata',
  'standard',
  'fallback',
  now()
FROM public.clinics c
CROSS JOIN (VALUES
  ('Meera Patel', '1978-05-10'::date),
  ('Vikram Chauhan', '1982-09-18'::date),
  ('Sunita Verma', '1970-12-25'::date)
) AS patient(name, dob)
WHERE c.name LIKE '%Dehradun%';