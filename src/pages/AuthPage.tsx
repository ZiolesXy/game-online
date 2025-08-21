import { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="max-w-lg w-full space-y-8 relative z-10">
        {/* Modern Header */}
        <div className="text-center animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-3xl shadow-2xl animate-glow">
                <svg className="h-12 w-12 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-black">Game Center</h1>
          <p className="text-xl text-gray-400 font-medium">Masuk ke dunia gaming terbaik</p>
        </div>

        {/* Auth Forms Container */}
        <div className="glass-card glass-hover rounded-3xl p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
          {isLogin ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  )
}
