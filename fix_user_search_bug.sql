-- Fix for "user not found" bug in add friend feature
-- Run this SQL in your Supabase SQL Editor

-- Add RLS policy to allow authenticated users to search for other users
CREATE POLICY "Users can search other users" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() != id);
