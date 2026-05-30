import { useEffect, useState } from 'react'
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import LottieView from 'lottie-react-native'
import { router } from 'expo-router'
import { getAdoptionRequestsUseCase, acceptAdoptionRequestUseCase, rejectAdoptionRequestUseCase } from '../../src/di/container'
import { AdoptionRequestCard } from '../../src/presentation/components/adoption/AdoptionRequestCard'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { colors } from '../../src/presentation/theme'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'

export default function ShelterRequestsScreen() {
  const { user, shelterId } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRequests = async () => {
    try {
      if (!user || !shelterId) return
      const data = await getAdoptionRequestsUseCase.executeByShelter(shelterId)
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
  }, [user, shelterId])

  const handleAccept = (id: string) => {
    Alert.alert(
      'Aceptar solicitud',
      '¿Estás seguro de aceptar esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar', onPress: async () => {
          try {
            await acceptAdoptionRequestUseCase.execute(id, 'Solicitud aceptada')
            fetchRequests()
          } catch (e: any) {
            Alert.alert('Error', e.message)
          }
        }},
      ]
    )
  }

  const handleReject = (id: string) => {
    Alert.alert(
      'Rechazar solicitud',
      '¿Estás seguro de rechazar esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: async () => {
          try {
            await rejectAdoptionRequestUseCase.execute(id, 'Solicitud rechazada')
            fetchRequests()
          } catch (e: any) {
            Alert.alert('Error', e.message)
          }
        }},
      ]
    )
  }

  const handleChat = (requestId: string) => {
    router.push(`/(shelter)/chat/${requestId}`)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchRequests()
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={requests}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No hay solicitudes de adopción</Text>
            <Text style={styles.emptySubtext}>Las solicitudes aparecerán aquí cuando los adoptantes soliciten tus mascotas</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AdoptionRequestCard
            requestId={item.id}
            fullName={item.adopterName || 'Adoptante'}
            avatarUrl={item.adopterAvatar}
            petName={item.petName}
            message={item.message}
            status={item.status}
            createdAt={item.createdAt}
            onAccept={handleAccept}
            onReject={handleReject}
            onChat={handleChat}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
})
