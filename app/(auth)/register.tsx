import { useState } from 'react'
import { Alert, ActivityIndicator } from 'react-native'
import { Link, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { YStack, XStack, Text, Button, Input, H2 } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'
import { colors } from '../../src/presentation/theme'

export default function RegisterScreen() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'adopter' | 'shelter'>('adopter')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!fullName || !email || !password) return Alert.alert('Error', 'Completa todos los campos')
    if (password.length < 6) return Alert.alert('Error', 'La contrasena debe tener al menos 6 caracteres')
    if (!/\S+@\S+\.\S+/.test(email)) return Alert.alert('Error', 'Ingresa un email válido')
    setLoading(true)
    try {
      await register(email, password, fullName, role)
      router.replace('/(auth)/email-confirmation')
    } catch (e: any) {
      if (e.message === 'EMAIL_CONFIRMATION_REQUIRED') {
        router.replace('/(auth)/email-confirmation')
      } else {
        Alert.alert('Error', e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} padding="$6" justifyContent="center" backgroundColor="$cream" gap="$4">
      <StatusBar style="dark" />
      <YStack alignItems="center" gap="$2" marginBottom="$4">
        <Feather name="user-plus" size={40} color={colors.coral} />
        <H2 textAlign="center" color="$chocolate">Crear cuenta</H2>
      </YStack>

      <XStack alignItems="center" backgroundColor="$white" borderWidth={1} borderColor="$border" borderRadius="$md" paddingHorizontal="$3">
        <Feather name="user" size={18} color={colors.bark} style={{ marginRight: 10 }} />
        <Input
          flex={1}
          placeholder="Nombre completo"
          value={fullName}
          onChangeText={v => setFullName(v.replace(/[0-9]/g, ''))}
          borderWidth={0}
          backgroundColor="transparent"
          placeholderTextColor="$bark"
          fontSize="$6"
          paddingVertical={12}
        />
      </XStack>
      <XStack alignItems="center" backgroundColor="$white" borderWidth={1} borderColor="$border" borderRadius="$md" paddingHorizontal="$3">
        <Feather name="mail" size={18} color={colors.bark} style={{ marginRight: 10 }} />
        <Input
          flex={1}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          borderWidth={0}
          backgroundColor="transparent"
          placeholderTextColor="$bark"
          fontSize="$6"
          paddingVertical={12}
        />
      </XStack>
      <XStack alignItems="center" backgroundColor="$white" borderWidth={1} borderColor="$border" borderRadius="$md" paddingHorizontal="$3">
        <Feather name="lock" size={18} color={colors.bark} style={{ marginRight: 10 }} />
        <Input
          flex={1}
          placeholder="Contraseña (min. 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          borderWidth={0}
          backgroundColor="transparent"
          placeholderTextColor="$bark"
          fontSize="$6"
          paddingVertical={12}
        />
      </XStack>

      <XStack gap="$3">
        <Button
          flex={1}
          backgroundColor={role === 'adopter' ? '$coral' : '$white'}
          borderWidth={1}
          borderColor={role === 'adopter' ? '$coral' : '$border'}
          borderRadius="$md"
          pressStyle={{ backgroundColor: role === 'adopter' ? '$coralDeep' : '$sand' }}
          onPress={() => setRole('adopter')}
          icon={<Feather name="heart" size={16} color={role === 'adopter' ? 'white' : colors.chocolate} />}
        >
          <Text fontWeight="700" color={role === 'adopter' ? 'white' : '$chocolate'}>  Adoptante</Text>
        </Button>
        <Button
          flex={1}
          backgroundColor={role === 'shelter' ? '$coral' : '$white'}
          borderWidth={1}
          borderColor={role === 'shelter' ? '$coral' : '$border'}
          borderRadius="$md"
          pressStyle={{ backgroundColor: role === 'shelter' ? '$coralDeep' : '$sand' }}
          onPress={() => setRole('shelter')}
          icon={<Feather name="home" size={16} color={role === 'shelter' ? 'white' : colors.chocolate} />}
        >
          <Text fontWeight="700" color={role === 'shelter' ? 'white' : '$chocolate'}>  Refugio</Text>
        </Button>
      </XStack>

      <Button
        backgroundColor="$coral"
        borderRadius="$md"
        pressStyle={{ backgroundColor: '$coralDeep' }}
        disabled={loading}
        opacity={loading ? 0.7 : 1}
        onPress={handleRegister}
        icon={loading ? undefined : <Feather name="check" size={18} color="white" />}
      >
        {loading ? <ActivityIndicator color="white" /> : '  Crear cuenta'}
      </Button>

      <Link href="/(auth)/login" asChild>
        <Button backgroundColor="transparent" borderWidth={0} pressStyle={{ opacity: 0.7 }}>
          <Text textAlign="center" color="$coral" fontWeight="600" fontSize={14}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </Button>
      </Link>
    </YStack>
  )
}
