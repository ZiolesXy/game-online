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
    msg.includes('duplicate key value') ||
    msg.includes('email address is already in use')
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
  // Sign up new user
  static async signUp({ email, password, username, fullName }: SignUpData) {
    try {
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

  // Get user profile
  static async getUserProfile(userId: string): Promise<{ user: User | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

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
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

