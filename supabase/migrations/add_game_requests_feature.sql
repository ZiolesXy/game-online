-- Migration: Add Game Requests Feature
-- This migration adds admin roles, game requests table, and requests storage bucket

-- 1. Add admin role to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('user','admin')) DEFAULT 'user';

-- 2. Create game_requests table
CREATE TABLE IF NOT EXISTS public.game_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('Strategi','Aksi','Horor','Arcade','Puzzle')) DEFAULT 'Arcade',
  file_path text NOT NULL, -- path to uploaded zip file in requests bucket
  status text CHECK (status IN ('waiting','accepted','declined')) DEFAULT 'waiting',
  admin_notes text,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create indexes for game_requests
CREATE INDEX IF NOT EXISTS idx_game_requests_user_id ON public.game_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_game_requests_status ON public.game_requests(status);
CREATE INDEX IF NOT EXISTS idx_game_requests_created_at ON public.game_requests(created_at);

-- 4. Enable RLS on game_requests
ALTER TABLE public.game_requests ENABLE ROW LEVEL SECURITY;

-- 5. Create updated_at trigger for game_requests
DROP TRIGGER IF EXISTS handle_game_requests_updated_at ON public.game_requests;
CREATE TRIGGER handle_game_requests_updated_at
  BEFORE UPDATE ON public.game_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Create RLS policies for game_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.game_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.game_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON public.game_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.game_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.game_requests;

CREATE POLICY "Users can view their own requests" ON public.game_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.game_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON public.game_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'waiting');

CREATE POLICY "Admins can view all requests" ON public.game_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all requests" ON public.game_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- 7. Create requests storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('requests','requests', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Create storage policies for requests bucket
DROP POLICY IF EXISTS "Users can upload to requests bucket" ON storage.objects;
CREATE POLICY "Users can upload to requests bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'requests' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can read their own requests" ON storage.objects;
CREATE POLICY "Users can read their own requests" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'requests' AND 
    auth.uid() IS NOT NULL AND
    (auth.uid()::text = (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "Admins can read all requests" ON storage.objects;
CREATE POLICY "Admins can read all requests" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'requests' AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete requests" ON storage.objects;
CREATE POLICY "Admins can delete requests" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'requests' AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
