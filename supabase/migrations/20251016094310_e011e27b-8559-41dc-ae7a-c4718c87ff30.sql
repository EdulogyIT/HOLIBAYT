-- Fix testimonials (client_reviews) RLS policy to allow admin deletion
-- The current policy checks for wrong JWT claim, should use has_role() function

-- Drop existing incorrect policy
DROP POLICY IF EXISTS "Admins manage reviews" ON client_reviews;

-- Create new policy using the correct has_role() function
CREATE POLICY "Admins can manage all testimonials"
ON client_reviews
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));