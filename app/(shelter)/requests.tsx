import { useEffect, useState } from 'react'
import { FlatList, Alert } from 'react-native'
import { YStack, XStack, Text, Button, Card, Avatar, Spinner } from 'tamagui'
import LottieView from 'lottie-react-native'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { getOrCreateShelterForUser } from '../../src/data/supabase/shelterHelpers'
import { supabase } from '../../src/data/supabase/client'
import { acceptAdoptionRequestUseCase, rejectAdoptionRequestUseCase } from '../../src/di/container'

export default function ShelterRequestsScreen() {
  const { user, setShelterId } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    if (!user) return
    const shelterId = await getOrCreateShelterForUser(user)
    setShelterId(shelterId)

    const { data } = await supabase
      .from('adoption_requests')
      .select('*, profiles!adopter_id(full_name, avatar_url, phone), pets(name, main_photo_url)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    setRequests(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  const handleAccept = (requestId: string) => {
    Alert.alert('Aceptar solicitud', '¿Seguro que deseas aceptar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: async () => {
          await acceptAdoptionRequestUseCase.execute(requestId, '¡Felicitaciones! Tu solicitud ha sido aprobada.')
          loadRequests()
        },
      },
    ])
  }

  const handleReject = (requestId: string) => {
    Alert.alert('Rechazar solicitud', '¿Seguro que deseas rechazar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          await rejectAdoptionRequestUseCase.execute(requestId, 'Lamentablemente tu solicitud no fue aprobada en esta ocasión.')
          loadRequests()
        },
      },
    ])
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
        <Text fontSize={48}>📋</Text>
        <Text>No hay solicitudes de adopción</Text>
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
              <Avatar.Image src={item.profiles?.avatar_url || ''} />
              <Avatar.Fallback backgroundColor="$backgroundHover">
                <Text>{item.profiles?.full_name?.[0] ?? '?'}</Text>
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontWeight="bold">{item.profiles?.full_name}</Text>
              <Text fontSize={12} color="$colorMuted">
                {item.pets?.name} · {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </YStack>
            <Text
              fontSize={12} fontWeight="bold"
              color={item.status === 'pending' ? '$yellow10' : item.status === 'accepted' ? '$green10' : '$red10'}
            >
              {item.status === 'pending' ? 'Pendiente' : item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
            </Text>
          </XStack>

          {item.message && (
            <YStack mt="$3" backgroundColor="$backgroundHover" padding="$3" borderRadius={8}>
              <Text fontSize={13} fontWeight="600" color="$colorMuted" mb="$1">Mensaje del solicitante:</Text>
              <Text fontSize={14}>{item.message}</Text>
            </YStack>
          )}

          {item.status === 'pending' && (
            <XStack gap="$2" mt="$3">
              <Button flex={1} backgroundColor="$green8" onPress={() => handleAccept(item.id)}>Aceptar</Button>
              <Button flex={1} backgroundColor="$red8" onPress={() => handleReject(item.id)}>Rechazar</Button>
            </XStack>
          )}
        </Card>
      )}
    />
  )
}