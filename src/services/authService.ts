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

      // Derive basic fields from auth user metadata
      const email: string | null = authUser.email || null
      const rawMeta = authUser.user_metadata || {}
      const username = (rawMeta.username as string) || (email ? (email.split('@')[0]) : null)
      const full_name = (rawMeta.full_name as string) || (rawMeta.name as string) || null

      // Generate a safe fallback username if needed
      let safeUsername = username || (email ? email.split('@')[0] : null) || `user_${String(authUser.id).slice(0, 8)}`
      // Ensure it's only allowed chars
      safeUsername = String(safeUsername).toLowerCase().replace(/[^a-z0-9_]/g, '_')

      // Use only basic columns that exist in original schema
      let lastErr: any = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const candidate = attempt === 0 ? safeUsername : `${safeUsername}_${Math.floor(Math.random() * 10000)}`
        
        console.log('Attempting to insert user with basic fields:', { id: authUser.id, email, username: candidate, full_name })
        
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: authUser.id,
            email,
            username: candidate,
            full_name
          }, { onConflict: 'id' })
          .select()
          .single()

        if (!error) {
          console.log('Successfully created/updated user:', data)
          return { user: data as unknown as User, error: null }
        }
        
        console.error('Insert attempt failed:', error)
        lastErr = error
        
        // Continue retrying on unique violations
        const msg = String(error.message || '').toLowerCase()
        const code = (error as any).code
        if (!(msg.includes('unique') || msg.includes('duplicate') || code === '23505')) {
          break
        }
      }

      if (lastErr) throw lastErr

      // Final fallback: read back user profile
      const finalRead = await this.getUserProfile(authUser.id)
      return { user: finalRead.user, error: finalRead.error }
    } catch (error: any) {
      console.error('ensureUserRecord failed:', error)
      // If insert fails due to duplicate (race), try to read again
      try {
        const { data, error: readErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser?.id)
          .single()

        if (readErr) throw readErr
        return { user: data as unknown as User, error: null }
      } catch (e: any) {
        return { user: null, error: e?.message || error?.message || 'Failed to ensure user record' }
      }
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

