import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { AuthService } from '../../services/authService'

export function AuthCallback() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback...')
        
        // First, try to exchange the code for a session
        const { data, error } = await supabase.auth.getSession()
        console.log('AuthCallback: Session result:', { hasSession: !!data.session, error })
        
        if (error) {
          console.error('Auth callback error:', error)
          setErrorMsg(error.message || 'Callback failed')
          navigate('/auth?error=callback_failed')
          return
        }

        if (data.session) {
          console.log('AuthCallback: Session found, user:', data.session.user.email)
          
          const authUser = data.session.user
          // Check if this Google user already has a profile row
          const { user: profile } = await AuthService.getUserProfile(authUser.id)
          if (!profile) {
            console.log('AuthCallback: Google account not registered in DB, signing out and redirecting to email registration')
            await supabase.auth.signOut()
            try { localStorage.setItem('google_unregistered', '1') } catch {}
            navigate('/auth?google_unregistered=1', { state: { googleUnregistered: true } })
            return
          }

          // Check if profile completion is needed
          const { needsCompletion } = await AuthService.checkProfileCompletion(authUser.id)
          console.log('AuthCallback: Profile completion needed:', needsCompletion)
          
          if (needsCompletion) {
            navigate('/complete-profile')
            return
          }

          // Successfully authenticated, redirect to home
          console.log('AuthCallback: Redirecting to home')
          navigate('/')
        } else {
          // No session found, try to handle the OAuth callback
          console.log('AuthCallback: No session found, checking URL for OAuth params')
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          
          if (code) {
            console.log('AuthCallback: OAuth code found, exchanging for session')
            const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (sessionError) {
              console.error('AuthCallback: Code exchange failed:', sessionError)
              setErrorMsg('Gagal menukar kode OAuth')
              navigate('/auth?error=code_exchange_failed')
              return
            }
            
            if (sessionData.session) {
              console.log('AuthCallback: Session created successfully')
              // Let AuthContext pick up the new session via router navigation
              navigate('/')
              return
            }
          }

          // Some providers return tokens in URL hash. With HashRouter, the URL can look like:
          //   https://host/#/auth/callback#access_token=...&refresh_token=...
          // In that case, window.location.hash becomes '#/auth/callback#access_token=...'
          // We must parse only the trailing token fragment after the LAST '#'.
          const rawHash = window.location.hash || ''
          const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash
          // If the hash contains another '#', take the substring after the last '#'
          const lastHashIndex = hash.lastIndexOf('#')
          const tokenFragment = lastHashIndex >= 0 ? hash.slice(lastHashIndex + 1) : hash
          const hashParams = new URLSearchParams(tokenFragment)
          const access_token = hashParams.get('access_token')
          const refresh_token = hashParams.get('refresh_token')
          if (access_token && refresh_token) {
            console.log('AuthCallback: Found tokens in URL hash, setting session')
            const { data: setData, error: setErr } = await supabase.auth.setSession({
              access_token,
              refresh_token
            })
            if (setErr) {
              console.error('AuthCallback: setSession from hash failed:', setErr)
            } else if (setData.session) {
              console.log('AuthCallback: Session set from hash successfully')
              navigate('/')
              return
            }
          }
          
          console.log('AuthCallback: No session and no code, redirecting to auth with unregistered flag')
          try { localStorage.setItem('google_unregistered', '1') } catch {}
          navigate('/auth?google_unregistered=1', { state: { googleUnregistered: true } })
        }
      } catch (error) {
        console.error('Auth callback exception:', error)
        setErrorMsg('Terjadi kesalahan saat memproses login Google')
        navigate('/auth?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Memproses autentikasi...</h2>
        <p className="text-white/70">Mohon tunggu sebentar</p>
        {errorMsg && (
          <p className="text-red-300 mt-2 text-sm">{errorMsg}</p>
        )}
      </div>
    </div>
  )
}
