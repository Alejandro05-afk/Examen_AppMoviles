import { useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SupabaseChatRepository } from '../../../src/data/repositories/SupabaseChatRepository'
import { supabase } from '../../../src/data/supabase/client'
import { useAuthStore } from '../../../src/presentation/store/authStore'
import { colors, borderRadius } from '../../../src/presentation/theme'
import Feather from '@expo/vector-icons/Feather'

const chatRepo = new SupabaseChatRepository()

export default function ShelterChatScreen() {
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
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} style={styles.container}>
      <View style={styles.content}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={styles.messagesContainer}
          style={{ flex: 1 }}
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id
            return (
              <View style={[styles.messageWrapper, isMe && styles.messageWrapperRight]}>
                <View style={[
                  styles.message,
                  isMe ? styles.messageMe : styles.messageOther,
                  isMe ? styles.messageMeRadius : styles.messageOtherRadius
                ]}>
                  <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.content}</Text>
                </View>
              </View>
            )
          }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={send}>
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    gap: 8,
  },
  messageWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  message: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: borderRadius.md,
  },
  messageMe: {
    backgroundColor: colors.primary,
  },
  messageOther: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageMeRadius: {
    borderBottomRightRadius: 2,
  },
  messageOtherRadius: {
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
  },
  messageTextMe: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
