import { useEffect, useState } from 'react'
import { StyleSheet, View, Text as RNText } from 'react-native'
import MapView, { Marker, UrlTile } from 'react-native-maps'
import * as Location from 'expo-location'
import { YStack, Text } from 'tamagui'
import LottieView from 'lottie-react-native'
import { getNearbySheltersUseCase } from '../../src/di/container'

const OSM_TILE_PROXY = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/osm-tiles/{z}/{x}/{y}.png`

export default function MapScreen() {
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
        console.log(`Refugios encontrados: ${data.length}`)
        setShelters(data)
      } catch (e: any) {
        console.error('Error al cargar refugios:', e)
        setError(e?.message ?? 'Error al cargar refugios')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 120, height: 120 }} />
        <Text mt="$2">Obteniendo ubicación...</Text>
      </YStack>
    )
  }

  if (error || !location) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>{error ?? 'No se pudo obtener la ubicación'}</Text>
      </YStack>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFillObject}
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
            description={`${shelter.address ? shelter.address + ' - ' : ''}A ${shelter.distanceKm.toFixed(1)} km${shelter.phone ? ' - 📞 ' + shelter.phone : ''}`}
            pinColor="red"
          />
        ))}
      </MapView>
      {shelters.length === 0 && !error && (
        <View style={styles.emptyOverlay}>
          <RNText style={styles.emptyText}>No se encontraron refugios cercanos</RNText>
          <RNText style={styles.emptySubtext}>Los refugios deben guardar su ubicación desde su panel para aparecer en el mapa</RNText>
        </View>
      )}
      <View style={styles.attribution}>
        <RNText style={styles.attributionText}>© OpenStreetMap contributors</RNText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  attribution: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  attributionText: {
    fontSize: 11,
    color: '#111827',
  },
  emptyOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
})
