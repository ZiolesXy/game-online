import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

export interface SignUpData {
  email: string
  password: string
  username: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

// Helper to translate Supabase auth errors into user-friendly messages (ID)
function mapAuthErrorMessage(rawMessage: string): string {
  const msg = (rawMessage || '').toLowerCase()

  // Wrong credentials or account not found
  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid email or password') ||
    msg.includes('invalid_grant') ||
    msg.includes('invalid credentials') ||
    msg.includes('email not found') ||
    msg.includes('user not found')
  ) {
    return 'Email atau password salah, atau akun belum terdaftar.'
  }

  // Email already registered on sign up
  if (
    msg.includes('user already registered') ||
    msg.includes('already registered') ||
    msg.includes('already exists') ||
    msg.includes('user already exists') ||
    msg.includes('email already exists') ||
    msg.includes('email is already in use') ||
    msg.includes('email address is already in use') ||
    msg.includes('duplicate key value') ||
    msg.includes('unique constraint') ||
    msg.includes('duplicate')
  ) {
    return 'Email sudah terdaftar. Silakan masuk.'
  }

  // Email not confirmed
  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return 'Email belum terverifikasi. Silakan cek kotak masuk untuk verifikasi.'
  }

  // Generic fallback
  return 'Terjadi kesalahan saat proses autentikasi. Coba lagi nanti.'
}

export class AuthService {
  // Ensure a row exists in public.users for the authenticated user (Google/email)
  static async ensureUserRecord(authUser?: any): Promise<{ user: User | null; error: string | null }> {
    try {
      // If authUser not provided, fetch current session user
      if (!authUser) {
        const { data: { user } } = await supabase.auth.getUser()
        authUser = user
      }

      if (!authUser?.id) {
        return { user: null, error: 'No authenticated user' }
      }

      // Try to fetch existing profile
      const existing = await this.getUserProfile(authUser.id)
      if (existing.user) {
        return existing
      }

      // Derive fields from auth user metadata
      const email: string = authUser.email || ''
      const rawMeta = authUser.user_metadata || {}
      const appMeta = authUser.app_metadata || {}
      
      const baseUsername = (rawMeta.username as string) || 
                          (rawMeta.preferred_username as string) || 
                          (email ? email.split('@')[0] : null)
      const fullName = (rawMeta.full_name as string) || 
                      (rawMeta.name as string) || 
                      null
      const provider = appMeta.provider || 'email'
      const providerId = rawMeta.sub || rawMeta.provider_id || null
      const avatarUrl = rawMeta.avatar_url || rawMeta.picture || null

      console.log('Creating user profile via SQL function:', { 
        id: authUser.id, email, baseUsername, provider 
      })

      // Use the new SQL function to create user profile safely
      const { data, error } = await supabase.rpc('create_user_profile', {
        user_id: authUser.id,
        user_email: email,
        base_username: baseUsername,
        user_full_name: fullName,
        user_provider: provider,
        user_provider_id: providerId,
        user_avatar_url: avatarUrl
      })

      if (error) {
        console.error('create_user_profile failed:', error)
        throw error
      }

      console.log('Successfully created user profile:', data)
      return { user: data as User, error: null }

    } catch (error: any) {
      console.error('ensureUserRecord failed:', error)
      return { user: null, error: error?.message || 'Failed to ensure user record' }
    }
  }
  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // With HashRouter, ensure redirect includes the hash route so the client handles it
          redirectTo: `${window.location.origin}/#/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: mapAuthErrorMessage(error.message) }
    }
  }

  // Check if profile completion is needed for Google OAuth users
  static async checkProfileCompletion(userId: string): Promise<{ needsCompletion: boolean; error: string | null }> {
    try {
      const { user, error } = await this.getUserProfile(userId)
      
      if (error) {
        return { needsCompletion: false, error }
      }
      
      if (!user) {
        return { needsCompletion: true, error: null }
      }
      
      // For now, assume profile is complete if user exists with username
      // We can make this more strict later when we add the profile_completed column
      const needsCompletion = !user.username
      
      return { needsCompletion, error: null }
    } catch (error: any) {
      return { needsCompletion: false, error: error.message }
    }
  }

  // Complete Google OAuth profile
  static async completeGoogleProfile(userId: string, profileData: { username: string, fullName?: string }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          username: profileData.username,
          full_name: profileData.fullName || null,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { user: data, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Check if email already exists in users table
  static async emailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)

      if (error) {
        // If policy blocks access, assume not exists to avoid false positives
        console.warn('emailExists check error:', error)
        return false
      }

      return Array.isArray(data) && data.length > 0
    } catch (e) {
      console.warn('emailExists exception:', e)
      return false
    }
  }

  // Sign up new user
  static async signUp({ email, password, username, fullName }: SignUpData) {
    try {
      // Pre-check: prevent registering an already-registered email
      const exists = await AuthService.emailExists(email)
      if (exists) {
        return { user: null, error: 'Email sudah terdaftar. Silakan masuk.' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || ''
          }
        }
      })

      if (error) throw error

      // Supabase behavior: when signing up with an existing email, it may return a user
      // with empty identities array and no error. Treat this as already registered.
      const identities = (data as any)?.user?.identities
      if (Array.isArray(identities) && identities.length === 0) {
        return { user: null, error: 'Email sudah terdaftar. Silakan masuk.' }
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: mapAuthErrorMessage(error.message) }
    }
  }

  // Sign in existing user
  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: mapAuthErrorMessage(error.message) }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Get user profile (resilient if not found)
  static async getUserProfile(userId: string): Promise<{ user: User | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      return { user: data, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { user: data, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  }
}

