import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { YStack, XStack, Text, Card, Button } from 'tamagui'
import { Link } from 'expo-router'
import LottieView from 'lottie-react-native'
import * as Location from 'expo-location'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { usePets } from '../../src/presentation/hooks/usePets'
import { supabase } from '../../src/data/supabase/client'
import { getOrCreateShelterForUser } from '../../src/data/supabase/shelterHelpers'
import { shelterRepo } from '../../src/di/container'

export default function ShelterDashboard() {
  const { user, setShelterId } = useAuthStore()
  const { shelterPets, fetchShelterPets } = usePets()
  const [requestCount, setRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingLocation, setSavingLocation] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user) return
    try {
      const shelterId = await getOrCreateShelterForUser(user)
      setShelterId(shelterId)

      await fetchShelterPets(shelterId)
      const { count } = await supabase
        .from('adoption_requests')
        .select('*', { count: 'exact', head: true })
        .eq('shelter_id', shelterId)
        .eq('status', 'pending')
      setRequestCount(count ?? 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLocation = async () => {
    if (!user) return
    setSavingLocation(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Activa la ubicación para guardar tu refugio.')
        return
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const shelterId = await getOrCreateShelterForUser(user)
      await shelterRepo.updateShelterLocation(shelterId, pos.coords.latitude, pos.coords.longitude)
      setShelterId(shelterId)
      Alert.alert('Listo', 'Ubicación del refugio guardada.')
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar la ubicación')
    } finally {
      setSavingLocation(false)
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <Card padding="$4" borderRadius={12} backgroundColor="$primary" elevate>
        <Text color="white" fontSize={20} fontWeight="bold">
          Bienvenido, {user?.fullName?.split(' ')[0] ?? 'Refugio'} 🐾
        </Text>
        <Text color="white" opacity={0.8} mt="$1">
          Panel de administración de tu refugio
        </Text>
      </Card>

      <XStack gap="$3">
        <Link href="/(shelter)/pets" asChild>
          <Card flex={1} padding="$4" borderRadius={12} elevate pressStyle={{ opacity: 0.8 }}>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={32}>🐕</Text>
              <Text fontWeight="bold" fontSize={24}>{shelterPets.length}</Text>
              <Text fontSize={12} color="$colorMuted">Mascotas</Text>
            </YStack>
          </Card>
        </Link>
        <Link href="/(shelter)/requests" asChild>
          <Card flex={1} padding="$4" borderRadius={12} elevate pressStyle={{ opacity: 0.8 }}>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={32}>📋</Text>
              <Text fontWeight="bold" fontSize={24}>{requestCount}</Text>
              <Text fontSize={12} color="$colorMuted">Solicitudes</Text>
            </YStack>
          </Card>
        </Link>
      </XStack>

      <YStack gap="$2" mt="$2">
        <Link href="/(shelter)/pets" asChild>
          <Button backgroundColor="$primary" size="$5">Gestionar Mascotas</Button>
        </Link>
        <Link href="/(shelter)/pets/create" asChild>
          <Button variant="outlined" size="$5">Agregar Nueva Mascota</Button>
        </Link>
        <Button variant="outlined" size="$5" onPress={handleSaveLocation} disabled={savingLocation}>
          {savingLocation ? 'Guardando ubicación...' : 'Guardar mi ubicación'}
        </Button>
      </YStack>
    </YStack>
  )
}
