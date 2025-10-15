-- Create client_reviews table for admin-managed testimonials
CREATE TABLE IF NOT EXISTS client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  review_text TEXT NOT NULL,
  avatar_initials TEXT,
  approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins manage reviews"
  ON client_reviews FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Public can view approved reviews
CREATE POLICY "Public view approved"
  ON client_reviews FOR SELECT
  USING (approved = true);

-- Create rent_payments table
CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES rental_agreements(id) ON DELETE CASCADE NOT NULL,
  tenant_user_id UUID NOT NULL,
  host_user_id UUID NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'DZD',
  due_date DATE NOT NULL,
  payment_date TIMESTAMP,
  status TEXT CHECK (status IN ('pending', 'paid', 'late', 'failed')) DEFAULT 'pending',
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  late_fee DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on rent_payments
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;

-- Tenants can view/update their payments
CREATE POLICY "Tenants manage their payments"
  ON rent_payments FOR ALL
  USING (tenant_user_id = auth.uid());

-- Hosts can view their payments
CREATE POLICY "Hosts view their payments"
  ON rent_payments FOR SELECT
  USING (host_user_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins full access on rent_payments"
  ON rent_payments FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Add agreement renewal columns
ALTER TABLE rental_agreements 
ADD COLUMN IF NOT EXISTS renewed_from UUID REFERENCES rental_agreements(id),
ADD COLUMN IF NOT EXISTS renewal_terms JSONB,
ADD COLUMN IF NOT EXISTS expires_at DATE;

-- Function to auto-calculate expiry
CREATE OR REPLACE FUNCTION calculate_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := (NEW.start_date::DATE + (NEW.lease_duration_months || ' months')::INTERVAL)::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert/update
DROP TRIGGER IF EXISTS set_expiry_date ON rental_agreements;
CREATE TRIGGER set_expiry_date
BEFORE INSERT OR UPDATE OF start_date, lease_duration_months ON rental_agreements
FOR EACH ROW
EXECUTE FUNCTION calculate_expiry_date();

-- Backfill expires_at for existing agreements
UPDATE rental_agreements
SET expires_at = (start_date::DATE + (lease_duration_months || ' months')::INTERVAL)::DATE
WHERE expires_at IS NULL;

-- Insert default footer contacts into platform_settings
INSERT INTO platform_settings (setting_key, setting_value)
VALUES (
  'footer_contacts',
  '{
    "phone": "+213 21 123 456",
    "email": "contact@holibayt.com",
    "address": "Alger, Algérie",
    "social": {
      "facebook": "",
      "instagram": "",
      "linkedin": ""
    }
  }'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;

-- Create storage bucket for lawyer photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('lawyer-photos', 'lawyer-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users upload lawyer photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lawyer-photos');

-- Allow public read access
CREATE POLICY "Public read lawyer photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lawyer-photos');