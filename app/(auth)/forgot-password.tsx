import { useState } from 'react'
import { Alert, ActivityIndicator, useWindowDimensions } from 'react-native'
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import LottieView from 'lottie-react-native'
import { resetPasswordUseCase } from '../../src/di/container'
import { YStack, XStack, Text, Button, Input } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'
import { colors } from '../../src/presentation/theme'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { width: screenWidth } = useWindowDimensions()

  const handleReset = async () => {
    if (!email) return Alert.alert('Error', 'Ingresa tu email')
    if (!/\S+@\S+\.\S+/.test(email)) return Alert.alert('Error', 'Ingresa un email válido')
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
      <YStack flex={1} padding="$6" justifyContent="center" alignItems="center" backgroundColor="$cream" gap="$4">
        <LottieView source={require('../../assets/lottie/success.json')} autoPlay loop={false} style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
        <Text fontSize={screenWidth > 400 ? 24 : 20} fontWeight="800" textAlign="center" color="$chocolate">Revisa tu email</Text>
        <Text fontSize={screenWidth > 400 ? 15 : 13} textAlign="center" color="$bark" paddingHorizontal="$4">Te hemos enviado un enlace para restablecer tu contraseña.</Text>
        <Link href="/(auth)/login" asChild>
          <Button
            variant="outlined"
            borderColor="$coral"
            borderRadius="$md"
            backgroundColor="$white"
            pressStyle={{ backgroundColor: '$sand' }}
            icon={<Feather name="arrow-left" size={18} color={colors.coral} />}
          >
            <Text fontWeight="700" color="$coral" fontSize={screenWidth > 400 ? 16 : 14}>  Volver al inicio de sesión</Text>
          </Button>
        </Link>
      </YStack>
    )
  }

  return (
    <YStack flex={1} padding="$6" justifyContent="center" alignItems="center" backgroundColor="$cream" gap="$4">
      <StatusBar style="dark" />
      <Feather name="lock" size={screenWidth > 400 ? 48 : 36} color={colors.coral} />
      <Text fontSize={screenWidth > 400 ? 24 : 20} fontWeight="800" textAlign="center" color="$chocolate">Restablecer contraseña</Text>
      <Text fontSize={screenWidth > 400 ? 15 : 13} textAlign="center" color="$bark" paddingHorizontal="$4">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</Text>

      <XStack alignItems="center" backgroundColor="$white" borderWidth={1} borderColor="$border" borderRadius="$md" paddingHorizontal="$3" width="100%">
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

      <Button
        backgroundColor="$coral"
        borderRadius="$md"
        width="100%"
        pressStyle={{ backgroundColor: '$coralDeep' }}
        disabled={loading}
        opacity={loading ? 0.7 : 1}
        onPress={handleReset}
        icon={loading ? undefined : <Feather name="send" size={18} color="white" />}
      >
        {loading ? <ActivityIndicator color="white" /> : '  Enviar enlace'}
      </Button>

      <Link href="/(auth)/login" asChild>
        <Button backgroundColor="transparent" borderWidth={0} pressStyle={{ opacity: 0.7 }}>
          <Text textAlign="center" color="$coral" fontWeight="600" fontSize={screenWidth > 400 ? 14 : 12}>
            Volver al inicio de sesión
          </Text>
        </Button>
      </Link>
    </YStack>
  )
}
