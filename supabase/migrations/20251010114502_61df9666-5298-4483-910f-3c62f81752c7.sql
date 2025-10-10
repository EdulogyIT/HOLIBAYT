-- Insert the orphaned France accounts that were created but not saved to database
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