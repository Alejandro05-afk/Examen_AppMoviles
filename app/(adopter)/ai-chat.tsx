import { useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Input, Button, Text } from 'tamagui'
import LottieView from 'lottie-react-native'
import { sendAIMessageUseCase } from '../../src/di/container'

interface Message { id: string; role: 'user' | 'assistant'; text: string }

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: '¡Hola! 🐾 Soy el asistente de PetAdopt. ¿Tienes dudas sobre el cuidado de tu futura mascota?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const flatRef = useRef<FlatList>(null)

  const send = async () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const reply = await sendAIMessageUseCase.execute(
        messages.map(m => ({ role: m.role, text: m.text })),
        input
      )
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { id: '999', role: 'assistant', text: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor="$background">
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <XStack justifyContent={item.role === 'user' ? 'flex-end' : 'flex-start'}>
              <YStack
                maxWidth="80%"
                backgroundColor={item.role === 'user' ? '$primary' : '$backgroundHover'}
                padding="$3" borderRadius={16}
                borderBottomRightRadius={item.role === 'user' ? 4 : 16}
                borderBottomLeftRadius={item.role === 'assistant' ? 4 : 16}
              >
                <Text color={item.role === 'user' ? 'white' : '$color'}>{item.text}</Text>
              </YStack>
            </XStack>
          )}
          ListFooterComponent={loading ? (
            <LottieView
              source={require('../../assets/lottie/loading.json')}
              autoPlay loop style={{ width: 60, height: 30, alignSelf: 'flex-start' }}
            />
          ) : null}
        />

        <XStack padding="$3" gap="$2" borderTopWidth={1} borderTopColor="$borderColor">
          <Input
            flex={1} placeholder="Pregunta sobre cuidados, salud..."
            value={input} onChangeText={setInput}
            onSubmitEditing={send}
          />
          <Button onPress={send} disabled={loading} backgroundColor="$primary">
            Enviar
          </Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
