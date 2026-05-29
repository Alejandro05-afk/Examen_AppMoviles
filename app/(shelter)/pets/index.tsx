import { useEffect, useState } from 'react'
import { FlatList, Alert } from 'react-native'
import { YStack, Text, Button } from 'tamagui'
import { Link, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { usePets } from '../../../src/presentation/hooks/usePets'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { PetCard } from '../../../src/presentation/components/pets/PetCard'
import { getOrCreateShelterForUser } from '../../../src/data/supabase/shelterHelpers'

export default function ShelterPetsScreen() {
  const router = useRouter()
  const { user, shelterId, setShelterId } = useAuthStore()
  const { shelterPets, fetchShelterPets, deletePet } = usePets()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPets()
  }, [])

  const loadPets = async () => {
    if (!user) return
    try {
      const currentShelterId = shelterId ?? await getOrCreateShelterForUser(user)
      setShelterId(currentShelterId)
      await fetchShelterPets(currentShelterId)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (petId: string, petName: string) => {
    Alert.alert('Eliminar', `¿Eliminar a ${petName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await deletePet(petId)
        } catch (e: any) {
          Alert.alert('Error', e.message)
        }
      }}
    ])
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </YStack>
    )
  }

  if (shelterPets.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$4">
        <LottieView source={require('../../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
        <Text fontSize={16} color="$colorMuted">No tienes mascotas registradas</Text>
        <Link href="/(shelter)/pets/create" asChild>
          <Button backgroundColor="$primary">Publicar mi primera mascota</Button>
        </Link>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={shelterPets}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <PetCard
            name={item.name}
            species={item.species}
            breed={item.breed}
            mainPhotoUrl={item.mainPhotoUrl}
            status={item.status}
            onPress={() => router.push(`/(shelter)/pets/${item.id}/edit` as any)}
          />
        )}
      />
      <Link href="/(shelter)/pets/create" asChild>
        <Button position="absolute" bottom={20} right={20}
          width={56} height={56} borderRadius={28}
          backgroundColor="$primary" elevate>
          +
        </Button>
      </Link>
    </YStack>
  )
}
