-- Optional: run if you already applied 001_profiles.sql. Fills display_name from OAuth
-- metadata (Google/Apple often send full_name or name instead of display_name).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display TEXT;
BEGIN
  display := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  )), '');
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, display)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
