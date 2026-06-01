import { useEffect, useRef, useState } from 'react'
import { Alert, ActivityIndicator, useWindowDimensions } from 'react-native'
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import LottieView from 'lottie-react-native'
import { useAuth } from '../../src/presentation/hooks/useAuth'
import { YStack, XStack, Text, Button, Input, Separator } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'
import { colors } from '../../src/presentation/theme'

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth()
  const { width: screenWidth } = useWindowDimensions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const animRef = useRef<LottieView>(null)

  useEffect(() => {
    animRef.current?.play()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos')
    if (!/\S+@\S+\.\S+/.test(email)) return Alert.alert('Error', 'Ingresa un email válido')
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
    <YStack flex={1} padding="$6" justifyContent="center" backgroundColor="$cream" gap="$4">
      <StatusBar style="dark" />
      <YStack alignItems="center" gap="$2" marginBottom="$4">
        <LottieView
          ref={animRef}
          source={require('../../assets/lottie/paw-animation.json')}
          loop
          resizeMode="contain"
          style={{ width: screenWidth * 0.25, height: screenWidth * 0.25 }}
        />
        <Text fontSize={screenWidth > 400 ? 32 : 26} fontWeight="800" textAlign="center" color="$chocolate">
          PetAdopt
        </Text>
        <Text fontSize={screenWidth > 400 ? 15 : 13} textAlign="center" color="$bark">
          Inicia sesión para continuar
        </Text>
      </YStack>

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
          paddingVertical={14}
        />
      </XStack>
      <XStack alignItems="center" backgroundColor="$white" borderWidth={1} borderColor="$border" borderRadius="$md" paddingHorizontal="$3">
        <Feather name="lock" size={18} color={colors.bark} style={{ marginRight: 10 }} />
        <Input
          flex={1}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          borderWidth={0}
          backgroundColor="transparent"
          placeholderTextColor="$bark"
          fontSize="$6"
          paddingVertical={14}
        />
      </XStack>

      <Button
        backgroundColor="$coral"
        borderRadius="$md"
        pressStyle={{ backgroundColor: '$coralDeep' }}
        disabled={loading}
        opacity={loading ? 0.7 : 1}
        onPress={handleLogin}
        icon={<Feather name="log-in" size={18} color="white" />}
      >
        {loading ? <ActivityIndicator color="white" /> : '  Iniciar Sesión'}
      </Button>

      <XStack alignItems="center" gap="$3">
        <Separator flex={1} borderColor="$border" />
        <Text color="$bark" fontSize={14}>o</Text>
        <Separator flex={1} borderColor="$border" />
      </XStack>

      <Button
        variant="outlined"
        borderColor="$coral"
        borderRadius="$md"
        backgroundColor="$white"
        pressStyle={{ backgroundColor: '$sand' }}
        disabled={loading}
        opacity={loading ? 0.7 : 1}
        onPress={handleGoogleLogin}
        icon={<Feather name="globe" size={18} color={colors.coral} />}
      >
        {'  Continuar con Google'}
      </Button>

      <YStack gap="$3" marginTop="$2">
        <Link href="/(auth)/register" asChild>
          <Button
            variant="outlined"
            borderColor="$border"
            borderRadius="$md"
            backgroundColor="$white"
            pressStyle={{ backgroundColor: '$sand' }}
            icon={<Feather name="user-plus" size={16} color={colors.chocolate} />}
          >
            <Text fontWeight="700" color="$chocolate">  Crear cuenta</Text>
          </Button>
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <Button backgroundColor="transparent" borderWidth={0} pressStyle={{ opacity: 0.7 }}>
            <Text textAlign="center" color="$coral" fontWeight="600" fontSize={14}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Button>
        </Link>
      </YStack>
    </YStack>
  )
}
