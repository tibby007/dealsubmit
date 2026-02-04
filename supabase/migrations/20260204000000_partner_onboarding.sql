-- Partner Onboarding Module Migration
-- Created: 2026-02-04
-- Description: Adds tables for partner applications, agreements, documents, and bank info

-- ============================================================================
-- PART 1: CREATE NEW TABLES
-- ============================================================================

-- Partner Applications Table
-- Stores initial partner application data before approval
CREATE TABLE IF NOT EXISTS partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  contact_name text NOT NULL,
  position text,
  mobile_phone text NOT NULL,
  email text NOT NULL UNIQUE,
  additional_phone text,
  how_heard_about_us text,
  typical_deal_types text[] DEFAULT '{}',
  estimated_monthly_volume text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partner Agreements Table
-- Stores signed partner agreements with signature data
CREATE TABLE IF NOT EXISTS partner_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_version text NOT NULL DEFAULT '1.0',
  company_name text NOT NULL,
  contact_name text NOT NULL,
  partner_signature_url text NOT NULL,
  ccc_signature_url text NOT NULL,
  compensation_percentage integer NOT NULL DEFAULT 50,
  signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Partner Documents Table
-- Stores uploaded partner documents (W9, voided checks, etc.)
CREATE TABLE IF NOT EXISTS partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('w9', 'voided_check', 'direct_deposit_form')),
  file_url text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz
);

-- Partner Bank Info Table
-- Stores bank account information for commission payments
CREATE TABLE IF NOT EXISTS partner_bank_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name text,
  bank_name text,
  routing_number text,
  account_number text,
  verification_document_id uuid REFERENCES partner_documents(id),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- PART 2: MODIFY PROFILES TABLE
-- ============================================================================

-- Add onboarding_status column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_status text
DEFAULT 'pending_approval'
CHECK (onboarding_status IN ('pending_approval', 'approved', 'agreement_pending', 'w9_pending', 'complete'));

-- Add application_id reference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES partner_applications(id);

-- ============================================================================
-- PART 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_partner_applications_email ON partner_applications(email);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_partner_applications_created_at ON partner_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_agreements_user_id ON partner_agreements(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_documents_user_id ON partner_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_document_type ON partner_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_partner_bank_info_user_id ON partner_bank_info(user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON profiles(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_profiles_application_id ON profiles(application_id);

-- ============================================================================
-- PART 4: CREATE UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for partner_applications
DROP TRIGGER IF EXISTS update_partner_applications_updated_at ON partner_applications;
CREATE TRIGGER update_partner_applications_updated_at
  BEFORE UPDATE ON partner_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for partner_bank_info
DROP TRIGGER IF EXISTS update_partner_bank_info_updated_at ON partner_bank_info;
CREATE TRIGGER update_partner_bank_info_updated_at
  BEFORE UPDATE ON partner_bank_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_bank_info ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: CREATE RLS POLICIES
-- ============================================================================

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----- PARTNER APPLICATIONS POLICIES -----

-- Anyone can insert their own application (for public signup)
CREATE POLICY "Anyone can insert partner applications"
  ON partner_applications
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own application (by email match)
CREATE POLICY "Users can view own application by email"
  ON partner_applications
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR is_admin()
  );

-- Only admins can update applications (for approval/decline)
CREATE POLICY "Admins can update partner applications"
  ON partner_applications
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----- PARTNER AGREEMENTS POLICIES -----

-- Users can view their own agreements
CREATE POLICY "Users can view own agreements"
  ON partner_agreements
  FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own agreements
CREATE POLICY "Users can insert own agreements"
  ON partner_agreements
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ----- PARTNER DOCUMENTS POLICIES -----

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON partner_documents
  FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON partner_documents
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only admins can update documents (for verification)
CREATE POLICY "Admins can update partner documents"
  ON partner_documents
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----- PARTNER BANK INFO POLICIES -----

-- Users can view their own bank info
CREATE POLICY "Users can view own bank info"
  ON partner_bank_info
  FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own bank info
CREATE POLICY "Users can insert own bank info"
  ON partner_bank_info
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own bank info
CREATE POLICY "Users can update own bank info"
  ON partner_bank_info
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 7: CREATE STORAGE BUCKET AND POLICIES
-- ============================================================================

-- Note: Storage bucket creation must be done via Supabase Dashboard or API
-- The SQL below documents the expected configuration

-- Create the partner-documents bucket (run this via Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('partner-documents', 'partner-documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies will need to be created via Dashboard or Supabase client
-- Expected policies:
-- 1. Users can upload to their own folder: partner-documents/{user_id}/*
-- 2. Users can read their own files
-- 3. Admins can read all files

-- ============================================================================
-- PART 8: GRANTS (if needed for service role)
-- ============================================================================

-- Grant usage on tables to authenticated users
GRANT SELECT, INSERT ON partner_applications TO authenticated;
GRANT SELECT, INSERT ON partner_agreements TO authenticated;
GRANT SELECT, INSERT ON partner_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON partner_bank_info TO authenticated;

-- Grant all to service_role for admin operations
GRANT ALL ON partner_applications TO service_role;
GRANT ALL ON partner_agreements TO service_role;
GRANT ALL ON partner_documents TO service_role;
GRANT ALL ON partner_bank_info TO service_role;
