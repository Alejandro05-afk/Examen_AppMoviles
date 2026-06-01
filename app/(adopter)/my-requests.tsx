import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, useWindowDimensions } from 'react-native'
import LottieView from 'lottie-react-native'
import { router } from 'expo-router'
import { getAdoptionRequestsUseCase } from '../../src/di/container'
import { AdoptionRequestCard } from '../../src/presentation/components/adoption/AdoptionRequestCard'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { YStack, Text } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../../src/presentation/theme'

export default function MyRequestsScreen() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { width: screenWidth } = useWindowDimensions()

  const fetchRequests = async () => {
    try {
      if (!user) return
      const data = await getAdoptionRequestsUseCase.executeByAdopter(user.id)
      setRequests(data)
    } catch (error: any) {
      console.error('Error al cargar solicitudes:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  const handleChat = (requestId: string) => {
    router.push(`/(adopter)/chat/${requestId}`)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchRequests()
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$cream" paddingTop={4}>
      <StatusBar style="dark" />
      <FlatList
        data={requests}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />
        }
        ListEmptyComponent={
          <YStack alignItems="center" justifyContent="center" marginTop={80} gap="$4">
            <LottieView source={require('../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: screenWidth * 0.35, height: screenWidth * 0.35 }} />
            <Text fontSize="$7" fontWeight="bold" color="$chocolate">No tienes solicitudes de adopción</Text>
            <Text fontSize="$4" color="$bark" textAlign="center" paddingHorizontal="$4">Explora mascotas y envía tu primera solicitud</Text>
          </YStack>
        }
        renderItem={({ item }) => (
          <AdoptionRequestCard
            requestId={item.id}
            fullName={item.shelterName || 'Refugio'}
            petName={item.petName}
            message={item.message}
            status={item.status}
            createdAt={item.createdAt}
            onChat={handleChat}
          />
        )}
      />
    </YStack>
  )
}
