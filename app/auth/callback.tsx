import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { colors } from '../../src/presentation/theme'

export default function AuthCallbackScreen() {
  const { completeOAuthSessionFromUrl } = useAuth()
  const { isAuthenticated, user } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
      return
    }

    let mounted = true

    const timeout = setTimeout(() => {
      if (!mounted) return
      setError('El inicio de sesión tardó demasiado. Intenta de nuevo.')
    }, 15000)

    const handleUrl = async (url: string) => {
      console.log('🔗 URL recibida:', url)
      if (!mounted) return
      try {
        const user = await completeOAuthSessionFromUrl(url)
        if (!mounted || !user) return
        router.replace(user.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
      } catch (e: any) {
        if (mounted) setError(e.message ?? 'No se pudo completar el inicio de sesión')
      }
    }

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url)
    })

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url)
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.remove()
    }
  }, [completeOAuthSessionFromUrl, isAuthenticated, user])

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
