import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ reply: 'Error: GEMINI_API_KEY no configurada en Supabase Edge Function secrets.' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const { messages } = await req.json()

    const systemContext = `Eres un asistente virtual de PetAdopt, una plataforma de adopción de mascotas. 
    Ayudas a los usuarios con preguntas sobre:
    - Cuidados de mascotas (alimentación, salud, higiene)
    - Proceso de adopción
    - Primeros pasos con una mascota nueva
    - Señales de alerta de salud animal
    Responde siempre en español, de forma amable y concisa.`

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }))

    if (contents.length === 0 || contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: systemContext }] })
      contents.push({ role: 'model', parts: [{ text: '¡Hola! Soy el asistente de PetAdopt. ¿En qué puedo ayudarte?' }] })
    }

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    const data = await response.json()

    if (data.error) {
      return new Response(JSON.stringify({ reply: `Error de Gemini: ${data.error.message ?? JSON.stringify(data.error)}` }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Lo siento, no pude procesar tu mensaje.'

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
