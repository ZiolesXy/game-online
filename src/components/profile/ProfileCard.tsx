import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FriendService } from '../../services/friendService'
import { AuthService } from '../../services/authService'
import type { FriendWithUser } from '../../lib/supabase'

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
  const [friends, setFriends] = useState<FriendWithUser[]>([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [friendsError, setFriendsError] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru tidak cocok')
      return
    }

    // Allow empty password: remove minimum length validation

    setPasswordLoading(true)

    try {
      // Skip verifying current password to allow empty submissions
      // Update password directly using current session
      const { error } = await AuthService.updatePassword(passwordData.newPassword)
      
      if (error) {
        setPasswordError(error)
      } else {
        setPasswordSuccess('Password berhasil diperbarui!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess('')
        }, 2000)
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal memperbarui password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!userProfile?.email) return
    
    setPasswordLoading(true)
    setPasswordError('')
    
    const { error } = await AuthService.resetPassword(userProfile.email)
    
    if (error) {
      setPasswordError(error)
    } else {
      setPasswordSuccess('Link reset password telah dikirim ke email Anda')
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess('')
      }, 3000)
    }
    
    setPasswordLoading(false)
  }

  useEffect(() => {
    const loadFriends = async () => {
      if (!userProfile) return
      setFriendsLoading(true)
      setFriendsError('')
      const { friends, error } = await FriendService.getFriends('accepted')
      if (error) {
        setFriendsError(error)
      } else {
        setFriends(friends)
      }
      setFriendsLoading(false)
    }
    loadFriends()
  }, [userProfile?.id])

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
                loading="lazy"
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
          <div className="text-2xl font-bold text-green-400">{friends.length}</div>
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

      {/* Friends Preview */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-200">Friends ({friends.length})</h3>
          {friendsLoading && <span className="text-xs text-gray-400">Loading...</span>}
        </div>
        {friendsError && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded mb-3 text-sm">
            {friendsError}
          </div>
        )}
        {friends.length === 0 && !friendsLoading ? (
          <p className="text-sm text-gray-400">You have no friends yet. Add some in the Friends tab.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {friends.slice(0, 8).map((f) => (
              <div key={f.id} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {f.friend.avatar_url ? (
                    <img
                      src={f.friend.avatar_url}
                      alt={f.friend.username}
                      loading="lazy"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {f.friend.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-xs text-gray-300 truncate max-w-[5rem]">
                  {f.friend.full_name || f.friend.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
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
        
        {!isEditing && (
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Change Password</span>
          </button>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-4">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password saat ini (boleh kosong)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password baru"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulangi password baru"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                >
                  {passwordLoading ? 'Memperbarui...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
