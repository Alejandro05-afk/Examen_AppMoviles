interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export class GeminiDataSource {
  private readonly functionUrl = process.env.EXPO_PUBLIC_GEMINI_FUNCTION_URL!

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(this.functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) throw new Error('Error al conectar con el asistente')
    const data = await response.json()
    return data.reply
  }
}
