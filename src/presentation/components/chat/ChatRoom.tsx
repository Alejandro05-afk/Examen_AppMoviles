import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, Text } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'
import { supabase } from '../../../data/supabase/client'
import { SupabaseChatRepository } from '../../../data/repositories/SupabaseChatRepository'
import { ChatMessageData } from '../../../domain/repositories/IChatRepository'

const chatRepo = new SupabaseChatRepository()

interface Props {
  requestId: string
  userId: string
  otherUserName?: string
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)}h`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function ChatRoom({ requestId, userId }: Props) {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const flatRef = useRef<FlatList>(null)

  useEffect(() => {
    chatRepo.getMessages(requestId).then((data) => {
      setMessages(data)
      setLoading(false)
    })

    const subscription = chatRepo.subscribeToMessages(requestId, (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => { supabase.removeChannel(subscription) }
  }, [requestId])

  const send = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      await chatRepo.sendMessage(requestId, userId, input.trim())
      setInput('')
    } catch {
      // Error al enviar mensaje
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$cream">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </YStack>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : Platform.OS === 'android' ? 80 : 0}
      style={{ flex: 1 }}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 20, flexGrow: 1, gap: 12 }}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$2" paddingVertical={80}>
            <Feather name="message-circle" size={48} color="#8B6F47" />
            <Text fontSize={16} fontWeight="600" color="$chocolate">Sin mensajes aún</Text>
            <Text fontSize={13} color="$bark" textAlign="center">Envía el primer mensaje para coordinar la visita</Text>
          </YStack>
        }
        renderItem={({ item }) => {
          const isMe = item.sender_id === userId
          return (
            <XStack justifyContent={isMe ? 'flex-end' : 'flex-start'}>
              <YStack
                maxWidth="80%"
                paddingHorizontal="$3.5"
                paddingVertical="$2.5"
                borderRadius="$lg"
                backgroundColor={isMe ? '$coral' : 'white'}
                borderWidth={isMe ? 0 : 1}
                borderColor={isMe ? 'transparent' : '#E8E0D6'}
                borderBottomRightRadius={isMe ? 2 : 16}
                borderBottomLeftRadius={isMe ? 16 : 2}
                gap="$1"
              >
                {item.profiles && !isMe && (
                  <Text fontSize={12} fontWeight="700" color="$coral" marginBottom="$1">{item.profiles.full_name}</Text>
                )}
                <Text fontSize={15} color={isMe ? 'white' : '$chocolate'} lineHeight={20}>
                  {item.content}
                </Text>
                <Text fontSize={11} color={isMe ? 'rgba(255,255,255,0.7)' : '$bark'} textAlign="right" marginTop="$1">
                  {formatTime(item.created_at)}
                </Text>
              </YStack>
            </XStack>
          )
        }}
      />

      <XStack
        paddingHorizontal="$3"
        paddingTop="$3"
        gap="$2"
        borderTopWidth={1}
        borderTopColor="#E8E0D6"
        backgroundColor="white"
        alignItems="flex-end"
        paddingBottom={12 + insets.bottom}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: '#FFF8F0',
            borderRadius: 12,
            paddingHorizontal: screenWidth > 400 ? 20 : 14,
            paddingVertical: screenWidth > 400 ? 12 : 10,
            fontSize: screenWidth > 400 ? 14 : 13,
            color: '#3D2314',
            maxHeight: 100,
          }}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#8B6F47"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#FF6B6B',
            width: screenWidth > 400 ? 44 : 38,
            height: screenWidth > 400 ? 44 : 38,
            borderRadius: screenWidth > 400 ? 22 : 19,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !input.trim() || sending ? 0.5 : 1,
          }}
          onPress={send}
          disabled={!input.trim() || sending}
        >
          <Feather name="send" size={screenWidth > 400 ? 18 : 15} color="white" />
        </TouchableOpacity>
      </XStack>
    </KeyboardAvoidingView>
  )
}
