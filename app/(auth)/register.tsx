import { useState } from 'react'
import { Alert } from 'react-native'
import { YStack, XStack, Text, Input, Button, Spinner } from 'tamagui'
import { Link, useRouter } from 'expo-router'
import { useAuth } from '../../src/presentation/hooks/useAuth'

export default function RegisterScreen() {
  const router = useRouter()
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'adopter' | 'shelter'>('adopter')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName || !email || !password) return Alert.alert('Error', 'Completa todos los campos')
    if (password.length < 6) return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(email, password, fullName, role)
      Alert.alert('Cuenta creada', 'Revisa tu email para confirmar tu cuenta', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ])
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} padding="$6" gap="$4" justifyContent="center" backgroundColor="$background">
      <Text fontSize={28} fontWeight="bold" textAlign="center" color="$primary">Crear Cuenta</Text>

      <Input placeholder="Nombre completo" value={fullName} onChangeText={setFullName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" />
      <Input placeholder="Contraseña (mín. 6 caracteres)" value={password}
        onChangeText={setPassword} secureTextEntry />

      <YStack gap="$2">
        <Text fontSize={14} color="$colorMuted">Tipo de cuenta</Text>
        <XStack gap="$2">
          <Button flex={1} onPress={() => setRole('adopter')}
            backgroundColor={role === 'adopter' ? '$primary' : '$backgroundHover'}>
            Adoptante
          </Button>
          <Button flex={1} onPress={() => setRole('shelter')}
            backgroundColor={role === 'shelter' ? '$primary' : '$backgroundHover'}>
            Refugio
          </Button>
        </XStack>
      </YStack>

      <Button onPress={handleRegister} disabled={loading}
        backgroundColor="$primary" icon={loading ? <Spinner /> : undefined}>
        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>

      <Link href="/(auth)/login" asChild>
        <Text textAlign="center" color="$primary" fontSize={14} textDecorationLine="underline">
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </Link>
    </YStack>
  )
}
