import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, RefreshControl, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../../src/data/supabase/client'
import { getOrCreateShelterForUser } from '../../src/data/supabase/shelterHelpers'
import { shelterRepo } from '../../src/di/container'
import { usePets } from '../../src/presentation/hooks/usePets'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { PetUiCard } from '../../src/presentation/components/pets/PetUiCard'
import { YStack, XStack, Text, Card } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'
import { colors } from '../../src/presentation/theme'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'

export default function ShelterDashboard() {
  const router = useRouter()
  const { user, setShelterId, logout } = useAuthStore()
  const { shelterPets, fetchShelterPets } = usePets()
  const [requestCount, setRequestCount] = useState(0)
  const [savingLocation, setSavingLocation] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const isSmall = screenWidth < 380
  const statIconSize = screenWidth > 400 ? 28 : 24
  const statFontSize = screenWidth > 400 ? 28 : 24
  const fabSize = screenWidth > 400 ? 60 : 52
  const fabIconSize = screenWidth > 400 ? 28 : 22

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user) return
    try {
      const shelterId = await getOrCreateShelterForUser(user)
      setShelterId(shelterId)

      await fetchShelterPets(shelterId)
      const { count } = await supabase
        .from('adoption_requests')
        .select('*', { count: 'exact', head: true })
        .eq('shelter_id', shelterId)
        .eq('status', 'pending')
      setRequestCount(count ?? 0)
    } catch (e) {
      console.error(e)
    }
  }

  const onRefresh = async () => {
    if (!user) return
    setRefreshing(true)
    try {
      const shelterId = await getOrCreateShelterForUser(user)
      await fetchShelterPets(shelterId)
    } catch {}
    setRefreshing(false)
  }

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch {}
    logout()
  }

  const handleSaveLocation = async () => {
    if (!user) return
    setSavingLocation(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Activa la ubicación para guardar tu refugio.')
        return
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const shelterId = await getOrCreateShelterForUser(user)
      await shelterRepo.updateShelterLocation(shelterId, pos.coords.latitude, pos.coords.longitude)
      setShelterId(shelterId)
      Alert.alert('Listo', 'Ubicación del refugio guardada.')
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar la ubicación')
    } finally {
      setSavingLocation(false)
    }
  }

  const headerContent = (
    <YStack gap="$4" paddingBottom="$4">
      <StatusBar style="dark" />
      <Card backgroundColor="$coral" padding={isSmall ? '$4' : '$5'} borderRadius="$lg" borderWidth={0}>
        <XStack alignItems="center" gap="$3">
          <Feather name="home" size={isSmall ? 20 : 24} color="white" />
          <YStack flex={1}>
            <Text color="white" fontWeight="700" fontSize={isSmall ? 18 : 22}>
              Bienvenido, {user?.fullName?.split(' ')[0] ?? 'Refugio'}
            </Text>
            <Text color="rgba(255,255,255,0.8)" fontSize={isSmall ? 12 : 13} marginTop={2}>
              Panel de administración de tu refugio
            </Text>
          </YStack>
          <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={isSmall ? 20 : 22} color="white" />
          </TouchableOpacity>
        </XStack>
      </Card>

      <XStack gap="$3">
        <Card flex={1} backgroundColor="$white" padding={isSmall ? '$4' : '$5'} borderRadius="$lg" borderWidth={1} borderColor="$border">
          <YStack alignItems="center" gap="$2.5">
            <Feather name="users" size={statIconSize} color={colors.coral} />
            <Text fontWeight="700" fontSize={statFontSize} color="$chocolate">{shelterPets.length}</Text>
            <Text fontWeight="600" fontSize={isSmall ? 10 : 11} color="$bark" textTransform="uppercase">Mascotas</Text>
          </YStack>
        </Card>
        <Card flex={1} backgroundColor="$white" padding={isSmall ? '$4' : '$5'} borderRadius="$lg" borderWidth={1} borderColor="$border">
          <YStack alignItems="center" gap="$2.5">
            <Feather name="file-text" size={statIconSize} color={colors.coral} />
            <Text fontWeight="700" fontSize={statFontSize} color="$chocolate">{requestCount}</Text>
            <Text fontWeight="600" fontSize={isSmall ? 10 : 11} color="$bark" textTransform="uppercase">Solicitudes</Text>
          </YStack>
        </Card>
      </XStack>

      <TouchableOpacity
        disabled={savingLocation}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: '#FF6B6B',
          borderRadius: 30,
          backgroundColor: '#FFFFFF',
          paddingVertical: 16,
          opacity: savingLocation ? 0.5 : 1,
        }}
        onPress={handleSaveLocation}
      >
        {savingLocation ? (
          <ActivityIndicator color={colors.coral} />
        ) : (
          <><Feather name="map-pin" size={18} color={colors.coral} /><Text fontWeight="700" color="$coral" fontSize={isSmall ? 14 : 16}>  Guardar mi ubicación</Text></>
        )}
      </TouchableOpacity>

      <Text fontSize={isSmall ? 18 : 20} fontWeight="700" color="$chocolate">Mis Mascotas</Text>
    </YStack>
  )

  return (
    <YStack flex={1} backgroundColor="$cream" paddingTop={insets.top + 8}>
      <FlatList
        data={shelterPets}
        keyExtractor={p => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListHeaderComponent={headerContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral} />
        }
        ListEmptyComponent={
          <YStack alignItems="center" justifyContent="center" marginTop={40} gap="$4">
            <LottieView source={require('../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: screenWidth * 0.35, height: screenWidth * 0.35 }} />
            <Text fontSize="$7" fontWeight="bold" color="$chocolate">No tienes mascotas registradas</Text>
            <Text fontSize="$4" color="$bark" textAlign="center" paddingHorizontal="$4">
              Agrega tu primera mascota para empezar a recibir solicitudes de adopción
            </Text>
          </YStack>
        }
        renderItem={({ item }) => (
          <YStack marginBottom="$4">
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
              onPress={() => router.push(`/(shelter)/pets/${item.id}/edit`)}
              screenWidth={screenWidth}
            />
          </YStack>
        )}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: colors.coral,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        onPress={() => router.push('/(shelter)/pets/create')}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={fabIconSize} color="white" />
      </TouchableOpacity>
    </YStack>
  )
}