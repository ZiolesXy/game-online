import { supabase } from '../lib/supabase'
import type { Friend, FriendWithUser, User } from '../lib/supabase'

export class FriendService {
  // Send friend request
  static async sendFriendRequest(friendId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .single()

      if (existing) {
        throw new Error('Friend request already exists')
      }

      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { friendship: data, error: null }
    } catch (error: any) {
      return { friendship: null, error: error.message }
    }
  }

  // Accept friend request
  static async acceptFriendRequest(friendshipId: string) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select()
        .single()

      if (error) throw error

      return { friendship: data, error: null }
    } catch (error: any) {
      return { friendship: null, error: error.message }
    }
  }

  // Reject/Remove friend request
  static async rejectFriendRequest(friendshipId: string) {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Block user
  static async blockUser(friendshipId: string) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'blocked' })
        .eq('id', friendshipId)
        .select()
        .single()

      if (error) throw error

      return { friendship: data, error: null }
    } catch (error: any) {
      return { friendship: null, error: error.message }
    }
  }

  // Get user's friends
  static async getFriends(status: 'pending' | 'accepted' | 'blocked' = 'accepted'): Promise<{ friends: FriendWithUser[], error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get friendships where current user is the sender (user_id)
      const { data: sentFriends, error: sentError } = await supabase
        .from('friends')
        .select(`
          *,
          friend:friend_id (
            id,
            email,
            username,
            full_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', status)

      if (sentError) throw sentError

      // Get friendships where current user is the receiver (friend_id)
      const { data: receivedFriends, error: receivedError } = await supabase
        .from('friends')
        .select(`
          *,
          friend:user_id (
            id,
            email,
            username,
            full_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', status)

      if (receivedError) throw receivedError

      // Combine both arrays and remove duplicates
      const allFriends = [...(sentFriends || []), ...(receivedFriends || [])]
      const uniqueFriends = allFriends.filter((friend, index, self) => 
        index === self.findIndex(f => f.id === friend.id)
      )

      // Sort by creation date
      uniqueFriends.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return { friends: uniqueFriends, error: null }
    } catch (error: any) {
      return { friends: [], error: error.message }
    }
  }

  // Get pending friend requests (received)
  static async getPendingRequests(): Promise<{ requests: FriendWithUser[], error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          friend:user_id (
            id,
            email,
            username,
            full_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { requests: data || [], error: null }
    } catch (error: any) {
      return { requests: [], error: error.message }
    }
  }

  // Search users by username or email
  static async searchUsers(query: string): Promise<{ users: User[], error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10)

      if (error) throw error

      return { users: data || [], error: null }
    } catch (error: any) {
      return { users: [], error: error.message }
    }
  }

  // Get friendship status between current user and another user
  static async getFriendshipStatus(friendId: string): Promise<{ friendship: Friend | null, error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { friendship: data || null, error: null }
    } catch (error: any) {
      return { friendship: null, error: error.message }
    }
  }
}
