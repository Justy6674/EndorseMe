import { useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle auth events
      switch (event) {
        case 'SIGNED_IN':
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.',
          })
          break
        case 'SIGNED_OUT':
          toast({
            title: 'Signed out',
            description: 'You have been signed out.',
          })
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed successfully')
          break
        case 'USER_UPDATED':
          toast({
            title: 'Profile updated',
            description: 'Your profile has been updated.',
          })
          break
      }
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      })
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link.',
      })
      
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      })
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the reset link.',
      })
      
      return { error: null }
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: error.message,
        variant: 'destructive',
      })
      return { error }
    }
  }

  const updateProfile = async (updates: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })
      
      if (error) throw error
      
      // Also update the users table
      if (user) {
        const { error: profileError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)
        
        if (profileError) throw profileError
      }
      
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      })
      return { data: null, error }
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
}