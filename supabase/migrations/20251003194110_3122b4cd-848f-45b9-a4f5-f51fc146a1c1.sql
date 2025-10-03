-- Add admin policies for blog_posts to allow viewing all blogs (including drafts)
CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::app_role
  )
);

-- Add admin policy to delete any blog post
CREATE POLICY "Admins can delete any blog post"
ON public.blog_posts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::app_role
  )
);

-- Add admin policy to update any blog post
CREATE POLICY "Admins can update any blog post"
ON public.blog_posts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::app_role
  )
);

-- Allow authenticated users to insert comments on any blog post
DROP POLICY IF EXISTS "Authenticated users can insert their own comments" ON public.blog_comments;

CREATE POLICY "Authenticated users can comment on any blog"
ON public.blog_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view all comments (not just on published posts)
DROP POLICY IF EXISTS "Anyone can view comments on published posts" ON public.blog_comments;

CREATE POLICY "Authenticated users can view all comments"
ON public.blog_comments
FOR SELECT
USING (auth.uid() IS NOT NULL);