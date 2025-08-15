import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function ProfileCard() {
  const { userProfile, updateProfile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: userProfile?.username || '',
    full_name: userProfile?.full_name || '',
    avatar_url: userProfile?.avatar_url || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    if (loading) return // Prevent multiple simultaneous saves
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await updateProfile(editData)
      
      if (error) {
        setError(error)
      } else {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      username: userProfile?.username || '',
      full_name: userProfile?.full_name || '',
      avatar_url: userProfile?.avatar_url || ''
    })
    setIsEditing(false)
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!userProfile) return null

  return (
    <div className="glass-card rounded-2xl shadow-xl p-8 border border-white/10">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
            {userProfile.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile.username}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-100 text-3xl font-bold">
                {userProfile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {!isEditing ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">{userProfile.username}</h2>
            {userProfile.full_name && (
              <p className="text-gray-300 mb-2">{userProfile.full_name}</p>
            )}
            <p className="text-sm text-gray-400 mb-4">{userProfile.email}</p>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={editData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Avatar URL</label>
              <input
                type="url"
                name="avatar_url"
                value={editData.avatar_url}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
                placeholder="Enter avatar image URL"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">0</div>
          <div className="text-sm text-gray-400">Games Played</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">0</div>
          <div className="text-sm text-gray-400">Friends</div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-200 mb-2">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Member since:</span>
            <span className="font-medium text-gray-300">{new Date(userProfile.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last updated:</span>
            <span className="font-medium text-gray-300">{new Date(userProfile.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-[1.02]"
            >
              Edit Profile
            </button>
            <button
              onClick={signOut}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 hover:scale-[1.02]"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 hover:scale-[1.02]"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
