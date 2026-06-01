import LottieView from 'lottie-react-native'
import { useWindowDimensions } from 'react-native'
import { YStack, Text } from 'tamagui'

interface Props { message?: string }

export const LottieLoader = ({ message = 'Cargando...' }: Props) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <LottieView
        source={require('../../../../assets/lottie/loading.json')}
        autoPlay loop style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }}
      />
      <Text marginTop="$2" color="$bark" fontSize={screenWidth > 400 ? 14 : 12}>{message}</Text>
    </YStack>
  )
}
