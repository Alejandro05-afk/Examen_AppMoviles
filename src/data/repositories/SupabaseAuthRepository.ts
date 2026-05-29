import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { User } from '../../domain/entities/User'
import { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import { supabase } from '../supabase/client'

const getWebAuthUrl = () => {
  const webAuthUrl = process.env.EXPO_PUBLIC_WEB_AUTH_URL?.replace(/\/$/, '')
  if (!webAuthUrl) throw new Error('Falta EXPO_PUBLIC_WEB_AUTH_URL')
  return webAuthUrl
}

const getOAuthRedirectTo = () => {
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri({ path: 'auth/callback' })
  }

  return `${getWebAuthUrl()}/?return_url=${encodeURIComponent(getOAuthReturnUrl())}`
}

const getOAuthReturnUrl = () => {
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri({ path: 'auth/callback' })
  }

  return AuthSession.makeRedirectUri({
    scheme: 'petadopt',
    path: 'auth/callback',
  })
}

const getReturnUrl = (path: string) => {
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri({ path })
  }

  return AuthSession.makeRedirectUri({
    scheme: 'petadopt',
    path,
  })
}

const getWebAuthActionUrl = (path: string, returnPath: string) => {
  const url = new URL(`${getWebAuthUrl()}/${path}`)
  url.searchParams.set('return_url', getReturnUrl(returnPath))
  return url.toString()
}

const getParamsFromUrl = (url: string) => {
  const params = new URLSearchParams()
  const [, queryAndHash = ''] = url.split('?')
  const [query = '', hash = ''] = queryAndHash.split('#')
  const hashOnly = url.includes('#') ? url.split('#')[1] : hash

  new URLSearchParams(query).forEach((value, key) => params.set(key, value))
  new URLSearchParams(hashOnly).forEach((value, key) => params.set(key, value))

  return params
}

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
        emailRedirectTo: getWebAuthActionUrl('confirm', 'auth/confirmed'),
      },
    })
    if (error) throw new Error(error.message)
    return this.mapToUser(data.user!)
  }

  async loginWithGoogle(): Promise<User> {
    const redirectTo = getOAuthRedirectTo()
    const returnUrl = getOAuthReturnUrl()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    })
    if (error) throw new Error(error.message)
    if (!data.url) throw new Error('No se pudo iniciar el login con Google')

    const result = await WebBrowser.openAuthSessionAsync(data.url, returnUrl)
    if (result.type !== 'success') {
      throw new Error('Inicio de sesion cancelado')
    }

    const user = await this.completeOAuthSessionFromUrl(result.url)
    if (!user) throw new Error('No se pudo completar la sesion de Google')
    return user
  }

  async completeOAuthSessionFromUrl(url: string): Promise<User | null> {
    console.log('🔍 completeOAuthSessionFromUrl - URL:', url)
    const params = getParamsFromUrl(url)
    console.log('📋 Parámetros extraídos:', Object.fromEntries(params.entries()))

    const error = params.get('error') ?? params.get('error_code')
    if (error) {
      console.log('❌ Error en parámetros:', error)
      throw new Error(params.get('error_description') ?? error)
    }

    const code = params.get('code')
    console.log('🔑 Code presente:', !!code)
    if (code) {
      console.log('🔄 Intercambiando code por sesión...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.log('💥 Error intercambiando code:', error.message)
        throw new Error(error.message)
      }
      console.log('✅ Sesión obtenida del code, user:', data.user?.id)
      return data.user ? this.mapToUser(data.user) : null
    }

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    console.log('🔑 Access token presente:', !!accessToken, 'Refresh token presente:', !!refreshToken)
    if (!accessToken || !refreshToken) {
      console.log('⚠️ No hay code ni tokens, retornando null')
      return null
    }

    console.log('🔄 Estableciendo sesión con tokens...')
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (sessionError) {
      console.log('💥 Error estableciendo sesión:', sessionError.message)
      throw new Error(sessionError.message)
    }
    console.log('✅ Sesión establecida con tokens, user:', data.user?.id)
    return data.user ? this.mapToUser(data.user) : null
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
      redirectTo: getWebAuthActionUrl('reset-password', 'auth/password-updated'),
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
      .maybeSingle()

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
