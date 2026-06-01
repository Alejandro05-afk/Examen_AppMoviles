import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useWindowDimensions } from 'react-native'
import { YStack, Button, Text } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'

export default function EmailConfirmationScreen() {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <YStack flex={1} padding="$6" justifyContent="center" alignItems="center" backgroundColor="$cream" gap="$4">
      <LottieView
        source={require('../../assets/lottie/success.json')}
        autoPlay
        loop={false}
        style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }}
      />
      <Text fontSize={screenWidth > 400 ? 24 : 20} fontWeight="800" textAlign="center" color="$chocolate">Revisa tu correo</Text>
      <Text fontSize={screenWidth > 400 ? 15 : 13} textAlign="center" color="$bark" lineHeight={22} paddingHorizontal="$4">
        Te hemos enviado un enlace de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
      </Text>
      <Button
        backgroundColor="$coral"
        borderRadius="$md"
        paddingHorizontal="$6"
        pressStyle={{ backgroundColor: '$coralDeep' }}
        onPress={() => router.replace('/(auth)/login')}
        icon={<Feather name="arrow-left" size={16} color="white" />}
      >
        <Text color="white" fontSize={screenWidth > 400 ? 16 : 14} fontWeight="700">  Volver al inicio de sesión</Text>
      </Button>
    </YStack>
  )
}
