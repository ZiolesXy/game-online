-- Fix OAuth signup failures by temporarily disabling conflicting triggers
-- and letting the app handle user creation manually

-- 1) Drop both triggers that might conflict during OAuth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_google ON auth.users;

-- 2) Allow username to be NULL temporarily
ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;

-- 3) Create a simple function for manual user creation (used by app)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  base_username TEXT DEFAULT NULL,
  user_full_name TEXT DEFAULT NULL,
  user_provider TEXT DEFAULT 'email',
  user_provider_id TEXT DEFAULT NULL,
  user_avatar_url TEXT DEFAULT NULL
)
RETURNS public.users AS $$
DECLARE
  final_username TEXT;
  result public.users;
BEGIN
  -- Generate unique username
  IF base_username IS NULL OR base_username = '' THEN
    base_username := split_part(user_email, '@', 1);
  END IF;
  
  final_username := lower(regexp_replace(base_username, '[^a-z0-9_]+', '_', 'g'));
  
  -- Try with suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) LOOP
    final_username := base_username || '_' || substr(md5(random()::text), 1, 6);
  END LOOP;

  -- Insert user
  INSERT INTO public.users (
    id, email, username, full_name, provider, provider_id, avatar_url, 
    profile_completed, created_at, updated_at
  ) VALUES (
    user_id, user_email, final_username, user_full_name, user_provider, 
    user_provider_id, user_avatar_url, false, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    provider = EXCLUDED.provider,
    provider_id = EXCLUDED.provider_id,
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
