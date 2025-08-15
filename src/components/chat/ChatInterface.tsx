import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ChatService } from '../../services/chatService'
import type { ConversationWithUser, MessageWithSender, Message } from '../../lib/supabase'

interface ChatInterfaceProps {
  conversation: ConversationWithUser
}

export function ChatInterface({ conversation }: ChatInterfaceProps) {
  const { userProfile } = useAuth()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
    markMessagesAsRead()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
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
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    subscriptionRef.current = ChatService.subscribeToMessages(conversation.id, (_newMessage: Message) => {
      // Get sender info for the new message
      loadMessages() // Reload to get complete message with sender info
    })
  }

  const markMessagesAsRead = async () => {
    await ChatService.markMessagesAsRead(conversation.id)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    setError('')

    const { error } = await ChatService.sendMessage(conversation.id, newMessage.trim())
    
    if (error) {
      setError(error)
    } else {
      setNewMessage('')
      // Message will be added via real-time subscription
    }
    
    setSending(false)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const shouldShowDateSeparator = (currentMessage: MessageWithSender, previousMessage?: MessageWithSender) => {
    if (!previousMessage) return true
    
    const currentDate = new Date(currentMessage.created_at).toDateString()
    const previousDate = new Date(previousMessage.created_at).toDateString()
    
    return currentDate !== previousDate
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
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
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender_id === userProfile?.id
            const previousMessage = index > 0 ? messages[index - 1] : undefined
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage)

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-500 bg-white/10 px-3 py-1 rounded-full">
                      {formatMessageDate(message.created_at)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
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
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
