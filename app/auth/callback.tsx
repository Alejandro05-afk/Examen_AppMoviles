import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { colors } from '../../src/presentation/theme'

export default function AuthCallbackScreen() {
  const { completeOAuthSessionFromUrl } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const handleUrl = async (url: string) => {
      console.log('🔗 URL recibida:', url)
      if (!mounted) return
      try {
        const user = await completeOAuthSessionFromUrl(url)
        console.log('👤 Usuario:', user)
        if (!mounted || !user) {
          console.log('❌ No user, mounted:', mounted)
          return
        }
        router.replace(user.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
      } catch (e: any) {
        console.log('💥 Error:', e.message)
        if (mounted) setError(e.message ?? 'No se pudo completar el inicio de sesion')
      }
    }

    // Caso 1: app abierta en segundo plano (el más común)
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url)
    })

    // Caso 2: app lanzada desde cero por el link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url)
    })

    return () => {
      mounted = false
      subscription.remove()
    }
  }, [completeOAuthSessionFromUrl])

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
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
})

