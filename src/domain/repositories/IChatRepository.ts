export interface ChatMessageData {
  id: string
  request_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  profiles?: { full_name: string; avatar_url?: string }
}

export interface IChatRepository {
  getMessages(requestId: string): Promise<ChatMessageData[]>
  sendMessage(requestId: string, senderId: string, content: string): Promise<void>
  subscribeToMessages(requestId: string, callback: (msg: ChatMessageData) => void): any
}
