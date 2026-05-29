import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { getAdoptionRequestsUseCase } from '../../src/di/container'
import { AdoptionRequestCard } from '../../src/presentation/components/adoption/AdoptionRequestCard'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { colors, borderRadius } from '../../src/presentation/theme'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'

export default function MyRequestsScreen() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRequests = async () => {
    if (!user) return
    try {
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

  const onRefresh = () => {
    setRefreshing(true)
    fetchRequests()
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            <Text style={styles.emptyText}>No tienes solicitudes de adopción</Text>
            <Text style={styles.emptySubtext}>Explora mascotas y envía tu primera solicitud</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AdoptionRequestCard
            fullName={item.shelters?.name || 'Refugio'}
            avatarUrl={item.shelters?.avatar_url}
            message={item.reason}
            status={item.status}
            createdAt={item.created_at}
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
