-- First, let's check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create the trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now let's manually create a profile for the existing user
INSERT INTO public.profiles (id, username, first_name, last_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data ->> 'username', split_part(email, '@', 1)) as username,
  raw_user_meta_data ->> 'first_name' as first_name,
  raw_user_meta_data ->> 'last_name' as last_name,
  'user'::user_role as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);