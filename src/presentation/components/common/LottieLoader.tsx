import LottieView from 'lottie-react-native'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'

interface Props { message?: string }

export const LottieLoader = ({ message = 'Cargando...' }: Props) => (
  <View style={styles.container}>
    <LottieView
      source={require('../../../../assets/lottie/loading.json')}
      autoPlay loop style={{ width: 120, height: 120 }}
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
    marginTop: 8,
    color: colors.textLight,
    fontSize: 14,
  },
})
