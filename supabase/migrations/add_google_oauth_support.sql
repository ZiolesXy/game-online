-- Add Google OAuth support to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS provider_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT true;

-- Update existing users to have profile_completed = true
UPDATE users SET profile_completed = true WHERE profile_completed IS NULL;

-- Create index for provider lookups
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);

-- Function to handle Google OAuth user creation/update
CREATE OR REPLACE FUNCTION handle_google_oauth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a Google OAuth sign up
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    -- Upsert user profile to avoid duplicate with existing trigger
    INSERT INTO users (
      id, 
      email, 
      username, 
      full_name, 
      provider, 
      provider_id, 
      avatar_url,
      profile_completed,
      created_at, 
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      'google',
      NEW.raw_user_meta_data->>'sub',
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
      CASE 
        WHEN NEW.raw_user_meta_data->>'username' IS NOT NULL THEN true
        ELSE false
      END,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, users.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      provider = EXCLUDED.provider,
      provider_id = EXCLUDED.provider_id,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for Google OAuth users
DROP TRIGGER IF EXISTS on_auth_user_created_google ON auth.users;
CREATE TRIGGER on_auth_user_created_google
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_google_oauth_user();
