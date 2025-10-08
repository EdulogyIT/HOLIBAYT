-- Deactivate duplicate host payment accounts without stripe_account_id
UPDATE host_payment_accounts 
SET is_active = false 
WHERE stripe_account_id IS NULL 
AND is_active = true;