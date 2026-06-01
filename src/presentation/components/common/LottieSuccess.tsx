import LottieView from 'lottie-react-native';
import { useWindowDimensions } from 'react-native';
import { YStack, Text } from 'tamagui';

interface Props { message: string; onFinish?: () => void }

export const LottieSuccess = ({ message, onFinish }: Props) => {
  const { width: screenWidth } = useWindowDimensions()
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <LottieView
        source={require('../../../../assets/lottie/success.json')}
        autoPlay loop={false}
        onAnimationFinish={onFinish}
        style={{ width: screenWidth * 0.45, height: screenWidth * 0.45 }}
      />
      <Text fontSize={screenWidth > 400 ? 18 : 16} fontWeight="bold" color="$chocolate" marginTop="$3">{message}</Text>
    </YStack>
  )
}
