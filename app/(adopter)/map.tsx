import * as Location from 'expo-location'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker, UrlTile } from 'react-native-maps'
import { getNearbySheltersUseCase } from '../../src/di/container'
import { StatusBar } from 'expo-status-bar'
import { YStack, XStack, Text } from 'tamagui'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'

const OSM_TILE_PROXY = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/osm-tiles/{z}/{x}/{y}.png`

export default function MapScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [shelters, setShelters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setError('Permiso de ubicación denegado')
          setLoading(false)
          return
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })

        const data = await getNearbySheltersUseCase.execute(loc.coords.latitude, loc.coords.longitude, 100)
        setShelters(data)
      } catch (e: any) {
        setError(e?.message ?? 'Error al cargar refugios')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: screenWidth * 0.3, height: screenWidth * 0.3 }} />
        <Text marginTop="$2" fontSize="$4" color="$bark">Obteniendo ubicación...</Text>
      </YStack>
    )
  }

  if (error || !location) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream" padding="$4">
        <Text fontSize="$4" color="$chocolate" textAlign="center">{error ?? 'No se pudo obtener la ubicación'}</Text>
        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: '#FF6B6B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
          onPress={() => router.back()}
        >
          <Text color="white" fontWeight="600" fontSize="$4">Volver</Text>
        </TouchableOpacity>
      </YStack>
    )
  }

  const iconSize = screenWidth > 400 ? 24 : 20
  const backBtnSize = screenWidth > 400 ? 32 : 28

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingTop={insets.top + 8}
        paddingBottom="$3"
        backgroundColor="white"
        zIndex={1}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ width: backBtnSize, height: backBtnSize, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={iconSize} color="#1A1A1A" />
        </TouchableOpacity>
        <Text fontSize={screenWidth > 400 ? 18 : 16} fontWeight="bold" color="$chocolate">Refugios Cercanos</Text>
        <View style={{ width: backBtnSize }} />
      </XStack>
      <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        mapType="none"
      >
        <UrlTile
          urlTemplate={OSM_TILE_PROXY}
          maximumZ={19}
          flipY={false}
        />

        <Marker coordinate={location} title="Tu ubicación" pinColor="blue" />

        {shelters.map(shelter => (
          <Marker
            key={shelter.id}
            coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
            title={shelter.name}
            description={`${shelter.address ? shelter.address + ' - ' : ''}A ${shelter.distanceKm.toFixed(1)} km${shelter.phone ? ' - Tel: ' + shelter.phone : ''}`}
            pinColor="red"
          />
        ))}
      </MapView>
      </View>
      {shelters.length === 0 && !error && (
        <YStack
          position="absolute"
          top={insets.top + 60}
          left="$4"
          right="$4"
          backgroundColor="rgba(255,255,255,0.95)"
          padding="$4"
          borderRadius="$lg"
          alignItems="center"
          elevation={4}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.15}
          shadowRadius={4}
        >
          <Text fontSize={screenWidth > 400 ? 16 : 14} fontWeight="600" color="$chocolate" marginBottom="$1">No se encontraron refugios cercanos</Text>
          <Text fontSize={screenWidth > 400 ? 12 : 11} color="$bark" textAlign="center">Los refugios deben guardar su ubicación desde su panel para aparecer en el mapa</Text>
        </YStack>
      )}
      <View style={{ position: 'absolute', right: 8, bottom: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4 }}>
        <Text fontSize={11} color="$chocolate">© OpenStreetMap contributors</Text>
      </View>
    </View>
  )
}
