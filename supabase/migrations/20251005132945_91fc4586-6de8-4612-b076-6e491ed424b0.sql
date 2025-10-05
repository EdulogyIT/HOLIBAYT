-- Add RLS policy for admins to delete reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' 
    AND policyname = 'Admins can delete any review'
  ) THEN
    CREATE POLICY "Admins can delete any review"
      ON public.reviews
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'::app_role
        )
      );
  END IF;
END
$$;

-- Add policy for property owners to delete reviews on their properties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' 
    AND policyname = 'Property owners can delete reviews on their properties'
  ) THEN
    CREATE POLICY "Property owners can delete reviews on their properties"
      ON public.reviews
      FOR DELETE
      USING (
        property_id IN (
          SELECT id FROM properties WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;