-- Add check-in and check-out times for short-stay properties
ALTER TABLE public.properties 
ADD COLUMN check_in_time TIME DEFAULT '15:00:00',
ADD COLUMN check_out_time TIME DEFAULT '11:00:00';

COMMENT ON COLUMN public.properties.check_in_time IS 'Check-in time for short-stay properties';
COMMENT ON COLUMN public.properties.check_out_time IS 'Check-out time for short-stay properties';

-- Create function to automatically send review notification after checkout
CREATE OR REPLACE FUNCTION public.send_review_notification_after_checkout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_title TEXT;
BEGIN
  -- Only for completed short-stay bookings
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Get property title
    SELECT title INTO property_title 
    FROM public.properties 
    WHERE id = NEW.property_id AND category = 'short-stay';
    
    IF property_title IS NOT NULL THEN
      -- Insert notification for review request
      INSERT INTO public.notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        'How was your stay?',
        'We hope you enjoyed your stay at "' || property_title || '". Please share your experience by leaving a review!',
        'review_request',
        NEW.id
      );
      
      -- Create auto-message from host to guest
      DECLARE
        conversation_id_var UUID;
        host_user_id UUID;
      BEGIN
        -- Get host user id
        SELECT user_id INTO host_user_id 
        FROM public.properties 
        WHERE id = NEW.property_id;
        
        -- Check if conversation exists
        SELECT id INTO conversation_id_var
        FROM public.conversations
        WHERE (user_id = NEW.user_id AND recipient_id = host_user_id)
           OR (user_id = host_user_id AND recipient_id = NEW.user_id)
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Create conversation if it doesn't exist
        IF conversation_id_var IS NULL THEN
          INSERT INTO public.conversations (user_id, recipient_id, property_id, conversation_type, subject)
          VALUES (host_user_id, NEW.user_id, NEW.property_id, 'property_inquiry', 'Review Request for ' || property_title)
          RETURNING id INTO conversation_id_var;
        END IF;
        
        -- Insert auto-message from host
        INSERT INTO public.messages (conversation_id, sender_id, content, message_type)
        VALUES (
          conversation_id_var,
          host_user_id,
          'Hi! We hope you had a wonderful stay at ' || property_title || '. Your feedback is very important to us. Would you mind sharing your experience by leaving a review? It helps us improve and helps other guests make informed decisions. Thank you!',
          'text'
        );
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for review notifications
DROP TRIGGER IF EXISTS trigger_send_review_notification ON public.bookings;
CREATE TRIGGER trigger_send_review_notification
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_review_notification_after_checkout();

-- Add RLS policy for review_request notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'System can create review notifications'
  ) THEN
    CREATE POLICY "System can create review notifications"
      ON public.notifications
      FOR INSERT
      WITH CHECK (type = 'review_request');
  END IF;
END
$$;