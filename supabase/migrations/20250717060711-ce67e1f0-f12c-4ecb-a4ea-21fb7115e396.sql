-- Add role enum type
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';

-- Update RLS policies for profiles to allow admins to see all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
  OR auth.uid() = id
);

-- Update RLS policies for time_entries to allow admins to see all entries
CREATE POLICY "Admins can view all time entries" 
ON public.time_entries 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' 
  OR auth.uid() = user_id
);

-- Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic policies and recreate them using the function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all time entries" ON public.time_entries;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin' 
  OR auth.uid() = id
);

CREATE POLICY "Admins can view all time entries" 
ON public.time_entries 
FOR SELECT 
USING (
  public.get_current_user_role() = 'admin' 
  OR auth.uid() = user_id
);