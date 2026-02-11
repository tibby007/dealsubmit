-- Add application_pending to onboarding_status check constraint
-- This supports the new flow: Register → Application → Agreement → W9 → Admin Approval

-- Drop the existing constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_onboarding_status_check;

-- Add the updated constraint with application_pending
ALTER TABLE profiles
ADD CONSTRAINT profiles_onboarding_status_check
CHECK (onboarding_status IN ('application_pending', 'pending_approval', 'approved', 'agreement_pending', 'w9_pending', 'complete'));
