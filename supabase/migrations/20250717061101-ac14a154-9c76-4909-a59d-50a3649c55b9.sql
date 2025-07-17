-- Add password_hash column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN password_hash text;