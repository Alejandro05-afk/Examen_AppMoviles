import { useState } from 'react'
import { Alert } from 'react-native'
import { YStack, Text, Input, Button, Spinner } from 'tamagui'
import { Link } from 'expo-router'
import { useAuth } from '../../src/presentation/hooks/useAuth'

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos')
    setLoading(true)
    try {
      await login(email, password)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} padding="$6" gap="$4" justifyContent="center" backgroundColor="$background">
      <Text fontSize={28} fontWeight="bold" textAlign="center" color="$primary">PetAdopt 🐾</Text>
      <Text fontSize={16} textAlign="center" color="$colorMuted" mb="$4">Inicia sesión para continuar</Text>

      <Input placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" />
      <Input placeholder="Contraseña" value={password} onChangeText={setPassword}
        secureTextEntry />

      <Button onPress={handleLogin} disabled={loading}
        backgroundColor="$primary" icon={loading ? <Spinner /> : undefined}>
        {loading ? 'Entrando...' : 'Iniciar Sesión'}
      </Button>

      <Button onPress={handleGoogleLogin} variant="outlined" disabled={loading}>
        Continuar con Google
      </Button>

      <YStack gap="$2" mt="$4">
        <Link href="/(auth)/register" asChild>
          <Button variant="outlined">Crear cuenta</Button>
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <Text textAlign="center" color="$primary" fontSize={14} textDecorationLine="underline">
            ¿Olvidaste tu contraseña?
          </Text>
        </Link>
      </YStack>
    </YStack>
  )
}
