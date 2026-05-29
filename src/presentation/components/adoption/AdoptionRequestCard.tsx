import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { colors, borderRadius, shadows } from '../../theme'
import Feather from '@expo/vector-icons/Feather'

interface Props {
  fullName: string
  avatarUrl?: string
  message?: string
  status: string
  createdAt: string
  onAccept?: () => void
  onReject?: () => void
}

export const AdoptionRequestCard = ({ fullName, avatarUrl, message, status, createdAt, onAccept, onReject }: Props) => (
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
})
