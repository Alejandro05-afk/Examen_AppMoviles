import Feather from '@expo/vector-icons/Feather'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, borderRadius } from '../../theme'

interface PetUiCardProps {
  id: string
  name: string
  species: string
  breed?: string
  age?: string
  mainPhotoUrl?: string
  location?: string
  onPress?: () => void
}

export const PetUiCard = ({ id, name, species, breed, age, mainPhotoUrl, location = 'Quito', onPress }: PetUiCardProps) => {
  const router = useRouter()
  const [liked, setLiked] = useState(false)

  const handlePress = onPress ?? (() => router.push(`/(adopter)/pet/${id}`))

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={handlePress}
    >
      <Image
        source={{ uri: mainPhotoUrl || 'https://placehold.co/400x500/e2e8f0/a1a1aa?text=Pet' }}
        contentFit="cover"
        style={styles.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 1]}
        style={styles.absoluteFill}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.likeButton, liked && styles.likeButtonActive]}
        onPress={(e: any) => { e.stopPropagation(); setLiked(!liked) }}
      >
        <Feather name="heart" color="white" fill={liked ? 'white' : 'transparent'} size={16} />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.badgeContainer}>
          <View style={styles.speciesBadge}>
            <Text style={styles.badgeText}>{species}</Text>
          </View>
          {breed && (
            <View style={styles.breedBadge}>
              <Text style={styles.badgeText}>{breed}</Text>
            </View>
          )}
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.nameText}>{name}</Text>
          {age && <Text style={styles.ageText}>• {age}</Text>}
        </View>
        <View style={styles.locationRow}>
          <Feather name="map-pin" color="#FFF" size={14} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    height: 420,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 4,
    position: 'relative',
  },
  likeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  likeButtonActive: {
    backgroundColor: colors.alert,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  speciesBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  breedBadge: {
    backgroundColor: 'rgba(74,144,226,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  nameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  ageText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.9,
  },
  locationText: {
    color: 'white',
    fontSize: 13,
  },
})