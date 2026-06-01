import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import { TamaguiProvider, Text, YStack } from 'tamagui'
import config from '../tamagui.config'
import { NotificationsDataSource } from '../src/data/datasources/NotificationsDataSource'
import { SupabaseAuthRepository } from '../src/data/repositories/SupabaseAuthRepository'
import { supabase } from '../src/data/supabase/client'
import { getOrCreateShelterForUser } from '../src/data/supabase/shelterHelpers'
import { useAuthStore } from '../src/presentation/store/authStore'

WebBrowser.maybeCompleteAuthSession()
SplashScreen.preventAutoHideAsync()

const authRepo = new SupabaseAuthRepository()
const notificationsDS = new NotificationsDataSource()

const SPLASH_TIMEOUT = 3000
const AUTH_TIMEOUT = 10000

export default function RootLayout() {
  const { isLoading, setUser, setShelterId, setLoading } = useAuthStore()

  const [loaded] = useFonts({
    Inter: Inter_400Regular,
    InterBold: Inter_700Bold,
  })

  useEffect(() => {
    const timeout = setTimeout(() => SplashScreen.hideAsync(), SPLASH_TIMEOUT)
    if (loaded) {
      SplashScreen.hideAsync()
      clearTimeout(timeout)
    }
    return () => clearTimeout(timeout)
  }, [loaded])

  useEffect(() => {
    const authTimeout = setTimeout(() => {
      console.log('Auth loading timeout, forcing load')
      setLoading(false)
    }, AUTH_TIMEOUT)

    checkUser().finally(() => clearTimeout(authTimeout))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (!session.user.email_confirmed_at) {
          supabase.auth.signOut().catch(() => {})
          setUser(null)
          setLoading(false)
          clearTimeout(authTimeout)
          return
        }
        authRepo.getCurrentUser().then((user) => {
          if (user) {
            setUser(user)
            notificationsDS.registerPushToken(user.id)
            if (user.role === 'shelter') {
              getOrCreateShelterForUser(user).then(setShelterId).catch(() => {})
            }
          } else {
            setUser(null)
          }
        }).catch(() => {
          setUser(null)
        })
      } else {
        setUser(null)
      }
      setLoading(false)
      clearTimeout(authTimeout)
    })

    return () => {
      clearTimeout(authTimeout)
      listener?.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.email_confirmed_at) {
        await supabase.auth.signOut()
        setUser(null)
        return
      }
      if (user) {
        const currentUser = await authRepo.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          if (currentUser.role === 'shelter') {
            const shelterId = await getOrCreateShelterForUser(currentUser)
            setShelterId(shelterId)
          }
        }
      }
    } catch {
      await supabase.auth.signOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (!loaded) {
    return (
      <TamaguiProvider config={config} defaultTheme="light">
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#F5F7FA">
          <ActivityIndicator size="large" color="#FF6B6B" />
        </YStack>
      </TamaguiProvider>
    )
  }

  if (isLoading) {
    return (
      <TamaguiProvider config={config} defaultTheme="light">
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#F5F7FA" gap="$3">
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text fontSize={14} color="$bark" fontWeight="500">Cargando...</Text>
        </YStack>
      </TamaguiProvider>
    )
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(shelter)" />
        <Stack.Screen name="(adopter)" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="auth/confirmed" />
        <Stack.Screen name="auth/password-updated" />
      </Stack>
    </TamaguiProvider>
  )
}
