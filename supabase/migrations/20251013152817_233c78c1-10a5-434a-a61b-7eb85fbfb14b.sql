-- Drop the existing constraint that's blocking 'escrowed' status
ALTER TABLE public.commission_transactions 
DROP CONSTRAINT IF EXISTS commission_transactions_status_check;

-- Add the updated constraint that includes 'escrowed'
ALTER TABLE public.commission_transactions
ADD CONSTRAINT commission_transactions_status_check 
CHECK (status IN ('pending', 'escrowed', 'completed', 'failed'));