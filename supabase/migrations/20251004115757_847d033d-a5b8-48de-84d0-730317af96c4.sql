-- Add pets_allowed column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false;