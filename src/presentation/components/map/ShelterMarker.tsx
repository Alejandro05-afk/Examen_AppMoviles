import { StyleSheet, Text, View } from 'react-native'
import { Callout, Marker } from 'react-native-maps'
import { colors } from '../../theme'
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
    pinColor={colors.primary}
  >
    <Callout>
      <View style={styles.container}>
        <Text style={styles.name}>{name}</Text>
        {address && <Text style={styles.detail}>{address}</Text>}
        {phone && <View style={styles.phoneRow}><Feather name="phone" size={12} color={colors.textLight} /><Text style={styles.detail}> {phone}</Text></View>}
      </View>
    </Callout>
  </Marker>
)

const styles = StyleSheet.create({
  container: {
    padding: 8,
    minWidth: 150,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.text,
  },
  detail: {
    fontSize: 12,
    color: colors.textLight,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
})
