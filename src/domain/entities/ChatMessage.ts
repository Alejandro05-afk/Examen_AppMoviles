export interface ChatMessage {
  id: string
  requestId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
}
