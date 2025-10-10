-- Add fees column to properties table for flexible fee structure
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS fees JSONB DEFAULT '{
  "cleaning_fee": {"enabled": false, "amount": 0},
  "service_fee": {"enabled": false, "amount": 0, "type": "percentage"},
  "security_deposit": {"enabled": false, "amount": 0, "refundable": true},
  "other_fees": []
}'::jsonb;

-- Create function to notify users when they receive a new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_user_id UUID;
  sender_name TEXT;
BEGIN
  -- Get sender name
  SELECT name INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  
  -- Determine recipient based on conversation
  SELECT 
    CASE 
      WHEN c.user_id = NEW.sender_id THEN c.recipient_id
      WHEN c.recipient_id = NEW.sender_id THEN c.user_id
      ELSE c.admin_id
    END INTO recipient_user_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;
  
  -- Insert notification for recipient (if not the sender)
  IF recipient_user_id IS NOT NULL AND recipient_user_id != NEW.sender_id THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      recipient_user_id,
      'New Message',
      COALESCE(sender_name, 'Someone') || ' sent you a message',
      'message',
      NEW.conversation_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function after each message insert
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();