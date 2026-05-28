import { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { YStack, XStack, Text, Card, Avatar } from 'tamagui'
import LottieView from 'lottie-react-native'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { supabase } from '../../src/data/supabase/client'

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
        <Text>No has solicitado adopciones aún</Text>
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
            <Avatar circular size="$5">
              <Avatar.Image src={item.pets?.main_photo_url || ''} />
              <Avatar.Fallback backgroundColor="$backgroundHover">🐾</Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontWeight="bold">{item.pets?.name}</Text>
              <Text fontSize={12} color="$colorMuted">
                {item.shelters?.name} · {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </YStack>
            <Text
              fontSize={12} fontWeight="bold"
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
