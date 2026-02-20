-- Add lender recommendation columns
ALTER TABLE deals ADD COLUMN IF NOT EXISTS recommended_lender TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lender_fit_score INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lender_notes TEXT;
