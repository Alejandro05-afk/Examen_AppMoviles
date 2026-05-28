import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { loginUseCase, registerUseCase, loginWithGoogleUseCase } from '../../di/container'
import { supabase } from '../../data/supabase/client'
import { SupabaseAuthRepository } from '../../data/repositories/SupabaseAuthRepository'

const authRepo = new SupabaseAuthRepository()

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setShelterId, setLoading, logout: clearAuth } = useAuthStore()

  useEffect(() => {
    checkUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        authRepo.getCurrentUser().then(setUser)
      } else {
        clearAuth()
      }
      setLoading(false)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await authRepo.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.role === 'shelter') {
          const { data } = await supabase
            .from('shelters')
            .select('id')
            .eq('profile_id', currentUser.id)
            .single()
          if (data) setShelterId(data.id)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password)
    setUser(user)
    return user
  }

  const register = async (email: string, password: string, fullName: string, role: 'adopter' | 'shelter') => {
    const user = await registerUseCase.execute(email, password, fullName, role)
    setUser(user)
    return user
  }

  const loginWithGoogle = async () => {
    const user = await loginWithGoogleUseCase.execute()
    setUser(user)
    return user
  }

  const logout = async () => {
    await authRepo.logout()
    clearAuth()
  }

  return { user, isAuthenticated, isLoading, login, register, loginWithGoogle, logout }
}
