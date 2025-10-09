-- Allow admins to view all commission transactions
CREATE POLICY "Admins can view all commission transactions"
ON public.commission_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));