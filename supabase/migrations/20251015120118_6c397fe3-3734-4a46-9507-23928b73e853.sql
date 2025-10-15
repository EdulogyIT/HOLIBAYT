-- Create lawyers table
CREATE TABLE public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  city TEXT NOT NULL,
  address TEXT,
  experience_years INTEGER,
  profile_photo_url TEXT,
  bio TEXT,
  consultation_fee NUMERIC(10,2),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'inactive')),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lawyers_city ON public.lawyers(city);
CREATE INDEX idx_lawyers_specializations ON public.lawyers USING GIN(specializations);
CREATE INDEX idx_lawyers_verified ON public.lawyers(verified);

-- RLS Policies for lawyers
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified lawyers"
  ON public.lawyers FOR SELECT
  USING (verified = true);

CREATE POLICY "Admins can manage all lawyers"
  ON public.lawyers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create lawyer_requests table
CREATE TABLE public.lawyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('consultation', 'contract_review', 'legal_assistance', 'general')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lawyer_requests_user ON public.lawyer_requests(user_id);
CREATE INDEX idx_lawyer_requests_lawyer ON public.lawyer_requests(lawyer_id);
CREATE INDEX idx_lawyer_requests_status ON public.lawyer_requests(status);

-- RLS Policies for lawyer_requests
ALTER TABLE public.lawyer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON public.lawyer_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
  ON public.lawyer_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests"
  ON public.lawyer_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_lawyers_updated_at
  BEFORE UPDATE ON public.lawyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lawyer_requests_updated_at
  BEFORE UPDATE ON public.lawyer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to notify users when their lawyer request is approved
CREATE OR REPLACE FUNCTION public.notify_lawyer_request_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lawyer_name TEXT;
  lawyer_email TEXT;
  lawyer_phone TEXT;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Get lawyer details
    SELECT full_name, email, phone INTO lawyer_name, lawyer_email, lawyer_phone
    FROM public.lawyers
    WHERE id = NEW.lawyer_id;
    
    -- Insert notification for user
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Lawyer Contact Approved',
      'Your request to contact ' || lawyer_name || ' has been approved. Contact: ' || lawyer_email || ' / ' || lawyer_phone,
      'lawyer_contact_approved',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_lawyer_request_approval
  AFTER UPDATE ON public.lawyer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lawyer_request_approval();