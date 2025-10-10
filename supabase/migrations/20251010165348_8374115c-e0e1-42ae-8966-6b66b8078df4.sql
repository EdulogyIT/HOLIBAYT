-- Create host_kyc_submissions table
CREATE TABLE IF NOT EXISTS public.host_kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  
  -- Address Information
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Algeria',
  
  -- Identity Verification
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  id_expiry_date DATE NOT NULL,
  id_document_url TEXT,
  
  -- Proof of Address
  address_proof_type TEXT,
  address_proof_url TEXT,
  
  -- Banking Information (optional, for payouts)
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  iban TEXT,
  swift_code TEXT,
  
  -- Additional Information
  bio TEXT,
  languages_spoken TEXT[],
  hosting_experience TEXT,
  
  -- Status & Verification
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Add verified_host columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified_host BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.host_kyc_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for host_kyc_submissions
CREATE POLICY "Users can insert their own KYC submission"
  ON public.host_kyc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own KYC submission"
  ON public.host_kyc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending KYC submission"
  ON public.host_kyc_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all KYC submissions"
  ON public.host_kyc_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all KYC submissions"
  ON public.host_kyc_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for KYC status changes
CREATE OR REPLACE FUNCTION public.notify_kyc_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'KYC Approved'
        WHEN NEW.status = 'rejected' THEN 'KYC Rejected'
        WHEN NEW.status = 'requires_changes' THEN 'KYC Requires Changes'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your KYC has been approved! You can now get verified badges on your properties.'
        WHEN NEW.status = 'rejected' THEN 'Your KYC submission was rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'Not specified')
        WHEN NEW.status = 'requires_changes' THEN 'Your KYC submission requires changes. Please review and resubmit.'
      END,
      'kyc_' || NEW.status,
      NEW.id
    );
    
    -- Update profile if approved
    IF NEW.status = 'approved' THEN
      UPDATE public.profiles 
      SET 
        verified_host = true,
        kyc_approved_at = NOW()
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_kyc_status_changed
  AFTER UPDATE ON public.host_kyc_submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_kyc_status_change();

-- Create trigger for updated_at
CREATE TRIGGER update_host_kyc_submissions_updated_at
  BEFORE UPDATE ON public.host_kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();