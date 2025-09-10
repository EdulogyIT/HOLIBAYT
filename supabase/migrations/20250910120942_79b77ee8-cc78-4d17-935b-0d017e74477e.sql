-- Update the handle_new_user function to automatically assign admin role to @holibayt.com emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, role, language)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    CASE 
      WHEN NEW.email LIKE '%@holibayt.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    END,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;