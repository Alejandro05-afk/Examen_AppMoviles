import { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { Image } from 'expo-image'
import { YStack, XStack, Text, Card } from 'tamagui'
import LottieView from 'lottie-react-native'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { supabase } from '../../src/data/supabase/client'

const PLACEHOLDER_IMAGE = 'https://placehold.co/120x120/e2e8f0/a1a1aa?text=Pet'

export default function MyRequestsScreen() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const { data } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url, species), shelters(name)')
      .eq('adopter_id', user!.id)
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </YStack>
    )
  }

  if (requests.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        <LottieView source={require('../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
        <Text>No has solicitado adopciones aun</Text>
      </YStack>
    )
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Card padding="$4" borderRadius={12} elevate>
          <XStack gap="$3" alignItems="center">
            <Image
              source={item.pets?.main_photo_url || PLACEHOLDER_IMAGE}
              contentFit="cover"
              transition={150}
              style={{ width: 56, height: 56, borderRadius: 28 }}
            />
            <YStack flex={1}>
              <Text fontWeight="bold">{item.pets?.name}</Text>
              <Text fontSize={12} color="$colorMuted">
                {item.shelters?.name} - {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </YStack>
            <Text
              fontSize={12}
              fontWeight="bold"
              color={item.status === 'pending' ? '$yellow10' : item.status === 'accepted' ? '$green10' : '$red10'}
            >
              {item.status === 'pending' ? 'Pendiente' : item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
            </Text>
          </XStack>
          {item.shelter_response && (
            <Text mt="$2" fontSize={13} color="$colorMuted" fontStyle="italic">
              Respuesta: {item.shelter_response}
            </Text>
          )}
        </Card>
      )}
    />
  )
}
