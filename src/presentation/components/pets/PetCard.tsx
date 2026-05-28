import { Card, Image, Text, XStack, YStack } from 'tamagui'

interface PetCardProps {
  name: string
  species: string
  breed?: string
  mainPhotoUrl?: string
  status?: string
  onPress?: () => void
}

export const PetCard = ({ name, species, breed, mainPhotoUrl, status, onPress }: PetCardProps) => (
  <Card onPress={onPress} elevate padding="$3" borderRadius={12} pressStyle={{ opacity: 0.8 }}>
    <XStack gap="$3" alignItems="center">
      <Image
        source={{ uri: mainPhotoUrl || 'https://placehold.co/200x200/e2e8f0/a1a1aa?text=🐾' }}
        style={{ width: 72, height: 72, borderRadius: 12 }}
      />
      <YStack flex={1} gap="$1">
        <Text fontWeight="bold" fontSize={16}>{name}</Text>
        <Text fontSize={13} color="$colorMuted" textTransform="capitalize">{species}{breed ? ` · ${breed}` : ''}</Text>
      </YStack>
      {status && (
        <Text
          fontSize={12} fontWeight="bold" paddingHorizontal="$2" paddingVertical="$1" borderRadius={8}
          color={status === 'available' ? '$green10' : status === 'pending' ? '$yellow10' : '$red10'}
        >
          {status === 'available' ? 'Disponible' : status === 'pending' ? 'Pendiente' : 'Adoptado'}
        </Text>
      )}
    </XStack>
  </Card>
)
