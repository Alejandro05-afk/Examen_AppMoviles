import { useEffect, useState } from 'react'
import { YStack, XStack, Text, Card, Button } from 'tamagui'
import { Link } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { usePets } from '../../src/presentation/hooks/usePets'
import { supabase } from '../../src/data/supabase/client'

export default function ShelterDashboard() {
  const { user } = useAuthStore()
  const { shelterPets, fetchShelterPets } = usePets()
  const [requestCount, setRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user) return
    const { data: shelter } = await supabase
      .from('shelters')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (shelter) {
      await fetchShelterPets(shelter.id)
      const { count } = await supabase
        .from('adoption_requests')
        .select('*', { count: 'exact', head: true })
        .eq('shelter_id', shelter.id)
        .eq('status', 'pending')
      setRequestCount(count ?? 0)
    }
    setLoading(false)
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
        <Card flex={1} padding="$4" borderRadius={12} elevate>
          <YStack alignItems="center" gap="$2">
            <Text fontSize={32}>📋</Text>
            <Text fontWeight="bold" fontSize={24}>{requestCount}</Text>
            <Text fontSize={12} color="$colorMuted">Solicitudes</Text>
          </YStack>
        </Card>
      </XStack>

      <YStack gap="$2" mt="$2">
        <Link href="/(shelter)/pets" asChild>
          <Button backgroundColor="$primary" size="$5">Gestionar Mascotas</Button>
        </Link>
        <Link href="/(shelter)/pets/create" asChild>
          <Button variant="outlined" size="$5">Agregar Nueva Mascota</Button>
        </Link>
      </YStack>
    </YStack>
  )
}
