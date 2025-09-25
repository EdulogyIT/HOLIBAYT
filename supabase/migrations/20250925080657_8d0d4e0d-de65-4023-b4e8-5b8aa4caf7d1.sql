-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- Create enum for payment type
CREATE TYPE payment_type AS ENUM ('booking_fee', 'security_deposit', 'earnest_money', 'property_sale', 'monthly_rent');

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_type payment_type NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    security_deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Property owners can view payments for their properties" 
ON public.payments 
FOR SELECT 
USING (property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
));

-- RLS policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view bookings for their properties" 
ON public.bookings 
FOR SELECT 
USING (property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
));

CREATE POLICY "Property owners can update booking status" 
ON public.bookings 
FOR UPDATE 
USING (property_id IN (
    SELECT id FROM properties WHERE user_id = auth.uid()
));

-- Add updated_at trigger for payments
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for bookings
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_property_id ON public.payments(property_id);
CREATE INDEX idx_payments_stripe_session_id ON public.payments(stripe_checkout_session_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_dates ON public.bookings(check_in_date, check_out_date);