-- Add host ad fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_host_ad BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS host_message TEXT,
ADD COLUMN IF NOT EXISTS pets_info TEXT,
ADD COLUMN IF NOT EXISTS passions TEXT,
ADD COLUMN IF NOT EXISTS hobbies TEXT;

-- Update languages_spoken if not already an array (it already exists)
-- No change needed for languages_spoken as it already exists

-- Create index for fetching host ads efficiently
CREATE INDEX IF NOT EXISTS idx_profiles_has_host_ad 
ON public.profiles(has_host_ad) 
WHERE has_host_ad = true;

-- Add years_hosting field for calculating hosting experience
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hosting_since DATE;