import { useEffect, useState } from 'react'
import { FlatList, Alert } from 'react-native'
import { YStack, XStack, Text, Button, Card, Avatar, Spinner } from 'tamagui'
import LottieView from 'lottie-react-native'
import { useLocalSearchParams } from 'expo-router'
import { acceptAdoptionRequestUseCase, rejectAdoptionRequestUseCase } from '../../../../src/di/container'
import { supabase } from '../../../../src/data/supabase/client'

export default function AdoptionRequestsScreen() {
  const { id: petId } = useLocalSearchParams()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    const { data } = await supabase
      .from('adoption_requests')
      .select('*, profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('pet_id', petId)
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
        }
      }
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
        }
      }
    ])
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </YStack>
    )
  }

  if (requests.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        <LottieView source={require('../../../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
        <Text>No hay solicitudes aún</Text>
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
              <Text fontSize={12} color="$colorMuted">{new Date(item.created_at).toLocaleDateString()}</Text>
            </YStack>
            <Text
              fontSize={12} fontWeight="bold"
              color={item.status === 'pending' ? '$yellow10' : item.status === 'accepted' ? '$green10' : '$red10'}
            >
              {item.status === 'pending' ? 'Pendiente' : item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
            </Text>
          </XStack>

          {item.message && (
            <Text mt="$2" color="$colorMuted" fontSize={14}>{item.message}</Text>
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
