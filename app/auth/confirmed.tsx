import { useEffect } from 'react'
import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useWindowDimensions } from 'react-native'
import { YStack, Text } from 'tamagui'

export default function AuthConfirmedScreen() {
  const { width: screenWidth } = useWindowDimensions()

  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/login'), 1200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6" backgroundColor="$cream">
      <LottieView source={require('../../assets/lottie/success.json')} autoPlay loop={false} style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
      <Text fontSize={screenWidth > 400 ? 22 : 18} fontWeight="700" color="$chocolate">Cuenta confirmada</Text>
      <Text fontSize={screenWidth > 400 ? 14 : 12} color="$bark">Volviendo al inicio de sesión...</Text>
    </YStack>
  )
}
