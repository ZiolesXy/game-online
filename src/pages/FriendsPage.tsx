import { useState } from 'react'
import { FriendsList } from '../components/friends/FriendsList'
import { AddFriend } from '../components/friends/AddFriend'

export function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list')

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Friends
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Add Friends
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' ? <FriendsList /> : <AddFriend />}
      </div>
    </div>
  )
}
