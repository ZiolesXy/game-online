import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./components/Dashboard";
import Home from "./pages/Home";
import PlayGame from "./pages/PlayGame";
import type { Game } from "./data/game";

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="spinner mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold mb-4">Fun Zone</h3>
            <p className="text-gray-400">Memuat pengalaman gaming terbaik...</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (showDashboard) {
    return (
      <div className="relative">
        <Dashboard />
        
        {/* Modern Back Button - Moved to Bottom */}
        <div className="fixed bottom-6 left-6 z-50 animate-slide-left">
          <button
            onClick={() => setShowDashboard(false)}
            className="glass-card glass-hover px-6 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 font-medium group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-gray-100 font-semibold">Kembali</div>
                <div className="text-gray-400 text-sm">ke Game Center</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className="relative">
        <PlayGame game={selectedGame} onBack={() => setSelectedGame(null)} />
        
        
      </div>
    );
  }

  return (
    <div className="relative">
      <Home onGameSelect={setSelectedGame} />
      
      {/* Modern Floating Navigation */}
      <div className="fixed top-6 right-6 z-50 animate-slide-right">
        <div className="flex flex-col space-y-4">
          {/* User Profile Card */}
          <div className="glass-card glass-hover rounded-3xl p-6 max-w-xs animate-float">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-glow">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.username}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-100 truncate">
                  {userProfile?.username || 'Gamer'}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-400 font-medium">Online</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowDashboard(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg group"
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
