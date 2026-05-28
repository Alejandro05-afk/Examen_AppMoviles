import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps'
import * as Location from 'expo-location'
import { YStack, Text } from 'tamagui'
import LottieView from 'lottie-react-native'
import { getNearbySheltersUseCase } from '../../src/di/container'

export default function MapScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [shelters, setShelters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado')
        setLoading(false)
        return
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })

      const data = await getNearbySheltersUseCase.execute()
      setShelters(data)
      setLoading(false)
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
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        <Marker coordinate={location} title="Tu ubicación" pinColor="blue" />

        {shelters.map(shelter => (
          <Marker
            key={shelter.id}
            coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
            title={shelter.name}
            pinColor="red"
          >
            <Callout>
              <YStack padding="$2" minWidth={150}>
                <Text fontWeight="bold">{shelter.name}</Text>
                <Text fontSize={12}>{shelter.address}</Text>
                {shelter.phone && <Text fontSize={12}>📞 {shelter.phone}</Text>}
              </YStack>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  )
}
