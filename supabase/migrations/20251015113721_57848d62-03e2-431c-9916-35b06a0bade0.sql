-- Fix security warnings: Set search_path for functions

-- Fix calculate_end_date function
DROP FUNCTION IF EXISTS calculate_end_date(DATE, INTEGER);
CREATE OR REPLACE FUNCTION calculate_end_date(start_d DATE, duration INTEGER)
RETURNS DATE 
LANGUAGE plpgsql 
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN start_d + (duration || ' months')::INTERVAL;
END;
$$;

-- Fix update_rental_agreements_updated_at function
DROP FUNCTION IF EXISTS public.update_rental_agreements_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_rental_agreements_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_rental_agreements_updated_at
  BEFORE UPDATE ON public.rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rental_agreements_updated_at();

-- Fix notify_agreement_status_change function
DROP FUNCTION IF EXISTS public.notify_agreement_status_change() CASCADE;
CREATE OR REPLACE FUNCTION public.notify_agreement_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_title TEXT;
BEGIN
  IF NEW.status != OLD.status THEN
    SELECT title INTO property_title
    FROM public.properties
    WHERE id = NEW.property_id;
    
    -- Notify tenant
    IF NEW.tenant_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.tenant_user_id,
        CASE 
          WHEN NEW.status = 'pending_tenant' THEN 'Agreement Ready for Signature'
          WHEN NEW.status = 'active' THEN 'Rental Agreement Active'
          WHEN NEW.status = 'terminated' THEN 'Rental Agreement Terminated'
        END,
        CASE 
          WHEN NEW.status = 'pending_tenant' THEN 'Your rental agreement for "' || property_title || '" is ready for your signature.'
          WHEN NEW.status = 'active' THEN 'Your rental agreement for "' || property_title || '" is now active!'
          WHEN NEW.status = 'terminated' THEN 'Your rental agreement for "' || property_title || '" has been terminated.'
        END,
        'rental_agreement',
        NEW.id
      );
    END IF;
    
    -- Notify host
    IF NEW.status IN ('active', 'cancelled') THEN
      INSERT INTO public.notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.host_user_id,
        CASE 
          WHEN NEW.status = 'active' THEN 'Agreement Signed'
          WHEN NEW.status = 'cancelled' THEN 'Agreement Cancelled'
        END,
        CASE 
          WHEN NEW.status = 'active' THEN 'Rental agreement for "' || property_title || '" has been fully signed!'
          WHEN NEW.status = 'cancelled' THEN 'Rental agreement for "' || property_title || '" was cancelled.'
        END,
        'rental_agreement',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER notify_agreement_status_change
  AFTER UPDATE ON public.rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_agreement_status_change();