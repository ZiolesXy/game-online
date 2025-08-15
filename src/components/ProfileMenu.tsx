import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ProfileMenuProps {
  onNavigateToProfile?: () => void
  onNavigateToDashboard?: () => void
}

export function ProfileMenu({ onNavigateToProfile, onNavigateToDashboard }: ProfileMenuProps) {
  const { userProfile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!userProfile) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Profile Menu Dropdown */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 glass-card rounded-2xl shadow-2xl border border-white/10 overflow-hidden mb-2">
          {/* Profile Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">
                  {userProfile.full_name || userProfile.username}
                </h3>
                <p className="text-sm text-gray-400">@{userProfile.username}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                onNavigateToProfile?.()
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-100">Profile</span>
            </button>

            <button
              onClick={() => {
                onNavigateToDashboard?.()
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-gray-100">Dashboard</span>
            </button>

            <div className="border-t border-white/10 my-2"></div>

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left hover:bg-red-500/20 transition-colors duration-200 flex items-center space-x-3 text-red-400 hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center border-2 border-white/20 hover:border-white/30"
      >
        {userProfile.avatar_url ? (
          <img
            src={userProfile.avatar_url}
            alt={userProfile.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-xl">
            {userProfile.username.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
