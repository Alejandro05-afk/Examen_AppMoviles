import { Marker, Callout } from 'react-native-maps'
import { YStack, Text } from 'tamagui'

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
    pinColor="red"
  >
    <Callout>
      <YStack padding="$2" minWidth={150}>
        <Text fontWeight="bold">{name}</Text>
        {address && <Text fontSize={12}>{address}</Text>}
        {phone && <Text fontSize={12}>📞 {phone}</Text>}
      </YStack>
    </Callout>
  </Marker>
)
