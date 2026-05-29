import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect } from 'react'
import { NotificationsDataSource } from '../src/data/datasources/NotificationsDataSource'
import { SupabaseAuthRepository } from '../src/data/repositories/SupabaseAuthRepository'
import { supabase } from '../src/data/supabase/client'
import { getOrCreateShelterForUser } from '../src/data/supabase/shelterHelpers'
import { LottieSplash } from '../src/presentation/components/common/LottieSplash'
import { useAuthStore } from '../src/presentation/store/authStore'

WebBrowser.maybeCompleteAuthSession()
SplashScreen.preventAutoHideAsync()

const authRepo = new SupabaseAuthRepository()
const notificationsDS = new NotificationsDataSource()

export default function RootLayout() {
  const { isLoading, isAuthenticated, user, setUser, setShelterId, setLoading } = useAuthStore()

  const [loaded] = useFonts({
    Inter: Inter_400Regular,
    InterBold: Inter_700Bold,
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
    <>
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
    </>
  )
}
