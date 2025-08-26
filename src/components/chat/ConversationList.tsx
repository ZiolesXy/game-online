import { useState, useEffect } from 'react'
import { ChatService } from '../../services/chatService'
import type { ConversationWithUser } from '../../lib/supabase'

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationWithUser) => void
  selectedConversationId?: string
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    const { conversations, error } = await ChatService.getConversations()
    
    if (error) {
      setError(error)
    } else {
      setConversations(conversations)
    }
    
    setLoading(false)
  }

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadConversations}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.37l-3.42 1.42c-.362.15-.766-.04-.766-.44v-2.77A8.001 8.001 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <p className="text-gray-400">No conversations yet</p>
          <p className="text-sm text-gray-500 mt-1">Start chatting with your friends!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-gray-100">Messages</h2>
      </div>
      
      <div className="divide-y divide-white/10">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer transition-colors duration-200 hover:bg-white/5 ${
              selectedConversationId === conversation.id ? 'bg-blue-600/20 border-r-2 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {conversation.other_user.avatar_url ? (
                    <img
                      src={conversation.other_user.avatar_url}
                      alt={conversation.other_user.username}
                      loading="lazy"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium text-lg">
                      {conversation.other_user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Online status indicator - you can implement this later */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-100 truncate">
                    {conversation.other_user.full_name || conversation.other_user.username}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {formatLastMessageTime(conversation.last_message_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-400 truncate">
                    {conversation.last_message 
                      ? truncateMessage(conversation.last_message.content)
                      : 'No messages yet'
                    }
                  </p>
                  
                  {/* Unread message indicator - you can implement this later */}
                  {/* <div className="w-2 h-2 bg-blue-600 rounded-full"></div> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
