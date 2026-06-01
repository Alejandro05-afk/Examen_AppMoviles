import { Image } from 'expo-image'
import { TouchableOpacity, useWindowDimensions } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { colors } from '../../theme'
import Feather from '@expo/vector-icons/Feather'

const PLACEHOLDER_IMAGE = 'https://placehold.co/200x200/e2e8f0/a1a1aa?text=Pet'

interface PetCardProps {
  name: string
  species: string
  breed?: string
  mainPhotoUrl?: string
  status?: string
  onPress?: () => void
}

export const PetCard = ({ name, species, breed, mainPhotoUrl, status, onPress }: PetCardProps) => {
  const { width: screenWidth } = useWindowDimensions()
  const avatarSize = screenWidth > 400 ? 72 : 56
  return (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <XStack
      backgroundColor="$white"
      padding="$3"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$border"
      alignItems="center"
      gap="$3"
    >
      <Image
        source={mainPhotoUrl || PLACEHOLDER_IMAGE}
        contentFit="cover"
        transition={150}
        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize * 0.17 }}
      />
      <YStack flex={1} gap="$1">
        <Text fontSize={16} fontWeight="bold" color="$chocolate">{name}</Text>
        <Text fontSize={13} color="$bark" textTransform="capitalize">{species}{breed ? ` - ${breed}` : ''}</Text>
      </YStack>
      {status && (
        <XStack
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$sm"
          alignItems="center"
          gap="$1"
          backgroundColor={
            status === 'available' ? '#E6F7ED' :
            status === 'pending' ? '#FFF3E0' :
            '#FFE8E8'
          }
        >
          <Feather
            name={status === 'available' ? 'check-circle' : status === 'pending' ? 'clock' : 'x-circle'}
            size={12}
            color={status === 'available' ? colors.success : status === 'pending' ? colors.warning : colors.danger}
          />
          <Text
            fontSize={12}
            fontWeight="bold"
            color={
              status === 'available' ? colors.success :
              status === 'pending' ? colors.warning :
              colors.danger
            }
          >
            {status === 'available' ? 'Disponible' : status === 'pending' ? 'Pendiente' : 'Adoptado'}
          </Text>
        </XStack>
      )}
    </XStack>
  </TouchableOpacity>
  )
}
