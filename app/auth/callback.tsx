import { router, useLocalSearchParams } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { colors } from '../../src/presentation/theme'

export default function AuthCallbackScreen() {
  const { completeOAuthSessionFromUrl } = useAuth()
  const { isAuthenticated, user } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>()

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
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry} onPress={() => router.replace('/(auth)/login')}>
            Volver al inicio de sesión
          </Text>
        </>
      ) : (
        <>
          <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
          <Text style={styles.loadingText}>Completando inicio de sesión...</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  error: {
    color: colors.alert,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  retry: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
