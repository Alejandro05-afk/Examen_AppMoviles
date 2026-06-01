import { YStack, XStack, Text } from 'tamagui'
import { Callout, Marker } from 'react-native-maps'
import Feather from '@expo/vector-icons/Feather'

interface Props {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  phone?: string
}

export const ShelterMarker = ({ id, name, latitude, longitude, address, phone }: Props) => (
  <Marker
    key={id}
    coordinate={{ latitude, longitude }}
    title={name}
    pinColor="#FF6B6B"
  >
    <Callout>
      <YStack padding="$2" minWidth={150}>
        <Text fontWeight="bold" fontSize={14} color="$chocolate">{name}</Text>
        {address && <Text fontSize={12} color="$bark">{address}</Text>}
        {phone && (
          <XStack alignItems="center" marginTop="$1">
            <Feather name="phone" size={12} color="#8B6F47" />
            <Text fontSize={12} color="$bark"> {phone}</Text>
          </XStack>
        )}
      </YStack>
    </Callout>
  </Marker>
)
