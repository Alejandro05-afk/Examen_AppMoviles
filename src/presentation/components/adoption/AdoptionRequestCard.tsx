import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { colors, borderRadius, shadows } from '../../theme'
import Feather from '@expo/vector-icons/Feather'

interface Props {
  requestId?: string
  fullName: string
  avatarUrl?: string
  petName?: string
  message?: string
  status: string
  createdAt: string
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onChat?: (id: string) => void
}

export const AdoptionRequestCard = ({ requestId, fullName, avatarUrl, petName, message, status, createdAt, onAccept, onReject, onChat }: Props) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{fullName?.[0] ?? '?'}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{fullName}</Text>
        {petName && <Text style={styles.petName}>Solicita a {petName}</Text>}
        <Text style={styles.date}>{new Date(createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Feather
          name={status === 'pending' ? 'clock' : status === 'accepted' ? 'check-circle' : 'x-circle'}
          size={12}
          color={status === 'pending' ? '#F5A623' : status === 'accepted' ? colors.secondary : colors.alert}
        />
        <Text
          style={[
            styles.status,
            status === 'pending' && styles.statusPending,
            status === 'accepted' && styles.statusAccepted,
            status === 'rejected' && styles.statusRejected,
          ]}
        >
          {status === 'pending' ? 'Pendiente' : status === 'accepted' ? 'Aceptada' : 'Rechazada'}
        </Text>
      </View>
    </View>
    {message && (
      <Text style={styles.message}>{message}</Text>
    )}
    {(status === 'pending' || status === 'accepted') && (
      <View style={styles.actions}>
        {status === 'pending' && onAccept && onReject && requestId && (
          <>
            <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(requestId)}>
              <Feather name="check" size={16} color="white" />
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={() => onReject(requestId)}>
              <Feather name="x" size={16} color="white" />
              <Text style={styles.buttonText}>Rechazar</Text>
            </TouchableOpacity>
          </>
        )}
        {onChat && requestId && (
          <TouchableOpacity style={styles.chatButton} onPress={() => onChat(requestId)}>
            <Feather name="message-circle" size={16} color="white" />
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
)

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    ...shadows.card,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  petName: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.alert,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
})
