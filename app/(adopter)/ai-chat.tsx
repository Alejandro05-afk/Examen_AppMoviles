import { useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native'
import { YStack, XStack, Input, Button, Text } from 'tamagui'
import Markdown from 'react-native-markdown-display'
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

  const isDark = useColorScheme() === 'dark'

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
                {item.role === 'user' ? (
                  <Text color="white">{item.text}</Text>
                ) : (
                  <Markdown style={markdownStyles(isDark)}>{item.text}</Markdown>
                )}
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

const markdownStyles = (isDark: boolean) => ({
  body: { color: isDark ? '#e0e0e0' : '#1a1a1a', fontSize: 15, lineHeight: 22 },
  heading1: { fontSize: 20, fontWeight: '700' as const, marginVertical: 6 },
  heading2: { fontSize: 18, fontWeight: '600' as const, marginVertical: 4 },
  heading3: { fontSize: 16, fontWeight: '600' as const, marginVertical: 3 },
  strong: { fontWeight: '700' as const },
  em: { fontStyle: 'italic' as const },
  link: { color: '#3b82f6', textDecorationLine: 'underline' as const },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#9ca3af',
    paddingLeft: 10,
    marginVertical: 4,
    opacity: 0.85,
  },
  code_inline: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    color: isDark ? '#f87171' : '#dc2626',
    fontFamily: 'monospace',
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  code_block: {
    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  paragraph: { marginVertical: 2 },
  bullet_list: { marginVertical: 2 },
  ordered_list: { marginVertical: 2 },
  list_item: { marginVertical: 1 },
})
