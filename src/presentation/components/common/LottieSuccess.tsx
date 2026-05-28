import LottieView from 'lottie-react-native'
import { YStack, Text } from 'tamagui'

interface Props { message: string; onFinish?: () => void }

export const LottieSuccess = ({ message, onFinish }: Props) => (
  <YStack flex={1} alignItems="center" justifyContent="center">
    <LottieView
      source={require('../../../assets/lottie/success.json')}
      autoPlay loop={false}
      onAnimationFinish={onFinish}
      style={{ width: 180, height: 180 }}
    />
    <Text fontSize={18} fontWeight="bold" mt="$3">{message}</Text>
  </YStack>
)
