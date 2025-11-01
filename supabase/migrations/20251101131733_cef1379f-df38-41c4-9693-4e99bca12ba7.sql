-- Add comprehensive pricing tables for Airbnb-style pricing

-- Add weekend multiplier to seasonal pricing
ALTER TABLE property_seasonal_pricing 
ADD COLUMN IF NOT EXISTS weekend_multiplier DECIMAL(3,2) DEFAULT 1.0;

-- Create pricing rules table for discounts
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('length_discount', 'early_bird', 'last_minute', 'promotion')),
  conditions JSONB DEFAULT '{}'::jsonb,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pricing fees table
CREATE TABLE IF NOT EXISTS pricing_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL UNIQUE,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  extra_guest_fee DECIMAL(10,2) DEFAULT 0,
  extra_guest_threshold INTEGER DEFAULT 2 CHECK (extra_guest_threshold >= 0),
  pet_fee DECIMAL(10,2) DEFAULT 0,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_fees ENABLE ROW LEVEL SECURITY;

-- RLS policies for pricing_rules
CREATE POLICY "Property owners can manage their pricing rules"
ON pricing_rules FOR ALL
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view active pricing rules"
ON pricing_rules FOR SELECT
USING (is_active = true);

-- RLS policies for pricing_fees
CREATE POLICY "Property owners can manage their pricing fees"
ON pricing_fees FOR ALL
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view pricing fees"
ON pricing_fees FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_rules_property_id ON pricing_rules(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_dates ON pricing_rules(start_date, end_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pricing_fees_property_id ON pricing_fees(property_id);