-- Create table for host payment accounts
CREATE TABLE public.host_payment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_holder_name text NOT NULL,
  account_number text NOT NULL,
  routing_number text,
  iban text,
  swift_code text,
  bank_address text,
  account_type text NOT NULL DEFAULT 'checking',
  country text NOT NULL DEFAULT 'DZ',
  currency text NOT NULL DEFAULT 'DZD',
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  stripe_account_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, account_number)
);

-- Enable RLS
ALTER TABLE public.host_payment_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for host_payment_accounts
CREATE POLICY "Users can view their own payment accounts"
ON public.host_payment_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment accounts"
ON public.host_payment_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment accounts"
ON public.host_payment_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment accounts"
ON public.host_payment_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_host_payment_accounts_updated_at
BEFORE UPDATE ON public.host_payment_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add commission_rate to properties table for host-specific rates
ALTER TABLE public.properties 
ADD COLUMN commission_rate numeric DEFAULT 0.15 CHECK (commission_rate >= 0 AND commission_rate <= 1);

-- Create table for commission transactions
CREATE TABLE public.commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  host_user_id uuid NOT NULL,
  total_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  host_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_transfer_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for commission_transactions
ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for commission_transactions
CREATE POLICY "Hosts can view their own commission transactions"
ON public.commission_transactions
FOR SELECT
USING (auth.uid() = host_user_id);

CREATE POLICY "System can insert commission transactions"
ON public.commission_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update commission transactions"
ON public.commission_transactions
FOR UPDATE
USING (true);

-- Create trigger for commission_transactions updated_at
CREATE TRIGGER update_commission_transactions_updated_at
BEFORE UPDATE ON public.commission_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();