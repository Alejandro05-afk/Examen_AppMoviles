import * as Location from 'expo-location'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, UrlTile } from 'react-native-maps'
import { getNearbySheltersUseCase } from '../../src/di/container'
import { StatusBar } from 'expo-status-bar'
import { colors, borderRadius } from '../../src/presentation/theme'
import { useRouter } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { supabase } from '../../src/data/supabase/client'
import { useAuthStore } from '../../src/presentation/store/authStore'

const OSM_TILE_PROXY = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/osm-tiles/{z}/{x}/{y}.png`

export default function MapScreen() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch {}
    logout()
    router.replace('/(auth)/login')
  }
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
      <View style={styles.centered}>
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 120, height: 120 }} />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    )
  }

  if (error || !location) {
    return (
      <View style={styles.centered}>
        <Text>{error ?? 'No se pudo obtener la ubicación'}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refugios Cercanos</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
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
            description={`${shelter.address ? shelter.address + ' - ' : ''}A ${shelter.distanceKm.toFixed(1)} km${shelter.phone ? ' - 📞 ' + shelter.phone : ''}`}
            pinColor="red"
          />
        ))}
      </MapView>
      </View>
      {shelters.length === 0 && !error && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>No se encontraron refugios cercanos</Text>
          <Text style={styles.emptySubtext}>Los refugios deben guardar su ubicación desde su panel para aparecer en el mapa</Text>
        </View>
      )}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  attribution: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  attributionText: {
    fontSize: 11,
    color: colors.dark,
  },
  emptyOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: borderRadius.md,
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
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
})
