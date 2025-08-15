import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ChatService } from '../services/chatService'
import type { ConversationWithUser, MessageWithSender, Message } from '../lib/supabase'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: ConversationWithUser | null
}

export function ChatModal({ isOpen, onClose, conversation }: ChatModalProps) {
  const { userProfile } = useAuth()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && conversation) {
      loadMessages()
      subscribeToMessages()
      markMessagesAsRead()
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [isOpen, conversation?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!conversation) return
    
    setLoading(true)
    setError('')
    
    const { messages, error } = await ChatService.getMessages(conversation.id)
    
    if (error) {
      setError(error)
    } else {
      setMessages(messages)
    }
    
    setLoading(false)
  }

  const subscribeToMessages = () => {
    if (!conversation) return
    
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    subscriptionRef.current = ChatService.subscribeToMessages(conversation.id, (_newMessage: Message) => {
      loadMessages() // Reload to get complete message with sender info
    })
  }

  const markMessagesAsRead = async () => {
    if (!conversation) return
    await ChatService.markMessagesAsRead(conversation.id)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending || !conversation) return

    setSending(true)
    setError('')

    const { error } = await ChatService.sendMessage(conversation.id, newMessage.trim())
    
    if (error) {
      setError(error)
    } else {
      setNewMessage('')
    }
    
    setSending(false)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen || !conversation) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl w-full max-w-lg h-[600px] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {conversation.other_user.avatar_url ? (
                  <img
                    src={conversation.other_user.avatar_url}
                    alt={conversation.other_user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {conversation.other_user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-100">
                  {conversation.other_user.full_name || conversation.other_user.username}
                </h3>
                <p className="text-sm text-gray-400">@{conversation.other_user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No messages yet</p>
              <p className="text-xs text-gray-500 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === userProfile?.id

              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-gray-100'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <div className={`mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
