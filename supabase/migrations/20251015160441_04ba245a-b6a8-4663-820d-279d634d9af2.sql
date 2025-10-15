-- Drop trigger first, then function, then recreate both with proper security
DROP TRIGGER IF EXISTS set_expiry_date ON rental_agreements;
DROP FUNCTION IF EXISTS calculate_expiry_date();

-- Recreate function with security definer and search_path
CREATE OR REPLACE FUNCTION calculate_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := (NEW.start_date::DATE + (NEW.lease_duration_months || ' months')::INTERVAL)::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Recreate trigger
CREATE TRIGGER set_expiry_date
BEFORE INSERT OR UPDATE OF start_date, lease_duration_months ON rental_agreements
FOR EACH ROW
EXECUTE FUNCTION calculate_expiry_date();