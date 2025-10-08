-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID NOT NULL,
  payment_account_id UUID REFERENCES public.host_payment_accounts(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  rejection_reason TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Hosts can view their own withdrawal requests
CREATE POLICY "Hosts can view their own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = host_user_id);

-- Hosts can create their own withdrawal requests
CREATE POLICY "Hosts can create withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = host_user_id AND status = 'pending');

-- Admins can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update withdrawal requests
CREATE POLICY "Admins can update withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_withdrawal_requests_host_user_id ON public.withdrawal_requests(host_user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Add trigger for updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();