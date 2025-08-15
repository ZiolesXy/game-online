import { useState, useEffect } from 'react'
import { FriendService } from '../../services/friendService'
import { useAuth } from '../../contexts/AuthContext'
import type { FriendWithUser } from '../../lib/supabase'

export function FriendsList() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<FriendWithUser[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')

  useEffect(() => {
    if (user) {
      loadFriends()
      loadPendingRequests()
    }
  }, [user])

  const loadFriends = async () => {
    const { friends, error } = await FriendService.getFriends('accepted')
    if (error) {
      setError(error)
    } else {
      setFriends(friends)
    }
    setLoading(false)
  }

  const loadPendingRequests = async () => {
    const { requests, error } = await FriendService.getPendingRequests()
    if (error) {
      setError(error)
    } else {
      setPendingRequests(requests)
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    const { error } = await FriendService.acceptFriendRequest(friendshipId)
    if (error) {
      setError(error)
    } else {
      loadFriends()
      loadPendingRequests()
    }
  }

  const handleRejectRequest = async (friendshipId: string) => {
    const { error } = await FriendService.rejectFriendRequest(friendshipId)
    if (error) {
      setError(error)
    } else {
      loadPendingRequests()
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      const { error } = await FriendService.rejectFriendRequest(friendshipId)
      if (error) {
        setError(error)
      } else {
        loadFriends()
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-400">Loading friends...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto glass-card rounded-2xl shadow-xl p-8 border border-white/10">
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full mr-4">
          <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-100">My Friends</h2>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="flex bg-white/10 rounded-xl p-1 mb-8 shadow-inner">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-lg transform scale-[1.02]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Friends ({friends.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-lg transform scale-[1.02]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Requests ({pendingRequests.length})</span>
          </div>
          {pendingRequests.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRequests.length}
            </div>
          )}
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-gray-300 text-lg mb-2">No friends yet</p>
              <p className="text-gray-400">Start building your gaming network!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {friends.map((friendship) => (
                <div key={friendship.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          {friendship.friend.avatar_url ? (
                            <img
                              src={friendship.friend.avatar_url}
                              alt={friendship.friend.username}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-100 font-bold text-lg">
                              {friendship.friend.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-100 text-lg">{friendship.friend.username}</h3>
                        {friendship.friend.full_name && (
                          <p className="text-gray-300">{friendship.friend.full_name}</p>
                        )}
                        <p className="text-sm text-gray-400">
                          Friends since {new Date(friendship.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friendship.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-purple-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-300 text-lg mb-2">No pending requests</p>
              <p className="text-gray-400">All caught up!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                          {request.friend.avatar_url ? (
                            <img
                              src={request.friend.avatar_url}
                              alt={request.friend.username}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-100 font-bold text-lg">
                              {request.friend.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-orange-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-100 text-lg">{request.friend.username}</h3>
                        {request.friend.full_name && (
                          <p className="text-gray-300">{request.friend.full_name}</p>
                        )}
                        <p className="text-sm text-orange-400 font-medium">
                          Sent {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-gray-100 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:scale-[1.05]"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 hover:scale-[1.05]"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
