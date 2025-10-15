-- Phase 1: Database Schema Enhancements for Admin Dashboard

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog analytics table
CREATE TABLE IF NOT EXISTS public.blog_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  view_duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property views tracking table
CREATE TABLE IF NOT EXISTS public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing tables
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trust_score NUMERIC DEFAULT 0;

ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Create unique index on blog slug
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts(slug) WHERE slug IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_audit_log
CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit log" ON public.admin_audit_log
  FOR INSERT WITH CHECK (true);

-- RLS Policies for blog_analytics
CREATE POLICY "Anyone can track blog views" ON public.blog_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view blog analytics" ON public.blog_analytics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for message_templates
CREATE POLICY "Admins can manage message templates" ON public.message_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for property_views
CREATE POLICY "Anyone can track property views" ON public.property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Property owners can view their property analytics" ON public.property_views
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM public.properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all property views" ON public.property_views
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create functions for dashboard metrics

-- Function to calculate Platform GMV
CREATE OR REPLACE FUNCTION public.calculate_platform_gmv(days_back INT DEFAULT 30)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_amount), 0)
  FROM public.bookings
  WHERE status = 'completed'
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
$$;

-- Function to calculate average booking value
CREATE OR REPLACE FUNCTION public.calculate_avg_booking_value(days_back INT DEFAULT 30)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(total_amount), 0)
  FROM public.bookings
  WHERE status = 'completed'
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
$$;

-- Function to calculate conversion rate
CREATE OR REPLACE FUNCTION public.calculate_conversion_rate(days_back INT DEFAULT 30)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM public.bookings WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL) AS bookings,
      (SELECT COUNT(*) FROM public.contact_requests WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL) AS inquiries
  )
  SELECT 
    CASE 
      WHEN inquiries > 0 THEN ROUND((bookings::NUMERIC / inquiries::NUMERIC) * 100, 2)
      ELSE 0
    END
  FROM stats;
$$;

-- Function to calculate average response time
CREATE OR REPLACE FUNCTION public.calculate_avg_response_time()
RETURNS INTERVAL
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH response_times AS (
    SELECT 
      c.id,
      MIN(m2.created_at) - MIN(m1.created_at) AS response_time
    FROM public.conversations c
    JOIN public.messages m1 ON m1.conversation_id = c.id
    JOIN public.messages m2 ON m2.conversation_id = c.id
    WHERE m1.sender_id = c.user_id
      AND m2.sender_id != c.user_id
      AND m2.created_at > m1.created_at
      AND c.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY c.id
  )
  SELECT COALESCE(AVG(response_time), INTERVAL '0 seconds')
  FROM response_times;
$$;

-- Create trigger to auto-generate blog slug
CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_blog_slug_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_blog_slug();

-- Create trigger to update property view count
CREATE OR REPLACE FUNCTION public.increment_property_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.properties
  SET view_count = view_count + 1
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_property_view_count_trigger
  AFTER INSERT ON public.property_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_property_view_count();

-- Create trigger to update blog view count
CREATE OR REPLACE FUNCTION public.increment_blog_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = NEW.blog_post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_blog_view_count_trigger
  AFTER INSERT ON public.blog_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_blog_view_count();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_blog_post_id ON public.blog_analytics(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created_at ON public.property_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_admin ON public.conversations(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_publish ON public.blog_posts(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;