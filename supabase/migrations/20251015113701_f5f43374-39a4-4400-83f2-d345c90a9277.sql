-- Create rental_agreements table
CREATE TABLE IF NOT EXISTS public.rental_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  host_user_id UUID NOT NULL,
  tenant_user_id UUID,
  
  -- Lease Terms
  lease_duration_months INTEGER NOT NULL CHECK (lease_duration_months > 0),
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC(10,2) NOT NULL CHECK (monthly_rent > 0),
  deposit_amount NUMERIC(10,2) NOT NULL CHECK (deposit_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'DZD',
  
  -- Payment Terms
  payment_terms JSONB DEFAULT '{"payment_day": 1, "late_fee_percentage": 5, "grace_period_days": 3, "payment_method": "bank_transfer"}'::jsonb,
  
  -- Agreement Details
  special_clauses TEXT,
  house_rules JSONB DEFAULT '{}'::jsonb,
  utilities_included JSONB DEFAULT '{"water": false, "electricity": false, "gas": false, "internet": false, "maintenance": false}'::jsonb,
  
  -- Document & Status
  agreement_pdf_url TEXT,
  template_version TEXT DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_tenant', 'pending_host', 'active', 'completed', 'cancelled', 'terminated')),
  
  -- Signatures
  host_signed_at TIMESTAMP WITH TIME ZONE,
  host_signature_data JSONB,
  tenant_signed_at TIMESTAMP WITH TIME ZONE,
  tenant_signature_data JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- Add computed column for end_date
CREATE OR REPLACE FUNCTION calculate_end_date(start_d DATE, duration INTEGER)
RETURNS DATE AS $$
BEGIN
  RETURN start_d + (duration || ' months')::INTERVAL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enable RLS
ALTER TABLE public.rental_agreements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Hosts can view their own agreements"
  ON public.rental_agreements
  FOR SELECT
  USING (auth.uid() = host_user_id);

CREATE POLICY "Tenants can view their agreements"
  ON public.rental_agreements
  FOR SELECT
  USING (auth.uid() = tenant_user_id);

CREATE POLICY "Admins can view all agreements"
  ON public.rental_agreements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Hosts can create agreements for their properties"
  ON public.rental_agreements
  FOR INSERT
  WITH CHECK (
    auth.uid() = host_user_id 
    AND property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
  );

CREATE POLICY "Hosts can update their draft agreements"
  ON public.rental_agreements
  FOR UPDATE
  USING (auth.uid() = host_user_id AND status = 'draft')
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Tenants can sign pending agreements"
  ON public.rental_agreements
  FOR UPDATE
  USING (auth.uid() = tenant_user_id AND status = 'pending_tenant')
  WITH CHECK (auth.uid() = tenant_user_id AND tenant_signed_at IS NOT NULL);

CREATE POLICY "Admins can update all agreements"
  ON public.rental_agreements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rental_agreements_property ON public.rental_agreements(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_host ON public.rental_agreements(host_user_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_tenant ON public.rental_agreements(tenant_user_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON public.rental_agreements(status);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_dates ON public.rental_agreements(start_date);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_rental_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rental_agreements_updated_at
  BEFORE UPDATE ON public.rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rental_agreements_updated_at();

-- Function to notify users of agreement status changes
CREATE OR REPLACE FUNCTION public.notify_agreement_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  property_title TEXT;
BEGIN
  IF NEW.status != OLD.status THEN
    SELECT title INTO property_title
    FROM public.properties
    WHERE id = NEW.property_id;
    
    -- Notify tenant
    IF NEW.tenant_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.tenant_user_id,
        CASE 
          WHEN NEW.status = 'pending_tenant' THEN 'Agreement Ready for Signature'
          WHEN NEW.status = 'active' THEN 'Rental Agreement Active'
          WHEN NEW.status = 'terminated' THEN 'Rental Agreement Terminated'
        END,
        CASE 
          WHEN NEW.status = 'pending_tenant' THEN 'Your rental agreement for "' || property_title || '" is ready for your signature.'
          WHEN NEW.status = 'active' THEN 'Your rental agreement for "' || property_title || '" is now active!'
          WHEN NEW.status = 'terminated' THEN 'Your rental agreement for "' || property_title || '" has been terminated.'
        END,
        'rental_agreement',
        NEW.id
      );
    END IF;
    
    -- Notify host
    IF NEW.status IN ('active', 'cancelled') THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.host_user_id,
        CASE 
          WHEN NEW.status = 'active' THEN 'Agreement Signed'
          WHEN NEW.status = 'cancelled' THEN 'Agreement Cancelled'
        END,
        CASE 
          WHEN NEW.status = 'active' THEN 'Rental agreement for "' || property_title || '" has been fully signed!'
          WHEN NEW.status = 'cancelled' THEN 'Rental agreement for "' || property_title || '" was cancelled.'
        END,
        'rental_agreement',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_agreement_status_change
  AFTER UPDATE ON public.rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_agreement_status_change();

-- Create storage bucket for rental agreement PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rental-agreements', 'rental-agreements', false, 10485760, ARRAY['application/pdf', 'text/html'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for rental-agreements bucket
CREATE POLICY "Hosts can upload their agreement PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'rental-agreements' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own agreement PDFs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'rental-agreements' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Admins can view all agreement PDFs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'rental-agreements' 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'::app_role
    )
  );