import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../services/authService'
import type { User } from '../lib/supabase'

interface AuthContextType {
  user: any | null
  userProfile: User | null
  loading: boolean
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  useEffect(() => {
    let mounted = true
    let loadingTimeout: NodeJS.Timeout
    
    // Get initial user
    const getInitialUser = async () => {
      try {
        const { user } = await AuthService.getCurrentUser()
        
        if (!mounted) return
        
        setUser(user)
        setLoading(false) // Set loading to false immediately after getting user
        
        if (user && !profileLoaded) {
          // Load profile in background without blocking the UI
          const { user: profile } = await AuthService.getUserProfile(user.id)
          if (mounted) {
            setUserProfile(profile)
            setProfileLoaded(true)
          }
        }
      } catch (error) {
        console.error('Auth loading error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set fallback timeout only for initial loading
    if (loading) {
      loadingTimeout = setTimeout(() => {
        if (mounted && loading) {
          console.warn('Initial loading timeout reached, forcing loading to false')
          setLoading(false)
        }
      }, 5000)
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (newUser) => {
      if (!mounted) return
      
      // Skip auth state changes during profile updates to prevent loading issues
      if (isUpdatingProfile) {
        console.log('Skipping auth state change during profile update')
        return
      }
      
      // Only reload profile if user actually changed (not just a token refresh)
      if (newUser?.id !== user?.id) {
        setUser(newUser)
        
        if (newUser) {
          // Load profile in background
          try {
            const { user: profile } = await AuthService.getUserProfile(newUser.id)
            if (mounted && !isUpdatingProfile) {
              setUserProfile(profile)
              setProfileLoaded(true)
            }
          } catch (error) {
            console.warn('Failed to load user profile:', error)
          }
        } else {
          setUserProfile(null)
          setProfileLoaded(false)
        }
      }
    })

    return () => {
      mounted = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      subscription.unsubscribe()
    }
  }, []) // Remove isUpdatingProfile from dependencies to prevent re-runs

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    // Do not toggle global loading here to prevent app-wide loading screen
    // Let RegisterForm manage its own local loading state
    const { error } = await AuthService.signUp({ email, password, username, fullName })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    // Do not toggle global loading here to prevent app-wide loading screen
    // Let LoginForm manage its own local loading state
    const { error } = await AuthService.signIn({ email, password })
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await AuthService.signOut()
    setUser(null)
    setUserProfile(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' }
    if (isUpdatingProfile) return { error: 'Profile update already in progress' }
    
    setIsUpdatingProfile(true)
    const originalProfile = userProfile
    
    // Optimistically update the profile to prevent loading states
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates })
    }
    
    try {
      const { user: updatedProfile, error } = await AuthService.updateProfile(user.id, updates)
      
      if (error) {
        // Rollback on error
        if (originalProfile) {
          setUserProfile(originalProfile)
        }
        return { error }
      }
      
      // Update with server response if different from optimistic update
      if (updatedProfile) {
        setUserProfile(updatedProfile)
        setProfileLoaded(true)
      }
      
      return { error: null }
    } catch (err: any) {
      // Rollback on exception
      if (originalProfile) {
        setUserProfile(originalProfile)
      }
      return { error: err.message || 'Failed to update profile' }
    } finally {
      // Always reset the updating flag to prevent stuck states
      setIsUpdatingProfile(false)
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
