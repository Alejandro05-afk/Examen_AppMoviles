import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { loginUseCase, registerUseCase, loginWithGoogleUseCase } from '../../di/container'
import { SupabaseAuthRepository } from '../../data/repositories/SupabaseAuthRepository'

const authRepo = new SupabaseAuthRepository()

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, logout: clearAuth } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password)
    setUser(user)
    return user
  }, [setUser])

  const register = useCallback(async (email: string, password: string, fullName: string, role: 'adopter' | 'shelter') => {
    const user = await registerUseCase.execute(email, password, fullName, role)
    setUser(user)
    return user
  }, [setUser])

  const loginWithGoogle = useCallback(async () => {
    const user = await loginWithGoogleUseCase.execute()
    setUser(user)
    return user
  }, [setUser])

  const completeOAuthSessionFromUrl = useCallback(async (url: string) => {
    const user = await authRepo.completeOAuthSessionFromUrl(url)
    if (user) setUser(user)
    return user
  }, [setUser])

  const logout = useCallback(async () => {
    await authRepo.logout()
    clearAuth()
  }, [clearAuth])

  return { user, isAuthenticated, isLoading, login, register, loginWithGoogle, completeOAuthSessionFromUrl, logout }
}
