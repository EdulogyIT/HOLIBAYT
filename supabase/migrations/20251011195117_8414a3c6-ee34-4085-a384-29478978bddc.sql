-- Add new property verification and feature fields
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS holibayt_pay_eligible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS new_build BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS financing_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS occupancy_available_from DATE,
ADD COLUMN IF NOT EXISTS contract_digitally_available BOOLEAN DEFAULT false;

-- Add new profile verification fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;

-- Create zone_statistics table for location data
CREATE TABLE IF NOT EXISTS zone_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  city TEXT NOT NULL,
  average_price_buy NUMERIC,
  average_price_rent NUMERIC,
  average_price_short_stay NUMERIC,
  verified_percentage INTEGER DEFAULT 0,
  popularity_index INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  commute_to_downtown_minutes INTEGER,
  safety_score INTEGER DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(zone_name, city)
);

-- Enable RLS on zone_statistics
ALTER TABLE zone_statistics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view zone statistics
CREATE POLICY "Anyone can view zone statistics"
  ON zone_statistics FOR SELECT
  USING (true);

-- Policy: Admins can manage zone statistics
CREATE POLICY "Admins can manage zone statistics"
  ON zone_statistics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('buy', 'rent', 'short-stay')),
  filters JSONB DEFAULT '{}'::jsonb,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved searches
CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved searches
CREATE POLICY "Users can insert their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own saved searches
CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own saved searches
CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Insert some sample zone statistics for major cities
INSERT INTO zone_statistics (zone_name, city, average_price_buy, average_price_rent, average_price_short_stay, verified_percentage, safety_score, commute_to_downtown_minutes)
VALUES 
  ('Centre-ville', 'Alger', 25000000, 80000, 5000, 95, 85, 5),
  ('Hydra', 'Alger', 35000000, 120000, 8000, 98, 95, 15),
  ('Bir Mourad Rais', 'Alger', 28000000, 95000, 6000, 92, 88, 12),
  ('Centre-ville', 'Oran', 18000000, 60000, 4000, 90, 82, 5),
  ('Bir El Djir', 'Oran', 15000000, 50000, 3500, 88, 80, 20),
  ('Centre-ville', 'Constantine', 16000000, 55000, 3800, 87, 78, 5),
  ('Ain Benian', 'Annaba', 14000000, 48000, 3200, 85, 75, 15)
ON CONFLICT (zone_name, city) DO NOTHING;