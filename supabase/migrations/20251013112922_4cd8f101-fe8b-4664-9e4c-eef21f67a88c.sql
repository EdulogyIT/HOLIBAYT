-- Add foreign key relationship between host_kyc_submissions and profiles
ALTER TABLE public.host_kyc_submissions 
  DROP CONSTRAINT IF EXISTS host_kyc_submissions_user_id_fkey;

ALTER TABLE public.host_kyc_submissions 
  ADD CONSTRAINT host_kyc_submissions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_host_kyc_submissions_user_id 
  ON public.host_kyc_submissions(user_id);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_host_kyc_submissions_status 
  ON public.host_kyc_submissions(status);