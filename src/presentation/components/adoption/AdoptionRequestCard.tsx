import { TouchableOpacity, Image } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { colors } from '../../theme'
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
  <YStack backgroundColor="$white" padding="$4" borderRadius="$md" borderWidth={1} borderColor="$border" gap="$2">
    <XStack alignItems="center" gap="$3">
      <YStack width={48} height={48} borderRadius={24} overflow="hidden" alignItems="center" justifyContent="center" backgroundColor={avatarUrl ? 'transparent' : '$sand'}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text fontSize={18} fontWeight="bold" color="$coral">{fullName?.[0] ?? '?'}</Text>
        )}
      </YStack>
      <YStack flex={1}>
        <Text fontSize={16} fontWeight="bold" color="$chocolate">{fullName}</Text>
        {petName && <Text fontSize={13} color="$coral" fontWeight="600" marginTop={2}>Solicita a {petName}</Text>}
        <Text fontSize={12} color="$bark">{new Date(createdAt).toLocaleDateString()}</Text>
      </YStack>
      <XStack alignItems="center" gap="$1">
        <Feather
          name={status === 'pending' ? 'clock' : status === 'accepted' ? 'check-circle' : 'x-circle'}
          size={12}
          color={status === 'pending' ? colors.warning : status === 'accepted' ? colors.success : colors.danger}
        />
        <Text
          fontSize={12}
          fontWeight="bold"
          color={status === 'pending' ? colors.warning : status === 'accepted' ? colors.success : colors.danger}
        >
          {status === 'pending' ? 'Pendiente' : status === 'accepted' ? 'Aceptada' : 'Rechazada'}
        </Text>
      </XStack>
    </XStack>
    {message && (
      <Text fontSize={14} color="$bark" marginTop={2}>{message}</Text>
    )}
    {(status === 'pending' || status === 'accepted') && (
      <XStack gap="$3" marginTop="$2">
        {status === 'pending' && onAccept && onReject && requestId && (
          <>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, paddingVertical: 10, borderRadius: 8 }}
              onPress={() => onAccept(requestId)}
            >
              <Feather name="check" size={16} color="white" />
              <Text fontSize={14} fontWeight="bold" color="white">Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.danger, paddingVertical: 10, borderRadius: 8 }}
              onPress={() => onReject(requestId)}
            >
              <Feather name="x" size={16} color="white" />
              <Text fontSize={14} fontWeight="bold" color="white">Rechazar</Text>
            </TouchableOpacity>
          </>
        )}
        {onChat && requestId && (
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.coral, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => onChat(requestId)}
          >
            <Feather name="message-circle" size={16} color="white" />
            <Text fontSize={14} fontWeight="bold" color="white">Chat</Text>
          </TouchableOpacity>
        )}
      </XStack>
    )}
  </YStack>
)
