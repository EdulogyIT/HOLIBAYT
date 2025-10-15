-- Add columns for Things to Know section to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS house_rules JSONB DEFAULT '{"smoking": false, "pets": false, "events": false, "quietHours": "22:00-08:00"}'::jsonb,
ADD COLUMN IF NOT EXISTS safety_features JSONB DEFAULT '{"smokeAlarm": false, "coAlarm": false, "firstAidKit": false, "fireExtinguisher": false, "securityCameras": false}'::jsonb;

-- Add check constraint for cancellation_policy
ALTER TABLE public.properties
ADD CONSTRAINT cancellation_policy_check 
CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict'));

-- Add comment for documentation
COMMENT ON COLUMN public.properties.cancellation_policy IS 'Cancellation policy: flexible, moderate, or strict';
COMMENT ON COLUMN public.properties.house_rules IS 'JSON object containing house rules like smoking, pets, events, quietHours';
COMMENT ON COLUMN public.properties.safety_features IS 'JSON object containing safety features like smokeAlarm, coAlarm, firstAidKit, etc.';