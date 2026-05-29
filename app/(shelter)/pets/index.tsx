import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PetUiCard } from '../../../src/presentation/components/pets/PetUiCard'
import { usePets } from '../../../src/presentation/hooks/usePets'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { colors, borderRadius } from '../../../src/presentation/theme'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'

export default function ShelterPetsScreen() {
  const router = useRouter()
  const { shelterId } = useAuthStore()
  const { shelterPets, fetchShelterPets } = usePets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (shelterId) {
      loadPets()
    }
  }, [shelterId])

  const loadPets = async () => {
    if (!shelterId) return
    try {
      await fetchShelterPets(shelterId)
    } catch (error: any) {
      console.error('Error al cargar mascotas:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadPets().finally(() => setRefreshing(false))
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
        data={shelterPets}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
            <Text style={styles.emptySubtext}>Agrega tu primera mascota para empezar a recibir solicitudes de adopción</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(shelter)/pets/${item.id}/edit`)}
          >
            <PetUiCard
              id={item.id}
              name={item.name}
              species={item.species}
              breed={item.breed}
              age={
                item.ageYears > 0
                  ? `${item.ageYears} ${item.ageYears === 1 ? 'año' : 'años'}`
                  : item.ageMonths > 0
                  ? `${item.ageMonths} ${item.ageMonths === 1 ? 'mes' : 'meses'}`
                  : undefined
              }
              mainPhotoUrl={item.mainPhotoUrl}
              location="Mi refugio"
            />
          </TouchableOpacity>
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
