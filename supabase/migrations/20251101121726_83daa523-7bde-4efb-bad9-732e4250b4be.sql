-- Create table for dynamic seasonal pricing
CREATE TABLE IF NOT EXISTS public.property_seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_night NUMERIC(10, 2) NOT NULL,
  season_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_property_dates 
ON public.property_seasonal_pricing(property_id, start_date, end_date);

-- Enable RLS
ALTER TABLE public.property_seasonal_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Property owners can manage seasonal pricing"
ON public.property_seasonal_pricing
FOR ALL
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view seasonal pricing"
ON public.property_seasonal_pricing
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_seasonal_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER update_seasonal_pricing_timestamp
BEFORE UPDATE ON public.property_seasonal_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_seasonal_pricing_updated_at();