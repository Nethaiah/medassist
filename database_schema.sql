-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create indexes for better query performance
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_role_idx ON public.profiles(role);

-- ========================================
-- CONSULTATIONS TABLE
-- ========================================

-- Create enum type for consultation status
CREATE TYPE consultation_status AS ENUM ('pending_payment', 'paid', 'completed');

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_data JSONB NOT NULL,
  ai_analysis JSONB NOT NULL,
  status consultation_status NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Patients can view their own consultations
CREATE POLICY "Patients can view own consultations"
  ON public.consultations
  FOR SELECT
  USING (
    auth.uid() = patient_id
  );

-- Patients can insert their own consultations
CREATE POLICY "Patients can insert own consultations"
  ON public.consultations
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
  );

-- Patients can update their own consultations (e.g., status changes)
CREATE POLICY "Patients can update own consultations"
  ON public.consultations
  FOR UPDATE
  USING (
    auth.uid() = patient_id
  );

-- Doctors can view all paid/completed consultations
CREATE POLICY "Doctors can view paid consultations"
  ON public.consultations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'doctor'
    )
    AND status IN ('paid', 'completed')
  );

-- Doctors can update consultation status
CREATE POLICY "Doctors can update consultation status"
  ON public.consultations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'doctor'
    )
  );

-- Create indexes for better query performance
CREATE INDEX consultations_patient_id_idx ON public.consultations(patient_id);
CREATE INDEX consultations_status_idx ON public.consultations(status);
CREATE INDEX consultations_created_at_idx ON public.consultations(created_at DESC);

-- -- Create function to update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Create trigger for consultations
-- CREATE TRIGGER update_consultations_updated_at
--   BEFORE UPDATE ON public.consultations
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

-- -- Create trigger for profiles
-- CREATE TRIGGER update_profiles_updated_at
--   BEFORE UPDATE ON public.profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();
