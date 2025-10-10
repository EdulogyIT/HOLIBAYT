-- Step 1: Drop the problematic unique constraint that prevents multiple records with same account_number
ALTER TABLE host_payment_accounts 
DROP CONSTRAINT IF EXISTS host_payment_accounts_user_id_account_number_key;

-- Step 2: Add a new partial unique constraint that only applies to active accounts
-- This ensures each user can only have ONE active Stripe account at a time
CREATE UNIQUE INDEX host_payment_accounts_user_active_unique 
ON host_payment_accounts (user_id, stripe_account_id) 
WHERE is_active = true AND stripe_account_id IS NOT NULL;

-- Step 3: Insert the orphaned France accounts that were created but not saved to database
-- Insert katakshaya@gmail.com's France account
INSERT INTO host_payment_accounts (
  user_id,
  stripe_account_id,
  account_holder_name,
  bank_name,
  account_number,
  account_type,
  country,
  currency,
  is_active,
  is_verified
) VALUES (
  '3795f68d-3563-40e0-99f6-4f1ad63b4018',
  'acct_1SGefcJ7vQm9awiy',
  'Host',
  'Stripe Connect',
  'acct_1SGefcJ7vQm9awiy',
  'express',
  'FR',
  'EUR',
  true,
  false
)
ON CONFLICT DO NOTHING;

-- Insert princessmars08@gmail.com's France account  
INSERT INTO host_payment_accounts (
  user_id,
  stripe_account_id,
  account_holder_name,
  bank_name,
  account_number,
  account_type,
  country,
  currency,
  is_active,
  is_verified
) VALUES (
  '9eac5c5e-8356-4e7a-9710-006b705acd65',
  'acct_1SGeeWJjUMtwGyY6',
  'Host',
  'Stripe Connect',
  'acct_1SGeeWJjUMtwGyY6',
  'express',
  'FR',
  'EUR',
  true,
  false
)
ON CONFLICT DO NOTHING;