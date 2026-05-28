import { useEffect, useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Input, Button, Text } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../src/data/supabase/client'
import { SupabaseChatRepository } from '../../../src/data/repositories/SupabaseChatRepository'
import { useAuthStore } from '../../../src/presentation/store/authStore'

const chatRepo = new SupabaseChatRepository()

export default function AdopterChatScreen() {
  const { requestId } = useLocalSearchParams()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const flatRef = useRef<FlatList>(null)

  useEffect(() => {
    chatRepo.getMessages(requestId as string).then(setMessages)

    const subscription = chatRepo.subscribeToMessages(requestId as string, (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => { supabase.removeChannel(subscription) }
  }, [requestId])

  const send = async () => {
    if (!input.trim() || !user) return
    await chatRepo.sendMessage(requestId as string, user.id, input)
    setInput('')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <YStack flex={1}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id
            return (
              <XStack justifyContent={isMe ? 'flex-end' : 'flex-start'}>
                <YStack
                  maxWidth="75%" padding="$3" borderRadius={12}
                  backgroundColor={isMe ? '$primary' : '$backgroundHover'}
                  borderBottomRightRadius={isMe ? 2 : 12}
                  borderBottomLeftRadius={isMe ? 12 : 2}
                >
                  <Text color={isMe ? 'white' : '$color'}>{item.content}</Text>
                </YStack>
              </XStack>
            )
          }}
        />
        <XStack padding="$3" gap="$2" borderTopWidth={1} borderTopColor="$borderColor">
          <Input flex={1} value={input} onChangeText={setInput} placeholder="Escribe un mensaje..." />
          <Button onPress={send} backgroundColor="$primary">Enviar</Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
