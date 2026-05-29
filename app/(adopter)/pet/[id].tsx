import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { YStack, XStack, Text, Button, Card, Spinner } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { supabase } from '../../../src/data/supabase/client'

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
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack backgroundColor="$background">
        <Image
          source={pet.main_photo_url || PLACEHOLDER_IMAGE}
          contentFit="cover"
          transition={150}
          style={{ width: '100%', height: 280 }}
        />

        <YStack padding="$4" gap="$3">
          <YStack>
            <Text fontSize={24} fontWeight="bold">{pet.name}</Text>
            <XStack gap="$2" mt="$1">
              <Text color="$color" textTransform="capitalize">{pet.species}</Text>
              {pet.breed && <Text color="$color">- {pet.breed}</Text>}
              <Text color="$color">- {pet.gender === 'male' ? 'Macho' : 'Hembra'}</Text>
            </XStack>
          </YStack>

          <XStack gap="$2" flexWrap="wrap">
            {pet.is_vaccinated && <Text fontSize={12} backgroundColor="$green3" padding="$1" borderRadius={4}>Vacunado</Text>}
            {pet.is_sterilized && <Text fontSize={12} backgroundColor="$green3" padding="$1" borderRadius={4}>Esterilizado</Text>}
            {pet.is_dewormed && <Text fontSize={12} backgroundColor="$green3" padding="$1" borderRadius={4}>Desparasitado</Text>}
            <Text fontSize={12} backgroundColor="$backgroundHover" padding="$1" borderRadius={4}>
              {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Mediano' : 'Grande'}
            </Text>
          </XStack>

          {pet.description && (
            <YStack>
              <Text fontWeight="bold" fontSize={16}>Descripcion</Text>
              <Text color="$colorMuted" mt="$1">{pet.description}</Text>
            </YStack>
          )}

          <Card padding="$3" borderRadius={12} backgroundColor="$backgroundHover">
            <Text fontWeight="bold">{pet.shelters?.name}</Text>
            {pet.shelters?.address && <Text fontSize={13} color="$colorMuted">{pet.shelters?.address}</Text>}
            {pet.shelters?.phone && <Text fontSize={13} color="$colorMuted">{pet.shelters?.phone}</Text>}
          </Card>

          {pet.status === 'available' && (
            <Button onPress={handleAdopt}
              backgroundColor="$primary" size="$5">
              Solicitar adopción
            </Button>
          )}

          {pet.status !== 'available' && (
            <Button disabled backgroundColor="$gray8" size="$5">
              {pet.status === 'pending' ? 'En proceso de adopcion' : 'Ya adoptado'}
            </Button>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
