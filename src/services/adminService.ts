import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

export class AdminService {
  // List users (basic search and pagination)
  static async listUsers(params?: { search?: string; limit?: number; offset?: number }) {
    const { search = '', limit = 25, offset = 0 } = params || {}
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(
          `username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
        ) as any
      }

      const { data, error } = await query
      if (error) throw error
      return { users: (data || []) as User[], error: null }
    } catch (e: any) {
      return { users: [] as User[], error: e?.message || 'Failed to list users' }
    }
  }

  // Ban user via RPC (server-side enforcement required)
  static async banUser(userId: string, reason?: string) {
    try {
      const { error } = await supabase.rpc('ban_user', { p_user_id: userId, p_reason: reason || null })
      if (error) throw error
      return { error: null }
    } catch (e: any) {
      return { error: e?.message || 'Failed to ban user' }
    }
  }

  // Unban user via RPC
  static async unbanUser(userId: string) {
    try {
      const { error } = await supabase.rpc('unban_user', { p_user_id: userId })
      if (error) throw error
      return { error: null }
    } catch (e: any) {
      return { error: e?.message || 'Failed to unban user' }
    }
  }

  // Kick user (force sign out) via RPC
  static async kickUser(userId: string) {
    try {
      const { error } = await supabase.rpc('kick_user', { p_user_id: userId })
      if (error) throw error
      return { error: null }
    } catch (e: any) {
      return { error: e?.message || 'Failed to kick user' }
    }
  }

  // Set user role (admin/user)
  static async setUserRole(userId: string, role: 'admin' | 'user') {
    try {
      const { error } = await supabase.rpc('set_user_role', { p_user_id: userId, p_role: role })
      if (error) throw error
      return { error: null }
    } catch (e: any) {
      return { error: e?.message || 'Failed to set user role' }
    }
  }
}
