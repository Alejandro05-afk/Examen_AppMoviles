import { supabase } from '../supabase/client'
import { IChatRepository, ChatMessageData } from '../../domain/repositories/IChatRepository'

export class SupabaseChatRepository implements IChatRepository {
  async getMessages(requestId: string): Promise<ChatMessageData[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data as ChatMessageData[]
  }

  async sendMessage(requestId: string, senderId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .insert({ request_id: requestId, sender_id: senderId, content })

    if (error) throw new Error(error.message)
  }

  subscribeToMessages(requestId: string, callback: (msg: ChatMessageData) => void) {
    return supabase
      .channel(`chat:${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `request_id=eq.${requestId}`,
      }, payload => callback(payload.new as ChatMessageData))
      .subscribe()
  }
}
