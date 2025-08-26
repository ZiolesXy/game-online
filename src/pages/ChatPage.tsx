import { useState } from 'react'
import { ConversationList } from '../components/chat/ConversationList'
import { ChatInterface } from '../components/chat/ChatInterface'
import { NewChat } from '../components/chat/NewChat'
import type { ConversationWithUser } from '../lib/supabase'

export function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUser | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)

  const handleSelectConversation = (conversation: ConversationWithUser) => {
    setSelectedConversation(conversation)
    setShowNewChat(false)
  }

  const handleNewChatCreated = (conversation: ConversationWithUser) => {
    setSelectedConversation(conversation)
    setShowNewChat(false)
  }

  const handleShowNewChat = () => {
    setShowNewChat(true)
    setSelectedConversation(null)
  }

  const handleCloseNewChat = () => {
    setShowNewChat(false)
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Sidebar - Conversation List */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} md:w-96 border-r border-white/10 bg-white/5 backdrop-blur-sm`}>
        <div className="h-full flex flex-col">
          {/* Header with New Chat Button */}
          <div className="p-3 md:p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h1 className="text-lg md:text-xl font-bold text-gray-100">Chat</h1>
              <button
                onClick={handleShowNewChat}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                title="Start new chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-hidden">
            {showNewChat ? (
              <NewChat
                onChatCreated={handleNewChatCreated}
                onClose={handleCloseNewChat}
              />
            ) : (
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? '' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <ChatInterface conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />
        ) : (
          <div className="h-full hidden md:flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.37l-3.42 1.42c-.362.15-.766-.04-.766-.44v-2.77A8.001 8.001 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-100 mb-2">Welcome to Chat</h2>
              <p className="text-gray-400 mb-6">Select a conversation to start messaging</p>
              <button
                onClick={handleShowNewChat}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Start New Chat</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile behavior handled via conditional visibility above */}
    </div>
  )
}
