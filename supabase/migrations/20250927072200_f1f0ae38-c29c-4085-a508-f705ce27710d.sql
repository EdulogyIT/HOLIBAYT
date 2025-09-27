-- Fix RLS policy for payments table
-- Allow edge functions to update payments
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

CREATE POLICY "System can update payment status"
ON public.payments
FOR UPDATE
USING (true);

-- Allow edge functions to read all payment data for processing
CREATE POLICY "System can read payments for processing"
ON public.payments
FOR SELECT
USING (true);