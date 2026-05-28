import { create } from 'zustand'
import { User } from '../../domain/entities/User'

interface AuthState {
  user: User | null
  shelterId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setShelterId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  shelterId: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setShelterId: (shelterId) => set({ shelterId }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, shelterId: null, isAuthenticated: false }),
}))
