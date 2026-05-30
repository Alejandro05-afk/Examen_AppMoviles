import LottieView from 'lottie-react-native'
import { useEffect, useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'
import Ionicons from '@expo/vector-icons/Ionicons'

export const LottieSplash = () => {
  const splashRef = useRef<LottieView>(null)
  const pawRef = useRef<LottieView>(null)

  useEffect(() => {
    splashRef.current?.play()
    pawRef.current?.play()
  }, [])

  return (
    <View style={styles.container}>
      <LottieView
        ref={splashRef}
        source={require('../../../../assets/lottie/splash.json')}
        loop
        resizeMode="contain"
        style={{ width: 250, height: 250 }}
      />
      <LottieView
        ref={pawRef}
        source={require('../../../../assets/lottie/paw-animation.json')}
        loop
        resizeMode="contain"
        style={{ width: 60, height: 60, marginTop: 8 }}
      />
      <View style={styles.titleRow}>
        <Ionicons name="paw" size={28} color={colors.primary} />
        <Text style={styles.title}> PetAdopt</Text>
      </View>
      <Text style={styles.subtitle}>Encuentra tu compañero perfecto</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    color: colors.textLight,
    fontSize: 14,
    marginTop: 4,
  },
})
