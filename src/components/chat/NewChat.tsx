import { useState, useEffect } from 'react'
import { FriendService } from '../../services/friendService'
import { ChatService } from '../../services/chatService'
import type { FriendWithUser, ConversationWithUser } from '../../lib/supabase'

interface NewChatProps {
  onChatCreated: (conversation: ConversationWithUser) => void
  onClose: () => void
}

export function NewChat({ onChatCreated, onClose }: NewChatProps) {
  const [friends, setFriends] = useState<FriendWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    setLoading(true)
    const { friends, error } = await FriendService.getFriends('accepted')
    
    if (error) {
      setError(error)
    } else {
      setFriends(friends)
    }
    
    setLoading(false)
  }

  const handleStartChat = async (friend: FriendWithUser) => {
    setCreating(friend.friend.id)
    setError('')

    const { conversation, error } = await ChatService.getOrCreateConversation(friend.friend.id)
    
    if (error) {
      setError(error)
    } else if (conversation) {
      // Create a ConversationWithUser object
      const conversationWithUser: ConversationWithUser = {
        ...conversation,
        other_user: friend.friend
      }
      onChatCreated(conversationWithUser)
    }
    
    setCreating(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Start New Chat</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4">
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-400">No friends to chat with</p>
            <p className="text-sm text-gray-500 mt-1">Add some friends first!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="p-4 hover:bg-white/5 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {friend.friend.avatar_url ? (
                        <img
                          src={friend.friend.avatar_url}
                          alt={friend.friend.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {friend.friend.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-100">
                        {friend.friend.full_name || friend.friend.username}
                      </h3>
                      <p className="text-sm text-gray-400">@{friend.friend.username}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartChat(friend)}
                    disabled={creating === friend.friend.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {creating === friend.friend.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Starting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.37l-3.42 1.42c-.362.15-.766-.04-.766-.44v-2.77A8.001 8.001 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                        <span>Chat</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
