-- Drop withdrawal_requests table as it's no longer needed
-- Payouts are now automatic via Stripe Connect
DROP TABLE IF EXISTS public.withdrawal_requests;

-- Update host_payment_accounts to mark Stripe Connect accounts as verified when they complete onboarding
-- This will be handled by the Stripe webhook, but we add a column for tracking
COMMENT ON COLUMN public.host_payment_accounts.is_verified IS 'Indicates if the Stripe Connect account has completed onboarding';

-- Add index for faster Stripe account lookups
CREATE INDEX IF NOT EXISTS idx_host_payment_accounts_stripe_account_id 
ON public.host_payment_accounts(stripe_account_id) 
WHERE stripe_account_id IS NOT NULL;