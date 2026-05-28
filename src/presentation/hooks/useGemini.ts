import { useState, useCallback } from 'react'
import { sendAIMessageUseCase } from '../../di/container'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export function useGemini() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: '¡Hola! 🐾 Soy el asistente de PetAdopt. ¿Tienes dudas sobre el cuidado de tu futura mascota?' }
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const reply = await sendAIMessageUseCase.execute(
        messages.map(m => ({ role: m.role, text: m.text })),
        text
      )
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { id: '999', role: 'assistant', text: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }, [messages])

  return { messages, loading, sendMessage }
}
