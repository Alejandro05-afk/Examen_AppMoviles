import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'
import { useColorScheme } from 'react-native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { LottieSplash } from '../src/presentation/components/common/LottieSplash'
import { useAuthStore } from '../src/presentation/store/authStore'
import { supabase } from '../src/data/supabase/client'
import { SupabaseAuthRepository } from '../src/data/repositories/SupabaseAuthRepository'
import { NotificationsDataSource } from '../src/data/datasources/NotificationsDataSource'
import { getOrCreateShelterForUser } from '../src/data/supabase/shelterHelpers'

WebBrowser.maybeCompleteAuthSession()
SplashScreen.preventAutoHideAsync()

const authRepo = new SupabaseAuthRepository()
const notificationsDS = new NotificationsDataSource()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { isLoading, isAuthenticated, user, setUser, setShelterId, setLoading } = useAuthStore()

  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  useEffect(() => {
    checkUser()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        authRepo.getCurrentUser().then((user) => {
          setUser(user)
          if (user) notificationsDS.registerPushToken(user.id)
          if (user?.role === 'shelter') {
            getOrCreateShelterForUser(user).then(setShelterId).catch(() => {})
          }
        })
      } else {
        setUser(null)
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
          const shelterId = await getOrCreateShelterForUser(currentUser)
          setShelterId(shelterId)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      {!loaded || isLoading ? (
        <LottieSplash />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(shelter)" />
          <Stack.Screen name="(adopter)" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="auth/confirmed" />
          <Stack.Screen name="auth/password-updated" />
        </Stack>
      )}
    </TamaguiProvider>
  )
}
