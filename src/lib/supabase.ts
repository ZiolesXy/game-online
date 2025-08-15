import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

export interface FriendWithUser extends Friend {
  friend: User
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface ConversationWithUser extends Conversation {
  other_user: User
  last_message?: Message
}

export interface MessageWithSender extends Message {
  sender: User
}
