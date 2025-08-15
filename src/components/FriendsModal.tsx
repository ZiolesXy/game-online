import { useState, useEffect } from 'react'
import { FriendService } from '../services/friendService'
import { ChatService } from '../services/chatService'
import type { FriendWithUser, ConversationWithUser } from '../lib/supabase'

interface FriendsModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (conversation: ConversationWithUser) => void
}

export function FriendsModal({ isOpen, onClose, onStartChat }: FriendsModalProps) {
  const [friends, setFriends] = useState<FriendWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadFriends()
    }
  }, [isOpen])

  const loadFriends = async () => {
    setLoading(true)
    setError('')
    
    const { friends, error } = await FriendService.getFriends('accepted')
    
    if (error) {
      setError(error)
    } else {
      setFriends(friends)
    }
    
    setLoading(false)
  }

  const handleStartChat = async (friend: FriendWithUser) => {
    setStartingChat(friend.friend.id)
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
      onStartChat(conversationWithUser)
      onClose()
    }
    
    setStartingChat(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">Friends</h2>
                <p className="text-sm text-gray-400">Start a chat with your friends</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {error && (
            <div className="p-4">
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 px-6">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-400 font-medium">No friends yet</p>
              <p className="text-sm text-gray-500 mt-2">Add some friends to start chatting!</p>
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
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {friend.friend.avatar_url ? (
                            <img
                              src={friend.friend.avatar_url}
                              alt={friend.friend.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium text-lg">
                              {friend.friend.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Online status indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
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
                      disabled={startingChat === friend.friend.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      {startingChat === friend.friend.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-sm">Starting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.37l-3.42 1.42c-.362.15-.766-.04-.766-.44v-2.77A8.001 8.001 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                          </svg>
                          <span className="text-sm">Chat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <p className="text-xs text-gray-500 text-center">
            Click "Chat" to start a conversation with your friend
          </p>
        </div>
      </div>
    </div>
  )
}
