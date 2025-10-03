-- Insert demo blog posts with proper UUIDs
INSERT INTO blog_posts (id, user_id, title, author_name, content, category, status, image_url)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  'The Future of Real Estate in Algeria',
  'Holibayt Research Team',
  '<p>Algeria''s real estate market is undergoing a significant transformation...</p>',
  'Market Trends',
  'published',
  '/lovable-uploads/b974fb79-9873-41fb-b3ad-9b4bf38b8a77.png'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE title = 'The Future of Real Estate in Algeria');

-- Create notifications table for messages and property approvals
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'property_approval', 'property_rejection', 'booking', 'general')),
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;