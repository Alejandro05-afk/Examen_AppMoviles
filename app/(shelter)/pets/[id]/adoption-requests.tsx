import { useLocalSearchParams, router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Image, TouchableOpacity, useWindowDimensions } from 'react-native'
import { supabase } from '../../../../src/data/supabase/client'
import { acceptAdoptionRequestUseCase, rejectAdoptionRequestUseCase } from '../../../../src/di/container'
import { StatusBar } from 'expo-status-bar'
import { YStack, XStack, Text } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'

export default function AdoptionRequestsScreen() {
  const { id: petId } = useLocalSearchParams()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { width: screenWidth } = useWindowDimensions()
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)

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
          setShowHeartAnimation(true)
          setTimeout(() => { setShowHeartAnimation(false); loadRequests() }, 2000)
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
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <LottieView source={require('../../../../assets/lottie/loading.json')} autoPlay loop style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
      </YStack>
    )
  }

  if (requests.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <LottieView source={require('../../../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: screenWidth * 0.4, height: screenWidth * 0.4 }} />
        <Text fontSize={screenWidth > 400 ? 16 : 14} color="$bark" marginTop="$4">No hay solicitudes aún</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      <StatusBar style="dark" />
      {showHeartAnimation && (
        <YStack position="absolute" top={0} left={0} right={0} bottom={0} zIndex={100} backgroundColor="rgba(255,248,240,0.85)" alignItems="center" justifyContent="center">
          <LottieView source={require('../../../../assets/lottie/heart.json')} autoPlay loop={false} style={{ width: screenWidth * 0.4, height: screenWidth * 0.4 }} />
          <Text fontSize={18} fontWeight="bold" color="$chocolate" marginTop="$4">Solicitud aceptada</Text>
        </YStack>
      )}
      <FlatList
      data={requests}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <YStack backgroundColor="white" padding="$4" borderRadius="$lg" gap="$3" elevation={2} shadowColor="#000" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={4}>
          <XStack alignItems="center" gap="$3">
            <YStack width={40} height={40} borderRadius={20} overflow="hidden">
              {item.profiles?.avatar_url ? (
                <Image source={{ uri: item.profiles.avatar_url }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <YStack width="100%" height="100%" backgroundColor="$sand" alignItems="center" justifyContent="center">
                  <Text fontSize={16} fontWeight="bold" color="$bark">{item.profiles?.full_name?.[0] ?? '?'}</Text>
                </YStack>
              )}
            </YStack>
            <YStack flex={1}>
              <Text fontSize={16} fontWeight="bold" color="$chocolate">{item.profiles?.full_name}</Text>
              <Text fontSize={12} color="$bark">{new Date(item.created_at).toLocaleDateString()}</Text>
            </YStack>
            <Text
              fontSize={12}
              fontWeight="bold"
              color={
                item.status === 'pending' ? '#F5A623' :
                item.status === 'accepted' ? '#4CAF50' : '#E85555'
              }
            >
              {item.status === 'pending' ? 'Pendiente' : item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
            </Text>
          </XStack>

          {item.message && (
            <Text fontSize={14} color="$bark">{item.message}</Text>
          )}

          {(item.status === 'pending' || item.status === 'accepted') && (
            <XStack gap="$2" marginTop="$2">
              {item.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50' }}
                    onPress={() => handleAccept(item.id)}
                  >
                    <Feather name="check" size={16} color="white" />
                    <Text color="white" fontSize={14} fontWeight="bold">  Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E85555' }}
                    onPress={() => handleReject(item.id)}
                  >
                    <Feather name="x" size={16} color="white" />
                    <Text color="white" fontSize={14} fontWeight="bold">  Rechazar</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6B6B' }}
                onPress={() => router.push(`/(shelter)/chat/${item.id}`)}
              >
                <Feather name="message-circle" size={16} color="white" />
                <Text color="white" fontSize={14} fontWeight="bold">  Chat</Text>
              </TouchableOpacity>
            </XStack>
          )}
        </YStack>
      )}
    />
    </YStack>
  )
}
