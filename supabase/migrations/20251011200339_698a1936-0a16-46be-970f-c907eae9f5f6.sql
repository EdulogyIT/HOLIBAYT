-- Add new fields to properties table for enhanced Buy/Rent pages
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('new', 'under_construction', 'resale', 'excellent', 'good', 'needs_renovation')),
ADD COLUMN IF NOT EXISTS availability_status TEXT CHECK (availability_status IN ('immediate', 'off-plan', 'negotiable')),
ADD COLUMN IF NOT EXISTS minimum_rental_term TEXT,
ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT false;

-- Add new fields to profiles table for seller/owner verification
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT ARRAY['Arabic'],
ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 100 CHECK (response_rate >= 0 AND response_rate <= 100),
ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0;

-- Create index for better performance on property searches
CREATE INDEX IF NOT EXISTS idx_properties_condition ON properties(condition);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON properties(availability_status);
CREATE INDEX IF NOT EXISTS idx_properties_furnished ON properties(furnished);

COMMENT ON COLUMN properties.condition IS 'Physical condition of the property';
COMMENT ON COLUMN properties.availability_status IS 'When the property becomes available';
COMMENT ON COLUMN properties.minimum_rental_term IS 'Minimum rental period required (e.g., "6 months", "1 year")';
COMMENT ON COLUMN properties.furnished IS 'Whether the property comes furnished';
COMMENT ON COLUMN profiles.languages_spoken IS 'Languages spoken by the host/seller';
COMMENT ON COLUMN profiles.response_rate IS 'Percentage response rate of the host/seller';
COMMENT ON COLUMN profiles.transaction_count IS 'Total number of successful transactions';