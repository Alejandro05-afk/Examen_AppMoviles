import { User } from '../entities/User'

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>
  register(email: string, password: string, fullName: string, role: 'adopter' | 'shelter'): Promise<User>
  loginWithGoogle(): Promise<User>
  completeOAuthSessionFromUrl(url: string): Promise<User | null>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
}
