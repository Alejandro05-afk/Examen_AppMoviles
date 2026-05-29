import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../src/data/supabase/client'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { colors, borderRadius, shadows, typography } from '../../../src/presentation/theme'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x600/e2e8f0/a1a1aa?text=Pet'

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPet()
  }, [])

  const loadPet = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*, shelters(name, address, phone, description)')
      .eq('id', id)
      .single()
    setPet(data)
    setLoading(false)
  }

  const handleAdopt = () => {
    router.push(`/(adopter)/adopt-form?petId=${id}&shelterId=${pet.shelter_id}&petName=${encodeURIComponent(pet.name)}`)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Image
          source={pet.main_photo_url || PLACEHOLDER_IMAGE}
          contentFit="cover"
          transition={150}
          style={styles.image}
        />

        <View style={styles.info}>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={styles.details}>
              <Feather name={pet.species === 'dog' ? 'user' : pet.species === 'cat' ? 'user' : 'user'} size={14} color={colors.textLight} />
              <Text style={styles.detail}>{pet.species}</Text>
              {pet.breed && <Text style={styles.detail}>• {pet.breed}</Text>}
              <Text style={styles.detail}>• {pet.gender === 'male' ? 'Macho' : 'Hembra'}</Text>
            </View>
          </View>

          <View style={styles.badges}>
            {pet.is_vaccinated && <View style={styles.badge}><Feather name="check" size={12} color={colors.secondary} /><Text style={styles.badgeText}> Vacunado</Text></View>}
            {pet.is_sterilized && <View style={styles.badge}><Feather name="check" size={12} color={colors.secondary} /><Text style={styles.badgeText}> Esterilizado</Text></View>}
            {pet.is_dewormed && <View style={styles.badge}><Feather name="check" size={12} color={colors.secondary} /><Text style={styles.badgeText}> Desparasitado</Text></View>}
            <View style={[styles.badge, styles.sizeBadge]}>
              <Feather name="maximize" size={12} color={colors.textLight} />
              <Text style={styles.badgeText}> {pet.size === 'small' ? 'Pequeño' : pet.size === 'medium' ? 'Mediano' : 'Grande'}</Text>
            </View>
          </View>

          {pet.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{pet.description}</Text>
            </View>
          )}

          <View style={styles.shelterCard}>
            <View style={styles.shelterHeader}>
              <Feather name="home" size={18} color={colors.primary} />
              <Text style={styles.shelterName}> {pet.shelters?.name}</Text>
            </View>
            {pet.shelters?.address && <View style={styles.shelterRow}><Feather name="map-pin" size={14} color={colors.textLight} /><Text style={styles.shelterDetail}> {pet.shelters?.address}</Text></View>}
            {pet.shelters?.phone && <View style={styles.shelterRow}><Feather name="phone" size={14} color={colors.textLight} /><Text style={styles.shelterDetail}> {pet.shelters?.phone}</Text></View>}
          </View>

          {pet.status === 'available' && (
            <TouchableOpacity style={styles.button} onPress={handleAdopt}>
              <Feather name="heart" size={18} color="white" />
              <Text style={styles.buttonText}>  Solicitar adopción</Text>
            </TouchableOpacity>
          )}

          {pet.status !== 'available' && (
            <TouchableOpacity style={[styles.button, styles.buttonDisabled]} disabled>
              <Feather name={pet.status === 'pending' ? 'clock' : 'x-circle'} size={18} color="white" />
              <Text style={styles.buttonText}>  {pet.status === 'pending' ? 'En proceso de adopción' : 'Ya adoptado'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: 280,
  },
  info: {
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    gap: 4,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  details: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    alignItems: 'center',
  },
  detail: {
    ...typography.body,
    color: colors.text,
    textTransform: 'capitalize',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sizeBadge: {
    backgroundColor: colors.background,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  shelterCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.md,
    gap: 8,
    ...shadows.card,
  },
  shelterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shelterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  shelterDetail: {
    fontSize: 13,
    color: colors.textLight,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.button,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
})
