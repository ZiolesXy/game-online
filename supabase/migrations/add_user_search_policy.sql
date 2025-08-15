-- Migration: Add RLS policy to allow users to search other users
-- This fixes the "user not found" bug in the add friend feature

-- Add policy to allow authenticated users to search for other users
CREATE POLICY "Users can search other users" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() != id);
