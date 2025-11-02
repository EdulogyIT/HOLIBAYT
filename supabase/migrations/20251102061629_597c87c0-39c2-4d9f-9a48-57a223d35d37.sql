-- Add check-in/check-out times and min/max nights to properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS check_in_time TIME DEFAULT '15:00:00',
ADD COLUMN IF NOT EXISTS check_out_time TIME DEFAULT '11:00:00',
ADD COLUMN IF NOT EXISTS min_nights INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_nights INTEGER DEFAULT 365;

-- Create smart_pricing_settings table
CREATE TABLE IF NOT EXISTS smart_pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  aggressiveness_level TEXT DEFAULT 'moderate' CHECK (aggressiveness_level IN ('conservative', 'moderate', 'aggressive')),
  consider_occupancy BOOLEAN DEFAULT true,
  consider_events BOOLEAN DEFAULT true,
  consider_seasonality BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Enable RLS on smart_pricing_settings
ALTER TABLE smart_pricing_settings ENABLE ROW LEVEL SECURITY;

-- Policies for smart_pricing_settings
CREATE POLICY "Property owners can view their smart pricing settings"
  ON smart_pricing_settings FOR SELECT
  USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Property owners can manage their smart pricing settings"
  ON smart_pricing_settings FOR ALL
  USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all smart pricing settings"
  ON smart_pricing_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Comment on table
COMMENT ON TABLE smart_pricing_settings IS 'Stores smart/dynamic pricing settings for properties';