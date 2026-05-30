import { useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import ChatRoom from '../../../src/presentation/components/chat/ChatRoom'

export default function AdopterChatScreen() {
  const { requestId } = useLocalSearchParams()
  const { user } = useAuthStore()

  if (!user || !requestId) return null

  return (
    <ChatRoom
      requestId={requestId as string}
      userId={user.id}
    />
  )
}
