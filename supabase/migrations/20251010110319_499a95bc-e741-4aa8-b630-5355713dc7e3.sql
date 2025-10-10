-- Deactivate existing Stripe accounts for the two hosts
-- This allows them to reconnect with new France-based accounts

UPDATE host_payment_accounts
SET 
  is_active = false,
  updated_at = NOW()
WHERE stripe_account_id IN (
  'acct_1SFubRJCWEyo2S1c',
  'acct_1SGd4uJLzItdTy21'
)
AND is_active = true;