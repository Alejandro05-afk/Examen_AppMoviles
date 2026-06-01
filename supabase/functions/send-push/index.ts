import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const admin = createClient(supabaseUrl, serviceRoleKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    })
  }

  try {
    const { action, requestId, senderId, status } = await req.json()

    const { data: requestData } = await admin
      .from('adoption_requests')
      .select('adopter_id, shelter_id, pets(name)')
      .eq('id', requestId)
      .single()

    if (!requestData) {
      return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 })
    }

    const petName = (requestData.pets as any)?.name ?? 'una mascota'
    const userIds = [requestData.adopter_id, requestData.shelter_id]

    const { data: profiles } = await admin
      .from('profiles')
      .select('id, full_name, push_token')
      .in('id', userIds)

    if (!profiles) {
      return new Response(JSON.stringify({ error: 'Profiles not found' }), { status: 404 })
    }

    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

    if (action === 'chat') {
      const senderName = profileMap[senderId]?.full_name ?? 'Alguien'
      const preview = 'Nuevo mensaje en el chat'

      for (const uid of userIds) {
        const token = profileMap[uid]?.push_token
        if (!token) continue
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ to: token, title: `${senderName} — ${petName}`, body: preview, sound: 'default', priority: 'high' }),
        })
      }
    } else if (action === 'adoption_request') {
      const adopterName = profileMap[requestData.adopter_id]?.full_name ?? 'Un adoptante'
      const shelterToken = profileMap[requestData.shelter_id]?.push_token

      if (shelterToken) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ to: shelterToken, title: 'Nueva solicitud de adopcion', body: `${adopterName} quiere adoptar a ${petName}`, sound: 'default', priority: 'high' }),
        })
      }
    } else if (action === 'status_update') {
      const adopterToken = profileMap[requestData.adopter_id]?.push_token
      if (!adopterToken) {
        return new Response(JSON.stringify({ success: true, skipped: 'no token' }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      }

      const isAccepted = status === 'accepted'
      const title = isAccepted ? 'Solicitud aceptada' : 'Solicitud rechazada'
      const body = isAccepted
        ? `Felicidades! Tu solicitud para adoptar a ${petName} ha sido aprobada.`
        : `Tu solicitud para adoptar a ${petName} no fue aprobada en esta ocasion.`

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ to: adopterToken, title, body, sound: 'default', priority: 'high' }),
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
