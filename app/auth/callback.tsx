import { useEffect, useState } from 'react'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../src/presentation/hooks/useAuth'

export default function AuthCallbackScreen() {
  const { completeOAuthSessionFromUrl } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const completeSession = async () => {
      try {
        const url = await Linking.getInitialURL()
        if (!url) return

        const user = await completeOAuthSessionFromUrl(url)
        if (!mounted || !user) return

        router.replace(user.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
      } catch (e: any) {
        if (mounted) setError(e.message ?? 'No se pudo completar el inicio de sesion')
      }
    }

    completeSession()

    return () => {
      mounted = false
    }
  }, [completeOAuthSessionFromUrl])

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator />
          <Text>Completando inicio de sesion...</Text>
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
    gap: 12,
    padding: 24,
  },
  error: {
    color: '#B42318',
    textAlign: 'center',
  },
})
