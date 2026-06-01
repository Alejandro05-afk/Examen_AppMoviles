import LottieView from 'lottie-react-native'
import { useEffect, useRef } from 'react'
import { useWindowDimensions } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'

export const LottieSplash = () => {
  const splashRef = useRef<LottieView>(null)
  const pawRef = useRef<LottieView>(null)
  const { width: screenWidth } = useWindowDimensions()
  const isSmall = screenWidth < 380

  useEffect(() => {
    splashRef.current?.play()
    pawRef.current?.play()
  }, [])

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
      <LottieView
        ref={splashRef}
        source={require('../../../../assets/lottie/splash.json')}
        loop
        resizeMode="contain"
        style={{ width: screenWidth * 0.65, height: screenWidth * 0.65 }}
      />
      <LottieView
        ref={pawRef}
        source={require('../../../../assets/lottie/paw-animation.json')}
        loop
        resizeMode="contain"
        style={{ width: screenWidth * 0.15, height: screenWidth * 0.15, marginTop: 8 }}
      />
      <XStack alignItems="center" marginTop="$4">
        <Ionicons name="paw" size={isSmall ? 22 : 28} color="#FF6B6B" />
        <Text fontSize={isSmall ? 22 : 28} fontWeight="bold" color="$coral"> PetAdopt</Text>
      </XStack>
      <Text color="$bark" fontSize={isSmall ? 12 : 14} marginTop="$1">Encuentra tu compañero perfecto</Text>
    </YStack>
  )
}
