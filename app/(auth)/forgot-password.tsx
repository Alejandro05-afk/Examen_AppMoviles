import { useState } from 'react'
import { Alert } from 'react-native'
import { YStack, Text, Input, Button } from 'tamagui'
import { Link } from 'expo-router'
import { resetPasswordUseCase } from '../../src/di/container'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!email) return Alert.alert('Error', 'Ingresa tu email')
    setLoading(true)
    try {
      await resetPasswordUseCase.execute(email)
      setSent(true)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <YStack flex={1} padding="$6" gap="$4" justifyContent="center" backgroundColor="$background">
        <Text fontSize={22} fontWeight="bold" textAlign="center" color="$primary">
          📧 Revisa tu email
        </Text>
        <Text textAlign="center" color="$colorMuted">
          Te hemos enviado un enlace para restablecer tu contraseña.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Button>Volver al inicio de sesión</Button>
        </Link>
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$6" gap="$4" justifyContent="center" backgroundColor="$background">
      <Text fontSize={24} fontWeight="bold" textAlign="center">Restablecer Contraseña</Text>
      <Text textAlign="center" color="$colorMuted" mb="$2">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
      </Text>

      <Input placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" />

      <Button onPress={handleReset} disabled={loading} backgroundColor="$primary">
        {loading ? 'Enviando...' : 'Enviar enlace'}
      </Button>

      <Link href="/(auth)/login" asChild>
        <Text textAlign="center" color="$primary" fontSize={14} textDecorationLine="underline">
          Volver al inicio de sesión
        </Text>
      </Link>
    </YStack>
  )
}
