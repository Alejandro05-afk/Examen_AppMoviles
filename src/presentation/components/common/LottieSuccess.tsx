import LottieView from 'lottie-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

interface Props { message: string; onFinish?: () => void }

export const LottieSuccess = ({ message, onFinish }: Props) => (
  <View style={styles.container}>
    <LottieView
      source={require('../../../../assets/lottie/success.json')}
      autoPlay loop={false}
      onAnimationFinish={onFinish}
      style={{ width: 180, height: 180 }}
    />
    <Text style={styles.message}>{message}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
})
