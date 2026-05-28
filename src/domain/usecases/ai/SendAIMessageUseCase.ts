export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export class SendAIMessageUseCase {
  constructor(private geminiDS: { sendMessage(messages: ChatMessage[]): Promise<string> }) {}

  async execute(messages: ChatMessage[], newMessage: string): Promise<string> {
    const allMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: newMessage },
    ]
    return this.geminiDS.sendMessage(allMessages)
  }
}
