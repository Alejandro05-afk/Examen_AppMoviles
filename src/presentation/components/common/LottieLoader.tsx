import LottieView from 'lottie-react-native'
import { YStack, Text } from 'tamagui'

interface Props { message?: string }

export const LottieLoader = ({ message = 'Cargando...' }: Props) => (
  <YStack flex={1} alignItems="center" justifyContent="center">
    <LottieView
      source={require('../../../assets/lottie/loading.json')}
      autoPlay loop style={{ width: 120, height: 120 }}
    />
    <Text mt="$2" color="$colorMuted">{message}</Text>
  </YStack>
)
