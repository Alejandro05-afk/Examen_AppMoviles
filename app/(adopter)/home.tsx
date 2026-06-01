import Feather from '@expo/vector-icons/Feather'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { PetUiCard } from '../../src/presentation/components/pets/PetUiCard'
import { usePets } from '../../src/presentation/hooks/usePets'
import { YStack, XStack, Text, Input, Button } from 'tamagui'
import { colors } from '../../src/presentation/theme'
import { supabase } from '../../src/data/supabase/client'
import { useAuthStore } from '../../src/presentation/store/authStore'

export default function HomeScreen() {
  const { availablePets, fetchAvailablePets } = usePets()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const { logout } = useAuthStore()
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = screenWidth - 32
  const snapInterval = cardWidth + 16

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch {}
    logout()
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000)
    fetchAvailablePets()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        setLoading(false)
      })
    return () => clearTimeout(timer)
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    try { await fetchAvailablePets() } finally { setRefreshing(false) }
  }

  const filteredPets = availablePets.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase()) ||
    (p.breed && p.breed.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <YStack flex={1} backgroundColor="$cream" paddingTop={insets.top}>
      <StatusBar style="dark" />
      <XStack paddingHorizontal="$4" gap="$2" alignItems="center" marginBottom="$2">
        <YStack flex={1}>
          <Text fontSize="$10" fontWeight="bold" color="$chocolate">PetAdopt</Text>
          <Text fontSize="$3" color="$bark" marginTop={2}>Encuentra tu compañero perfecto</Text>
        </YStack>
        <Button
          backgroundColor="$coral"
          borderRadius="$full"
          paddingHorizontal="$2.5"
          paddingVertical="$2.5"
          pressStyle={{ backgroundColor: '$coralDeep' }}
          onPress={handleLogout}
          icon={<Feather name="log-out" size={screenWidth > 400 ? 20 : 16} color="white" />}
        />
      </XStack>

      <XStack paddingHorizontal="$4" marginBottom="$4" gap="$2">
        <XStack flex={1} position="relative" alignItems="center" backgroundColor="$white" borderRadius="$full" borderWidth={1} borderColor="$border" paddingLeft="$4">
          <Feather name="search" size={18} color={colors.bark} />
          <Input
            flex={1}
            placeholder="Buscar mascotas..."
            placeholderTextColor="$bark"
            value={search}
            onChangeText={setSearch}
            borderWidth={0}
            backgroundColor="transparent"
            fontSize="$4"
            paddingVertical={12}
            paddingLeft="$2"
          />
        </XStack>
      </XStack>

      {loading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
        </YStack>
      ) : (
        <FlatList
          data={filteredPets}
          keyExtractor={p => p.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 16 }}
          snapToInterval={snapInterval}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />
          }
          ListEmptyComponent={
            <YStack alignItems="center" justifyContent="center" marginTop={80} gap="$4">
              <LottieView source={require('../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: screenWidth * 0.35, height: screenWidth * 0.35 }} />
              <Text fontSize="$4" color="$bark">No hay mascotas disponibles aún</Text>
            </YStack>
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
              screenWidth={screenWidth}
            />
          )}
        />
      )}
    </YStack>
  )
}
