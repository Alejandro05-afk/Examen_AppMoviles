import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { supabase } from '../../../data/supabase/client'
import { SupabaseChatRepository } from '../../../data/repositories/SupabaseChatRepository'
import { ChatMessageData } from '../../../domain/repositories/IChatRepository'
import { colors, borderRadius, spacing } from '../../theme'

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messagesContainer}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-circle" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Sin mensajes aún</Text>
            <Text style={styles.emptySub}>Envía el primer mensaje para coordinar la visita</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMe = item.sender_id === userId
          return (
            <View style={[styles.row, isMe && styles.rowRight]}>
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                {item.profiles && !isMe && (
                  <Text style={styles.senderName}>{item.profiles.full_name}</Text>
                )}
                <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                  {item.content}
                </Text>
                <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                  {formatTime(item.created_at)}
                </Text>
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
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={send}
          disabled={!input.trim() || sending}
        >
          <Feather name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  messagesContainer: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 2,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
})
