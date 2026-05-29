import { useEffect } from 'react'
import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

export default function AuthConfirmedScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/login'), 1200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuenta confirmada</Text>
      <Text>Volviendo al inicio de sesion...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
})
