import { useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Markdown from 'react-native-markdown-display'
import LottieView from 'lottie-react-native'
import { sendAIMessageUseCase } from '../../src/di/container'
import { YStack, XStack, Text, Input, Button } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'

interface Message { id: string; role: 'user' | 'assistant'; text: string }

export default function AIChatScreen() {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: '¡Hola! Soy el asistente de PetAdopt. ¿Tienes dudas sobre el cuidado de tu futura mascota?' }
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
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : Platform.OS === 'android' ? 80 : 0}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor="$cream">
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <XStack justifyContent={item.role === 'user' ? 'flex-end' : 'flex-start'}>
              {item.role === 'assistant' && (
                <YStack width={screenWidth > 400 ? 32 : 26} height={screenWidth > 400 ? 32 : 26} borderRadius={screenWidth > 400 ? 16 : 13} backgroundColor="$coral" alignItems="center" justifyContent="center" marginRight="$2" marginTop="$2">
                  <Feather name="message-circle" size={screenWidth > 400 ? 16 : 13} color="white" />
                </YStack>
              )}
              <YStack
                maxWidth="80%"
                padding="$3"
                borderRadius="$lg"
                backgroundColor={item.role === 'user' ? '$coral' : '$white'}
                borderBottomRightRadius={item.role === 'user' ? 4 : 16}
                borderBottomLeftRadius={item.role === 'assistant' ? 4 : 16}
                borderWidth={item.role === 'assistant' ? 1 : 0}
                borderColor={item.role === 'assistant' ? '$border' : 'transparent'}
              >
                {item.role === 'user' ? (
                  <Text color="white" fontSize={15}>{item.text}</Text>
                ) : (
                  <Markdown style={markdownStyles}>{item.text}</Markdown>
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

        <XStack
          paddingHorizontal="$3"
          paddingTop="$3"
          paddingBottom={12 + insets.bottom}
          gap="$2"
          borderTopWidth={1}
          borderTopColor="$border"
          alignItems="center"
        >
          <Input
            flex={1}
            placeholder="Pregunta sobre cuidados, salud..."
            placeholderTextColor="$bark"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            borderRadius={20}
            backgroundColor="$white"
            borderWidth={1}
            borderColor="$border"
            fontSize={15}
            paddingHorizontal="$4"
            paddingVertical="$2.5"
          />
          <Button
            backgroundColor="$coral"
            width={40}
            height={40}
            borderRadius={20}
            pressStyle={{ backgroundColor: '$coralDeep' }}
            disabled={loading || !input.trim()}
            opacity={loading || !input.trim() ? 0.5 : 1}
            onPress={send}
            icon={<Feather name="send" size={18} color="white" />}
          />
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}

const markdownStyles = {
  body: { color: '#3D2314', fontSize: 15, lineHeight: 22 },
  heading1: { fontSize: 20, fontWeight: '700' as const, marginVertical: 6 },
  heading2: { fontSize: 18, fontWeight: '600' as const, marginVertical: 4 },
  heading3: { fontSize: 16, fontWeight: '600' as const, marginVertical: 3 },
  strong: { fontWeight: '700' as const },
  em: { fontStyle: 'italic' as const },
  link: { color: '#FF6B6B', textDecorationLine: 'underline' as const },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFB347',
    paddingLeft: 10,
    marginVertical: 4,
    opacity: 0.85,
  },
  code_inline: {
    backgroundColor: '#F5ECD7',
    color: '#E85555',
    fontFamily: 'monospace',
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: '#F5ECD7',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  code_block: {
    backgroundColor: '#F5ECD7',
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
}
