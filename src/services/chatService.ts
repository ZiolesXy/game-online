import { supabase } from '../lib/supabase'
import type { Conversation, Message, ConversationWithUser, MessageWithSender } from '../lib/supabase'

export class ChatService {
  // Create or get existing conversation between two users
  static async getOrCreateConversation(friendId: string): Promise<{ conversation: Conversation | null, error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // First, try to find existing conversation
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${friendId}),and(participant_1.eq.${friendId},participant_2.eq.${user.id})`)
        .single()

      if (findError && findError.code !== 'PGRST116') throw findError

      if (existingConversation) {
        return { conversation: existingConversation, error: null }
      }

      // Create new conversation if it doesn't exist
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: friendId
        })
        .select()
        .single()

      if (createError) throw createError

      return { conversation: newConversation, error: null }
    } catch (error: any) {
      return { conversation: null, error: error.message }
    }
  }

  // Get all conversations for the current user
  static async getConversations(): Promise<{ conversations: ConversationWithUser[], error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!inner (
            id,
            content,
            sender_id,
            created_at,
            is_read
          )
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Process conversations to include other user info and last message
      const conversationsWithUsers: ConversationWithUser[] = []

      for (const conv of data || []) {
        const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1

        // Get other user info
        const { data: otherUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single()

        if (userError) continue

        // Get last message
        const { data: lastMessage, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        conversationsWithUsers.push({
          ...conv,
          other_user: otherUser,
          last_message: messageError ? undefined : lastMessage
        })
      }

      return { conversations: conversationsWithUsers, error: null }
    } catch (error: any) {
      return { conversations: [], error: error.message }
    }
  }

  // Get messages for a specific conversation
  static async getMessages(conversationId: string, limit: number = 50): Promise<{ messages: MessageWithSender[], error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) throw error

      return { messages: data || [], error: null }
    } catch (error: any) {
      return { messages: [], error: error.message }
    }
  }

  // Send a message
  static async sendMessage(conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<{ message: Message | null, error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType
        })
        .select()
        .single()

      if (error) throw error

      return { message: data, error: null }
    } catch (error: any) {
      return { message: null, error: error.message }
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get unread message count for a conversation
  static async getUnreadCount(conversationId: string): Promise<{ count: number, error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return { count: count || 0, error: null }
    } catch (error: any) {
      return { count: 0, error: error.message }
    }
  }

  // Subscribe to real-time messages for a conversation
  static subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()
  }

  // Subscribe to real-time conversation updates
  static subscribeToConversations(callback: (conversation: Conversation) => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        async (payload) => {
          const conversation = payload.new as Conversation
          // Only notify if user is a participant
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser && (conversation.participant_1 === currentUser.id || conversation.participant_2 === currentUser.id)) {
            callback(conversation)
          }
        }
      )
      .subscribe()
  }
}
