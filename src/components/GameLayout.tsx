import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface GameLayoutProps {
  children: ReactNode;
  userProfile: any;
  showBackButton?: boolean;
}

export function GameLayout({ children, userProfile, showBackButton = false }: GameLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide profile card when on dashboard page
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <div className="relative min-h-screen">
      {children}
      
      {/* Modern Floating Navigation - Hidden on Dashboard */}
      {!isDashboardPage && (
        <div className="fixed top-4 right-4 z-40 motion-safe:animate-slide-right hidden md:block">
          <div className="flex flex-col space-y-4">
            {/* User Profile Card */}
            <div className="glass-card glass-hover rounded-2xl p-5 max-w-xs motion-safe:animate-float shadow-md">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500/90 rounded-xl flex items-center justify-center shadow-md motion-safe:animate-glow">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.username}
                      loading="lazy"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 motion-safe:animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-100 truncate">
                  {userProfile?.username || 'Gamer'}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full motion-safe:animate-pulse"></div>
                  <p className="text-sm text-green-400 font-medium">Online</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md group"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile & Friends</span>
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only floating avatar button (bottom-right) - Hidden on Dashboard */}
      {!isDashboardPage && (
        <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Open Profile & Friends"
          className="relative w-12 h-12 rounded-full shadow-md bg-gradient-to-br from-purple-600 to-blue-600/90 p-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile?.username || 'User avatar'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
              {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-800"></span>
        </button>
        </div>
      )}

      {/* Back Button for Dashboard and other pages */}
      {showBackButton && (
        <div className="fixed bottom-4 left-4 z-50 motion-safe:animate-slide-left">
          <button
            onClick={() => navigate('/')}
            className="glass-card glass-hover px-5 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 font-medium group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <div className="text-left hidden md:block">
                <div className="text-gray-100 font-semibold">Kembali</div>
                <div className="text-gray-400 text-sm">ke Home</div>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
