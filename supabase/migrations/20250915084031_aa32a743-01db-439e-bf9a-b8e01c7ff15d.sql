-- Create a secure contact requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact requests
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Property owners can view requests for their properties
CREATE POLICY "Property owners can view their contact requests" 
ON public.contact_requests 
FOR SELECT 
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

-- Policy: Anyone can create contact requests
CREATE POLICY "Anyone can create contact requests" 
ON public.contact_requests 
FOR INSERT 
WITH CHECK (true);

-- Policy: Property owners can update request status
CREATE POLICY "Property owners can update request status" 
ON public.contact_requests 
FOR UPDATE 
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update properties RLS policy to hide contact information from public
DROP POLICY "Anyone can view active properties" ON public.properties;

-- Create new policy that excludes sensitive contact information
CREATE POLICY "Anyone can view active properties without contact info" 
ON public.properties 
FOR SELECT 
USING (status = 'active'::text);

-- Note: The application layer will need to handle filtering out contact fields for public access