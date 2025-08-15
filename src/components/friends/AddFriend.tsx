import React, { useState } from 'react'
import { FriendService } from '../../services/friendService'
import type { User } from '../../lib/supabase'

export function AddFriend() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')
    setSuccessMessage('')

    const { users, error } = await FriendService.searchUsers(searchQuery.trim())
    
    if (error) {
      setError(error)
    } else {
      setSearchResults(users)
    }
    
    setLoading(false)
  }

  const handleSendFriendRequest = async (friendId: string, username: string) => {
    setError('')
    setSuccessMessage('')

    const { error } = await FriendService.sendFriendRequest(friendId)
    
    if (error) {
      setError(error)
    } else {
      setSuccessMessage(`Friend request sent to ${username}!`)
      // Remove the user from search results after sending request
      setSearchResults(prev => prev.filter(user => user.id !== friendId))
    }
  }

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-lg shadow-md p-6 border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Add Friends</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or email..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-gray-100 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.length === 0 && searchQuery && !loading && (
          <p className="text-gray-400 text-center py-8">
            No users found matching "{searchQuery}"
          </p>
        )}

        {searchResults.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border border-white/20 bg-white/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-gray-100 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-100">{user.username}</h3>
                {user.full_name && (
                  <p className="text-sm text-gray-300">{user.full_name}</p>
                )}
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleSendFriendRequest(user.id, user.username)}
              className="px-4 py-2 bg-green-600 text-gray-100 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Friend
            </button>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-white/10 rounded-lg">
        <h3 className="font-medium text-gray-200 mb-2">How to add friends:</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Search for users by their username or email address</li>
          <li>• Click "Add Friend" to send a friend request</li>
          <li>• They will receive your request and can accept or decline it</li>
          <li>• Once accepted, you'll both appear in each other's friends list</li>
        </ul>
      </div>
    </div>
  )
}
