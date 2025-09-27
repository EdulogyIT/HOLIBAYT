-- Add owner_account_id column to properties table for Stripe Connect
ALTER TABLE public.properties 
ADD COLUMN owner_account_id text;

-- Add comment for clarity
COMMENT ON COLUMN public.properties.owner_account_id IS 'Stripe Connect account ID (acct_...) for the property owner';