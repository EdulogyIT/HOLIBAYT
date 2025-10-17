-- Add latitude and longitude columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Create index for coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties(latitude, longitude);

-- Add comment for documentation
COMMENT ON COLUMN properties.latitude IS 'Property latitude coordinate for map display';
COMMENT ON COLUMN properties.longitude IS 'Property longitude coordinate for map display';