import LottieView from 'lottie-react-native'
import { YStack, Text } from 'tamagui'

export const LottieSplash = () => (
  <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
    <LottieView
      source={require('../../../assets/lottie/paw-animation.json')}
      autoPlay loop style={{ width: 250, height: 250 }}
    />
    <Text fontSize={28} fontWeight="bold" color="$primary" mt="$4">PetAdopt 🐾</Text>
    <Text color="$colorMuted">Encuentra tu compañero perfecto</Text>
  </YStack>
)
