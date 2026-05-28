import { Card, Avatar, Text, XStack, YStack } from 'tamagui'

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
  <Card padding="$4" borderRadius={12} elevate>
    <XStack gap="$3" alignItems="center">
      <Avatar circular size="$5">
        <Avatar.Image src={avatarUrl || ''} />
        <Avatar.Fallback backgroundColor="$backgroundHover">
          <Text>{fullName?.[0] ?? '?'}</Text>
        </Avatar.Fallback>
      </Avatar>
      <YStack flex={1}>
        <Text fontWeight="bold">{fullName}</Text>
        <Text fontSize={12} color="$colorMuted">{new Date(createdAt).toLocaleDateString()}</Text>
      </YStack>
      <Text
        fontSize={12} fontWeight="bold"
        color={status === 'pending' ? '$yellow10' : status === 'accepted' ? '$green10' : '$red10'}
      >
        {status === 'pending' ? 'Pendiente' : status === 'accepted' ? 'Aceptada' : 'Rechazada'}
      </Text>
    </XStack>
    {message && (
      <Text mt="$2" color="$colorMuted" fontSize={14}>{message}</Text>
    )}
  </Card>
)
