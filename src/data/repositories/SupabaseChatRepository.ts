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

    await this.notifyOtherParty(requestId, senderId, content)
  }

  private async notifyOtherParty(requestId: string, senderId: string, content: string): Promise<void> {
    try {
      const { data: requestData } = await supabase
        .from('adoption_requests')
        .select('adopter_id, shelter_id, pets(name)')
        .eq('id', requestId)
        .single()

      if (!requestData) return

      const recipientId = requestData.adopter_id === senderId
        ? requestData.shelter_id
        : requestData.adopter_id

      const petName = (requestData.pets as any)?.name ?? 'una mascota'

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', senderId)
        .single()

      const senderName = (senderProfile as any)?.full_name ?? 'Alguien'
      const preview = content.length > 60 ? content.slice(0, 60) + '…' : content

      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', recipientId)
        .single()

      if (!(recipientProfile as any)?.push_token) return

      const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-push`

      await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: (recipientProfile as any).push_token,
          title: `💬 ${senderName} — ${petName}`,
          body: preview,
        }),
      })
    } catch {
      // Silently fail - push notification is best-effort
    }
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
