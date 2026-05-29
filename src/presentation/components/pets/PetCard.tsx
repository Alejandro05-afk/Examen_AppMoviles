import { Image } from 'expo-image'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, borderRadius, shadows } from '../../theme'
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

export const PetCard = ({ name, species, breed, mainPhotoUrl, status, onPress }: PetCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.cardContent}>
      <Image
        source={mainPhotoUrl || PLACEHOLDER_IMAGE}
        contentFit="cover"
        transition={150}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.species}>{species}{breed ? ` - ${breed}` : ''}</Text>
      </View>
      {status && (
        <View style={[
          styles.statusBadge,
          status === 'available' && styles.statusAvailable,
          status === 'pending' && styles.statusPending,
          status === 'adopted' && styles.statusAdopted
        ]}>
          <Feather
            name={status === 'available' ? 'check-circle' : status === 'pending' ? 'clock' : 'x-circle'}
            size={12}
            color={status === 'available' ? colors.secondary : status === 'pending' ? '#F5A623' : colors.alert}
          />
          <Text style={[
            styles.statusText,
            status === 'available' && styles.statusTextAvailable,
            status === 'pending' && styles.statusTextPending,
            status === 'adopted' && styles.statusTextAdopted
          ]}>
            {status === 'available' ? 'Disponible' : status === 'pending' ? 'Pendiente' : 'Adoptado'}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: borderRadius.md,
    ...shadows.card,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  species: {
    fontSize: 13,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusAvailable: {
    backgroundColor: '#E6F7ED',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusAdopted: {
    backgroundColor: '#FFE8E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextAvailable: {
    color: colors.secondary,
  },
  statusTextPending: {
    color: '#F5A623',
  },
  statusTextAdopted: {
    color: colors.alert,
  },
})

