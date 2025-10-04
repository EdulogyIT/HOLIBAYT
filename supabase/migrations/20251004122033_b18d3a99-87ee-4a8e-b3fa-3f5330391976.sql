-- Add rating and superhost columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_superhost BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create reviews table for short stay properties
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  cleanliness_rating NUMERIC(2,1) CHECK (cleanliness_rating >= 0 AND cleanliness_rating <= 5),
  accuracy_rating NUMERIC(2,1) CHECK (accuracy_rating >= 0 AND accuracy_rating <= 5),
  checkin_rating NUMERIC(2,1) CHECK (checkin_rating >= 0 AND checkin_rating <= 5),
  communication_rating NUMERIC(2,1) CHECK (communication_rating >= 0 AND communication_rating <= 5),
  location_rating NUMERIC(2,1) CHECK (location_rating >= 0 AND location_rating <= 5),
  value_rating NUMERIC(2,1) CHECK (value_rating >= 0 AND value_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(booking_id, user_id)
);

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews for active properties"
  ON public.reviews FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE status = 'active'
    )
  );

CREATE POLICY "Users can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    booking_id IN (
      SELECT id FROM public.bookings 
      WHERE user_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update property and host ratings
CREATE OR REPLACE FUNCTION public.update_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update property average rating
  UPDATE public.properties
  SET 
    features = COALESCE(features, '{}'::jsonb) || 
    jsonb_build_object(
      'average_rating', (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM public.reviews
        WHERE property_id = NEW.property_id
      ),
      'total_reviews', (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE property_id = NEW.property_id
      )
    )
  WHERE id = NEW.property_id;

  -- Update host average rating and total reviews
  UPDATE public.profiles
  SET 
    average_rating = (
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      JOIN public.properties p ON r.property_id = p.id
      WHERE p.user_id = profiles.id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews r
      JOIN public.properties p ON r.property_id = p.id
      WHERE p.user_id = profiles.id
    )
  WHERE id = (
    SELECT user_id FROM public.properties WHERE id = NEW.property_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update ratings when a review is added or updated
CREATE TRIGGER update_ratings_on_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_property_ratings();