import { useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Markdown from 'react-native-markdown-display'
import LottieView from 'lottie-react-native'
import { sendAIMessageUseCase } from '../../src/di/container'
import Feather from '@expo/vector-icons/Feather'
import { colors } from '../../src/presentation/theme'

interface Message { id: string; role: 'user' | 'assistant'; text: string }

export default function AIChatScreen() {
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: '¡Hola! 🐾 Soy el asistente de PetAdopt. ¿Tienes dudas sobre el cuidado de tu futura mascota?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const flatRef = useRef<FlatList>(null)
  const isDark = useColorScheme() === 'dark'

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
      <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View style={{
              flexDirection: 'row',
              justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <View style={{
                maxWidth: '80%',
                backgroundColor: item.role === 'user' ? '#6C63FF' : (isDark ? '#1a1a2e' : '#f0f0f5'),
                padding: 12,
                borderRadius: 16,
                borderBottomRightRadius: item.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: item.role === 'assistant' ? 4 : 16,
              }}>
                {item.role === 'user' ? (
                  <Text style={{ color: '#fff' }}>{item.text}</Text>
                ) : (
                  <Markdown style={markdownStyles(isDark)}>{item.text}</Markdown>
                )}
              </View>
            </View>
          )}
          ListFooterComponent={loading ? (
            <LottieView
              source={require('../../assets/lottie/loading.json')}
              autoPlay loop style={{ width: 60, height: 30, alignSelf: 'flex-start' }}
            />
          ) : null}
        />

        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 12 + insets.bottom,
          gap: 8,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#333' : '#e0e0e0',
          alignItems: 'center',
        }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: isDark ? '#fff' : '#000',
            }}
            placeholder="Pregunta sobre cuidados, salud..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
          />
          <TouchableOpacity
            onPress={send}
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: '#6C63FF',
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
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
