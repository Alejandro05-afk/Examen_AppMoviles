import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'
import { useColorScheme } from 'react-native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { LottieSplash } from '../src/presentation/components/common/LottieSplash'
import { useAuthStore } from '../src/presentation/store/authStore'
import { supabase } from '../src/data/supabase/client'
import { SupabaseAuthRepository } from '../src/data/repositories/SupabaseAuthRepository'

SplashScreen.preventAutoHideAsync()

const authRepo = new SupabaseAuthRepository()

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
        authRepo.getCurrentUser().then(setUser)
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

  if (!loaded || isLoading) {
    return <LottieSplash />
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : user?.role === 'shelter' ? (
          <Stack.Screen name="(shelter)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(adopter)" options={{ headerShown: false }} />
        )}
      </Stack>
    </TamaguiProvider>
  )
}
