import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ProfileCard } from './profile/ProfileCard'
import { FriendsList } from './friends/FriendsList'
import { AddFriend } from './friends/AddFriend'
import { ChatPage } from '../pages/ChatPage'
import { GameRequestManager } from './requests/GameRequestManager'
import { AdminRequestDashboard } from './admin/AdminRequestDashboard'
import { gameRequestService } from '../services/gameRequestService'

export function Dashboard() {
  const { userProfile, signOut } = useAuth()
  const [activeSection, setActiveSection] = useState<'profile' | 'friends' | 'add-friends' | 'chat' | 'game-requests' | 'admin'>('profile')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await gameRequestService.isUserAdmin()
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }
    
    checkAdminStatus()
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="glass-card sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-4">
            <div className="flex items-center space-x-4 md:space-x-5 motion-safe:animate-slide-left">
              <div>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600/90 p-2.5 rounded-xl motion-safe:animate-glow shadow-md inline-flex">
                  <svg className="h-8 w-8 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black">
                  FunZone
                </h1>
                <p className="text-base text-gray-400 font-medium">Gaming Social Platform</p>
              </div>
              {userProfile && (
                <div className="hidden md:flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200/60">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600/90 rounded-full flex items-center justify-center shadow-md">
                    {userProfile.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.username}
                        loading="lazy"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-100 text-xs font-bold">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Welcome back!</p>
                    <p className="text-xs text-gray-100">{userProfile.username}</p>
                  </div>
                </div>
              )}
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg:white/40 hover:bg-white/40 transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="hidden md:flex justify-center">
          <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-md border border-white/30">
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'profile'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-md transform scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('friends')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'friends'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-md transform scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Friends</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('add-friends')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'add-friends'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-md transform scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add Friends</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('chat')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-md transform scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.37l-3.42 1.42c-.362.15-.766-.04-.766-.44v-2.77A8.001 8.001 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <span>Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('game-requests')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'game-requests'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-gray-100 shadow-md transform scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Game Requests</span>
              </div>
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveSection('admin')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'admin'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-gray-100 shadow-md transform scale-[1.01]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - Mobile Icon Logo Menu */}
      <div className="md:hidden px-4 pt-3">
        <div className={`grid gap-3 ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex flex-col items-center space-y-1 focus:outline-none ${
              activeSection === 'profile' ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20 transition-all ${
              activeSection === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600/90 scale-105'
                : 'bg-white/10'
            }`}>
              <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs text-gray-200">Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('friends')}
            className={`flex flex-col items-center space-y-1 focus:outline-none ${
              activeSection === 'friends' ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20 transition-all ${
              activeSection === 'friends'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600/90 scale-105'
                : 'bg-white/10'
            }`}>
              <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-200">Friends</span>
          </button>

          <button
            onClick={() => setActiveSection('add-friends')}
            className={`flex flex-col items-center space-y-1 focus:outline-none ${
              activeSection === 'add-friends' ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20 transition-all ${
              activeSection === 'add-friends'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600/90 scale-105'
                : 'bg-white/10'
            }`}>
              <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-xs text-gray-200">Add</span>
          </button>

          <button
            onClick={() => setActiveSection('chat')}
            className={`flex flex-col items-center space-y-1 focus:outline-none ${
              activeSection === 'chat' ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20 transition-all ${
              activeSection === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600/90 scale-105'
                : 'bg-white/10'
            }`}>
              <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.58-.37l-3.42 1.42c-.362.15-.766-.04-.766-.44v-2.77A8.001 8.001 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <span className="text-xs text-gray-200">Chat</span>
          </button>

          <button
            onClick={() => setActiveSection('game-requests')}
            className={`flex flex-col items-center space-y-1 focus:outline-none ${
              activeSection === 'game-requests' ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20 transition-all ${
              activeSection === 'game-requests'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600/90 scale-105'
                : 'bg-white/10'
            }`}>
              <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-xs text-gray-200">Requests</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveSection('admin')}
              className={`flex flex-col items-center space-y-1 focus:outline-none ${
                activeSection === 'admin' ? 'opacity-100' : 'opacity-80'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/20 transition-all ${
                activeSection === 'admin'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600/90 scale-105'
                  : 'bg-white/10'
              }`}>
                <svg className="h-6 w-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs text-gray-200">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="transition-all duration-300">
          {activeSection === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <ProfileCard />
            </div>
          )}
          
          {activeSection === 'friends' && (
            <div className="max-w-6xl mx-auto">
              <FriendsList />
            </div>
          )}
          
          {activeSection === 'add-friends' && (
            <div className="max-w-4xl mx-auto">
              <AddFriend />
            </div>
          )}
          
          {activeSection === 'chat' && (
            <div className="min-h-[60vh] md:min-h-[70vh]">
              <ChatPage />
            </div>
          )}
          
          {activeSection === 'game-requests' && (
            <div className="max-w-6xl mx-auto">
              <GameRequestManager />
            </div>
          )}
          
          {activeSection === 'admin' && isAdmin && (
            <div className="max-w-7xl mx-auto">
              <AdminRequestDashboard />
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile (removed in favor of bottom icons) */}
      {/* Intentionally removed to avoid overlap with the new mobile logo menu */}
    </div>
  )
}
