-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can insert their own blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Extend conversations table to support property inquiries and host-to-host messages
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'support' CHECK (conversation_type IN ('support', 'property_inquiry', 'host_to_host')),
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for conversations to include property inquiries and host messages
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view conversations they're involved in"
  ON public.conversations
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = recipient_id OR
    auth.uid() = admin_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role
    )
  );

-- Update insert policy to allow creating property inquiries and host-to-host messages
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update messages RLS to allow host-to-host messaging
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in conversations they're involved in"
  ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = auth.uid() 
         OR recipient_id = auth.uid() 
         OR admin_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

CREATE POLICY "Users can insert messages in conversations they're involved in"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE user_id = auth.uid() 
         OR recipient_id = auth.uid() 
         OR admin_id = auth.uid()
    )
  );