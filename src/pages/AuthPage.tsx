import { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center animate-slide-up">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-4 shadow-2xl ring-1 ring-white/20">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white">Game Center</h1>
          <p className="text-base text-white/60 font-medium">Masuk ke dunia gaming terbaik</p>
        </div>

        {/* Card */}
        <div className="glass-card glass-hover rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {/* Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 bg-white/10 p-1 rounded-xl">
            <button
              className={`cursor-pointer py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isLogin ? 'bg-white text-gray-900 shadow' : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Masuk
            </button>
            <button
              className={`cursor-pointer py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isLogin ? 'bg-white text-gray-900 shadow' : 'text-white/70 hover:text-white'
              }`}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Daftar
            </button>
          </div>

          {/* Form Area */}
          <div>
            {isLogin ? (
              <LoginForm onToggleMode={toggleMode} />
            ) : (
              <RegisterForm onToggleMode={toggleMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

