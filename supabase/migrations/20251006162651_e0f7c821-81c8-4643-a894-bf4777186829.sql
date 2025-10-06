-- Fix notification type constraint to include all types used by triggers
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'message'::text,
  'property_approval'::text,
  'property_approved'::text,
  'property_rejection'::text,
  'booking'::text,
  'booking_created'::text,
  'review_created'::text,
  'review_request'::text,
  'general'::text
]));