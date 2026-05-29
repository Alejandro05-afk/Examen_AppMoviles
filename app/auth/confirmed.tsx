import { useEffect } from 'react'
import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function AuthConfirmedScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/login'), 1200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <View style={styles.container}>
      <Feather name="check-circle" size={64} color={colors.secondary} />
      <Text style={styles.title}>Cuenta confirmada</Text>
      <Text style={styles.subtitle}>Volviendo al inicio de sesión...</Text>
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
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
})
