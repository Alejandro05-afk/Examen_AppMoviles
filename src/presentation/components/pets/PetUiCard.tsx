import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { TouchableOpacity, useWindowDimensions } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { colors } from '../../theme'

interface PetUiCardProps {
  id: string
  name: string
  species: string
  breed?: string
  age?: string
  mainPhotoUrl?: string
  location?: string
  onPress?: () => void
  screenWidth?: number
}

export const PetUiCard = ({ id, name, species, breed, age, mainPhotoUrl, location = 'Quito', onPress, screenWidth }: PetUiCardProps) => {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const { width: winWidth } = useWindowDimensions()
  const width = screenWidth ?? winWidth
  const cardWidth = width - 32
  const cardHeight = Math.min(cardWidth * 1.15, 480)

  const handlePress = onPress ?? (() => router.push(`/(adopter)/pet/${id}`))

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: '100%',
        height: cardHeight,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
        elevation: 4,
        position: 'relative',
      }}
      onPress={handlePress}
    >
      <Image
        source={{ uri: mainPhotoUrl || 'https://placehold.co/400x500/e2e8f0/a1a1aa?text=Pet' }}
        contentFit="cover"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          top: cardHeight * 0.035,
          right: cardHeight * 0.035,
          width: Math.min(40, cardWidth * 0.1),
          height: Math.min(40, cardWidth * 0.1),
          borderRadius: Math.min(20, cardWidth * 0.05),
          backgroundColor: liked ? colors.coral : 'rgba(255,255,255,0.25)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        onPress={(e: any) => { e.stopPropagation(); setLiked(!liked) }}
      >
        <Feather name="heart" color="white" size={Math.min(16, cardWidth * 0.04)} />
      </TouchableOpacity>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$4"
        gap="$1.5"
      >
        <XStack gap="$2">
          <XStack backgroundColor="rgba(255,255,255,0.25)" paddingHorizontal="$2.5" paddingVertical="$1" borderRadius={100}>
            <Text color="white" fontSize={Math.min(11, cardWidth * 0.028)} fontWeight="700" textTransform="uppercase">{species}</Text>
          </XStack>
          {breed && (
            <XStack backgroundColor="rgba(255,107,107,0.4)" paddingHorizontal="$2.5" paddingVertical="$1" borderRadius={100}>
              <Text color="white" fontSize={Math.min(11, cardWidth * 0.028)} fontWeight="700" textTransform="uppercase">{breed}</Text>
            </XStack>
          )}
        </XStack>
        <XStack alignItems="baseline" gap="$2">
          <Text color="white" fontSize={Math.min(24, cardWidth * 0.06)} fontWeight="bold">{name}</Text>
          {age && <Text color="rgba(255,255,255,0.8)" fontSize={Math.min(16, cardWidth * 0.04)}>• {age}</Text>}
        </XStack>
        <XStack alignItems="center" gap="$1" opacity={0.9}>
          <Feather name="map-pin" color="#FFF" size={Math.min(14, cardWidth * 0.036)} />
          <Text color="white" fontSize={Math.min(13, cardWidth * 0.033)}>{location}</Text>
        </XStack>
      </YStack>
    </TouchableOpacity>
  )
}
