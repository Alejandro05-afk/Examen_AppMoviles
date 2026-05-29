import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Link, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { PetUiCard } from '../../src/presentation/components/pets/PetUiCard'
import { usePets } from '../../src/presentation/hooks/usePets'
import { colors, borderRadius, shadows } from '../../src/presentation/theme'
import { supabase } from '../../src/data/supabase/client'
import { useAuthStore } from '../../src/presentation/store/authStore'

export default function HomeScreen() {
  const router = useRouter()
  const { availablePets, fetchAvailablePets } = usePets()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { width } = useWindowDimensions()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.replace('/(auth)/login')
  }

  useEffect(() => {
    fetchAvailablePets().finally(() => setLoading(false))
  }, [])

  const filteredPets = availablePets.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase()) ||
    (p.breed && p.breed.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>PetAdopt</Text>
          <Text style={styles.subtitle}>Encuentra tu compañero perfecto</Text>
        </View>
        <Link href="/(adopter)/my-requests" asChild>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={20} color="white" />
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <Ionicons name="exit-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={18}
            color={colors.textLight}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Buscar mascotas..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>
        <Link href="/(adopter)/map" asChild>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="map-pin" size={18} color="white" />
          </TouchableOpacity>
        </Link>
      </View>

      <Link href="/(adopter)/ai-chat" asChild>
        <TouchableOpacity style={styles.aiBanner}>
          <View style={styles.aiBannerContent}>
            <Ionicons name="sparkles" size={22} color="white" />
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>Asistente IA</Text>
              <Text style={styles.aiBannerSub}>Pregunta sobre adopción, cuidados y más</Text>
            </View>
          </View>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      </Link>

      <FlatList
        data={filteredPets}
        keyExtractor={p => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 16 }}
        snapToInterval={436}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => fetchAvailablePets()}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LottieView source={require('../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
            <Text style={styles.emptyText}>No hay mascotas disponibles aún</Text>
          </View>
        }
        renderItem={({ item }) => (
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
            location={item.shelters?.name || 'Quito'}
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
    paddingTop: 52,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    borderRadius: borderRadius.full,
    paddingLeft: 40,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    backgroundColor: colors.card,
    color: colors.text,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
  },
  iconButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...shadows.button,
  },
  accentButton: {
    backgroundColor: colors.alert,
  },
  emoji: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 16,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    ...shadows.button,
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiBannerText: {
    gap: 2,
  },
  aiBannerTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  aiBannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
})
