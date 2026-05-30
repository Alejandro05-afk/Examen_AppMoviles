import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../../src/data/supabase/client'
import { getOrCreateShelterForUser } from '../../src/data/supabase/shelterHelpers'
import { shelterRepo } from '../../src/di/container'
import { usePets } from '../../src/presentation/hooks/usePets'
import { useAuthStore } from '../../src/presentation/store/authStore'
import { colors, borderRadius, shadows, typography } from '../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

export default function ShelterDashboard() {
  const { user, setShelterId, logout } = useAuthStore()
  const router = useRouter()
  const { shelterPets, fetchShelterPets } = usePets()
  const [requestCount, setRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingLocation, setSavingLocation] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await supabase.auth.signOut() } catch {}
    logout()
    router.replace('/(auth)/login')
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <Feather name="home" size={24} color="white" />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>
              Bienvenido, {user?.fullName?.split(' ')[0] ?? 'Refugio'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              Panel de administración de tu refugio
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Feather name="users" size={28} color={colors.primary} />
            <Text style={styles.statNumber}>{shelterPets.length}</Text>
            <Text style={styles.statLabel}>Mascotas</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <Feather name="file-text" size={28} color={colors.primary} />
            <Text style={styles.statNumber}>{requestCount}</Text>
            <Text style={styles.statLabel}>Solicitudes</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.buttonOutlined, savingLocation && styles.buttonDisabled]}
        onPress={handleSaveLocation}
        disabled={savingLocation}
      >
        {savingLocation ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <><Feather name="map-pin" size={18} color={colors.primary} /><Text style={[styles.buttonText, styles.buttonTextOutlined]}>  Guardar mi ubicación</Text></>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
    paddingTop: 52,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    color: 'white',
    ...typography.h2,
  },
  welcomeSubtext: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    ...typography.small,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: borderRadius.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statContent: {
    alignItems: 'center',
    gap: 10,
  },
  statNumber: {
    ...typography.h1,
    color: colors.text,
  },
  statLabel: {
    ...typography.label,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  buttonOutlined: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextOutlined: {
    color: colors.primary,
  },
})
