import { router, useLocalSearchParams } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { YStack, Text } from 'tamagui'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { useAuthStore } from '../../src/presentation/store/authStore'

export default function AuthCallbackScreen() {
  const { completeOAuthSessionFromUrl } = useAuth()
  const { isAuthenticated, user } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>()
  const { width: screenWidth } = useWindowDimensions()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
      return
    }

    let timeout: ReturnType<typeof setTimeout> | null = null
    const showError = (msg: string) => {
      if (timeout) clearTimeout(timeout)
      setError(msg)
    }

    timeout = setTimeout(() => {
      showError('El inicio de sesión tardó demasiado. Intenta de nuevo.')
    }, 15000)

    const accessToken = params.access_token
    const refreshToken = params.refresh_token

    if (!accessToken || !refreshToken) {
      showError('No se encontraron tokens en la URL')
      return
    }

    ;(async () => {
      try {
        const url = `petadopt://auth/callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`
        const u = await completeOAuthSessionFromUrl(url)
        if (!u) { showError('No se pudo establecer la sesión'); return }
        router.replace(u.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
      } catch (e: any) {
        showError(e.message ?? 'No se pudo completar el inicio de sesión')
      }
    })()

    return () => { if (timeout) clearTimeout(timeout) }
  }, [isAuthenticated, user, params.access_token, params.refresh_token])

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6" backgroundColor="$cream">
      {error ? (
        <YStack gap="$3" alignItems="center" paddingHorizontal="$4">
          <Text color="$coral" textAlign="center" fontSize={screenWidth > 400 ? 16 : 14} fontWeight="500">{error}</Text>
          <Text color="$coral" fontSize={screenWidth > 400 ? 14 : 12} fontWeight="600" textDecorationLine="underline" onPress={() => router.replace('/(auth)/login')}>
            Volver al inicio de sesión
          </Text>
        </YStack>
      ) : (
        <YStack gap="$2" alignItems="center">
          <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: screenWidth * 0.25, height: screenWidth * 0.25 }} />
          <Text fontSize={screenWidth > 400 ? 16 : 14} color="$chocolate" fontWeight="500">Completando inicio de sesión...</Text>
        </YStack>
      )}
    </YStack>
  )
}
