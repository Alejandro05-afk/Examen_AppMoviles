import { useLocalSearchParams } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../../src/data/supabase/client'
import { acceptAdoptionRequestUseCase, rejectAdoptionRequestUseCase } from '../../../../src/di/container'
import { colors, borderRadius, shadows } from '../../../../src/presentation/theme'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'

export default function AdoptionRequestsScreen() {
  const { id: petId } = useLocalSearchParams()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    const { data } = await supabase
      .from('adoption_requests')
      .select('*, profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  const handleAccept = (requestId: string) => {
    Alert.alert('Aceptar solicitud', '¿Seguro que deseas aceptar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: async () => {
          await acceptAdoptionRequestUseCase.execute(requestId, '¡Felicitaciones! Tu solicitud ha sido aprobada.')
          loadRequests()
        }
      }
    ])
  }

  const handleReject = (requestId: string) => {
    Alert.alert('Rechazar solicitud', '¿Seguro que deseas rechazar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          await rejectAdoptionRequestUseCase.execute(requestId, 'Lamentablemente tu solicitud no fue aprobada en esta ocasión.')
          loadRequests()
        }
      }
    ])
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <LottieView source={require('../../../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </View>
    )
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centered}>
        <LottieView source={require('../../../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
        <Text style={styles.emptyText}>No hay solicitudes aún</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <FlatList
      data={requests}
      keyExtractor={r => r.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              {item.profiles?.avatar_url ? (
                <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{item.profiles?.full_name?.[0] ?? '?'}</Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.profiles?.full_name}</Text>
              <Text style={styles.userDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={[
              styles.status,
              item.status === 'pending' && styles.statusPending,
              item.status === 'accepted' && styles.statusAccepted,
              item.status === 'rejected' && styles.statusRejected
            ]}>
              {item.status === 'pending' ? 'Pendiente' : item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
            </Text>
          </View>

          {item.message && (
            <Text style={styles.message}>{item.message}</Text>
          )}

          {item.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item.id)}
              >
                <Feather name="check" size={16} color="white" />
                <Text style={styles.acceptButtonText}>  Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <Feather name="x" size={16} color="white" />
                <Text style={styles.rejectButtonText}>  Rechazar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.md,
    ...shadows.card,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#F5A623',
  },
  statusAccepted: {
    color: colors.secondary,
  },
  statusRejected: {
    color: colors.alert,
  },
  message: {
    fontSize: 14,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: colors.secondary,
  },
  rejectButton: {
    backgroundColor: colors.alert,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
})
