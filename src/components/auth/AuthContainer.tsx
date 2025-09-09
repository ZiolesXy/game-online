import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AuthService } from '../../services/authService'
import { AuthMethodSelector } from './AuthMethodSelector'
import { GoogleRegistrationGuide } from './GoogleRegistrationGuide'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { UpdatePasswordForm } from './UpdatePasswordForm'

type AuthMode = 'selector' | 'email-auth' | 'google-registration' | 'reset-password' | 'update-password'
type EmailAuthMode = 'login' | 'register'

export function AuthContainer() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isPasswordRecovery = location.pathname === '/auth/reset-password'
  const [authMode, setAuthMode] = useState<AuthMode>('selector')
  const [emailAuthMode, setEmailAuthMode] = useState<EmailAuthMode>('login')
  const [googleUnregistered, setGoogleUnregistered] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)

  // Detect redirect flag when Google account is not registered in DB
  useEffect(() => {
    // With HashRouter, rely on React Router's location.search.
    // Fallback: if empty, parse query from the hash fragment (e.g., '#/auth?google_unregistered=1').
    let params = new URLSearchParams(location.search)
    if (![...params.keys()].length && typeof location.hash === 'string') {
      const hashStr = (location.hash as unknown as string) || ''
      const qIndex = hashStr.indexOf('?')
      if (qIndex >= 0) {
        params = new URLSearchParams(hashStr.slice(qIndex))
      }
    }
    // Capture generic OAuth error if present
    const errorCode = params.get('error') || params.get('error_code')
    const errorDesc = params.get('error_description')
    if (errorCode) {
      const nice = errorDesc ? decodeURIComponent(errorDesc) : 'Autentikasi gagal. Coba lagi.'
      setOauthError(nice.replace(/\+/g, ' '))
      // Clean error params from URL
      navigate('/auth', { replace: true })
    }
    const flag = params.get('google_unregistered')
    const navState = (location as any).state as { googleUnregistered?: boolean } | null
    let shouldShow = flag === '1' || !!navState?.googleUnregistered

    // Fallback: also check localStorage in case query params were stripped
    if (!shouldShow) {
      try {
        const stored = localStorage.getItem('google_unregistered')
        console.log('AuthContainer: stored google_unregistered =', stored)
        if (stored === '1') {
          shouldShow = true
          localStorage.removeItem('google_unregistered')
        }
      } catch {}
    }

    if (shouldShow) {
      console.log('AuthContainer: Detected google_unregistered flag, switching to email registration mode')
      setGoogleUnregistered(true)
      // Direct the user to email registration form
      setAuthMode('email-auth')
      setEmailAuthMode('register')
      // Clean the URL if needed
      if (flag === '1') {
        // In HashRouter, use navigate replace to remove the query param safely
        navigate('/auth', { replace: true })
      }
    }

    // Check if we're on the reset password route
    if (location.pathname === '/auth/reset-password') {
      setAuthMode('update-password')
    }
  }, [location.search, location.state, location.pathname, navigate])

  // Removed legacy reset-password event listener (no longer triggered from LoginForm)

  // Apply recovery session when landing on /auth/reset-password (HashRouter tokens)
  useEffect(() => {
    if (!isPasswordRecovery) return
    let mounted = true
    AuthService.applyRecoverySessionFromUrl().then((res) => {
      if (!mounted) return
      if (res.error) {
        console.warn('Failed to apply recovery session:', res.error)
      }
      // Ensure the update-password form is shown
      setAuthMode('update-password')
    })
    return () => { mounted = false }
    // safe to run only on path change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPasswordRecovery])

  // PRIORITY: Password recovery flow must render regardless of auth/profile state
  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            <UpdatePasswordForm onSuccess={handlePasswordUpdateSuccess} />
          </div>
        </div>
      </div>
    )
  }

  // If user is logged in, this component shouldn't render
  if (user) {
    return null
  }

  const handleSelectEmailAuth = () => {
    setAuthMode('email-auth')
    setEmailAuthMode('login')
  }

  const handleGoogleRegistrationNeeded = () => {
    setAuthMode('google-registration')
  }

  const handleToggleEmailMode = () => {
    setEmailAuthMode(emailAuthMode === 'login' ? 'register' : 'login')
  }

  const handleBackToSelector = () => {
    setAuthMode('selector')
  }

  const handleTryGoogleAgain = async () => {
    // This will be handled by the GoogleRegistrationGuide component
    setAuthMode('selector')
  }

  // Removed legacy back-to-login handler (not used)

  // Use function declaration to ensure availability before usage
  function handlePasswordUpdateSuccess() {
    navigate('/auth')
    setAuthMode('email-auth')
    setEmailAuthMode('login')
  }

  if (authMode === 'selector') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            {oauthError && (
              <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-200 text-sm">
                {oauthError}
              </div>
            )}
            {googleUnregistered && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-200 text-sm">
                Akun Google Anda belum terdaftar. Silakan daftar terlebih dahulu menggunakan email.
              </div>
            )}
            <AuthMethodSelector 
              onSelectEmailAuth={handleSelectEmailAuth}
              onGoogleRegistrationNeeded={handleGoogleRegistrationNeeded}
            />
          </div>
        </div>
      </div>
    )
  }

  if (authMode === 'google-registration') {
    return (
      <GoogleRegistrationGuide 
        onBackToSelector={handleBackToSelector}
        onTryGoogleAgain={handleTryGoogleAgain}
      />
    )
  }

  // Removed legacy reset-password mode (handled via dedicated /reset-password page when needed)

  if (authMode === 'update-password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            <UpdatePasswordForm onSuccess={handlePasswordUpdateSuccess} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Back Button */}
          <button
            onClick={handleBackToSelector}
            className="mb-6 flex items-center text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {emailAuthMode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h2>
            <p className="text-white/70 text-sm">
              {emailAuthMode === 'login' ? 'Masuk dengan email dan kata sandi' : 'Daftar untuk mulai bermain'}
            </p>
          </div>

          {googleUnregistered && (
            <div className="mb-6 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-200 text-sm">
              Akun Google Anda belum terdaftar. Silakan daftar menggunakan email di bawah ini.
            </div>
          )}

          {/* Auth Forms */}
          {emailAuthMode === 'login' ? (
            <LoginForm onToggleMode={handleToggleEmailMode} />
          ) : (
            <RegisterForm onToggleMode={handleToggleEmailMode} />
          )}
        </div>
      </div>
    </div>
  )
}
