import { supabase } from '../supabase/client'
import { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import { User } from '../../domain/entities/User'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return this.mapToUser(data.user!)
  }

  async register(email: string, password: string, fullName: string, role: 'adopter' | 'shelter'): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${process.env.EXPO_PUBLIC_WEB_AUTH_URL}/confirm`,
      },
    })
    if (error) throw new Error(error.message)
    return this.mapToUser(data.user!)
  }

  async loginWithGoogle(): Promise<User> {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'petadopt', path: 'auth/callback' })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUri, skipBrowserRedirect: true },
    })
    if (error) throw new Error(error.message)

    const result = await WebBrowser.openAuthSessionAsync(data.url!, redirectUri)
    if (result.type !== 'success') throw new Error('Google sign-in cancelled')

    const url = new URL(result.url)
    const code = url.searchParams.get('code')
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }

    const { data: userData } = await supabase.auth.getUser()
    return this.mapToUser(userData.user!)
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    return this.mapToUser(data.user)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_WEB_AUTH_URL}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  private async mapToUser(authUser: any): Promise<User> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    return {
      id: authUser.id,
      email: authUser.email!,
      fullName: profile?.full_name ?? '',
      avatarUrl: profile?.avatar_url,
      role: profile?.role ?? 'adopter',
      phone: profile?.phone,
    }
  }
}
