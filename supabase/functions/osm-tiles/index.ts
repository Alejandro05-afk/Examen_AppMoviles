import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TILE_ORIGIN = 'https://tile.openstreetmap.org'
const USER_AGENT = 'PetAdopt/1.0 (+https://web-auth-teal.vercel.app)'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  try {
    const url = new URL(req.url)
    const tilePath = url.pathname.split('/osm-tiles/')[1]

    if (!tilePath) {
      return new Response('Missing tile path', { status: 400 })
    }

    const upstream = await fetch(`${TILE_ORIGIN}/${tilePath}`, {
      headers: {
        'User-Agent': USER_AGENT,
        Referer: 'https://web-auth-teal.vercel.app',
        'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5',
      },
    })

    if (!upstream.ok) {
      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=604800',
        },
      })
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'image/png',
        'Cache-Control': upstream.headers.get('cache-control') ?? 'public, max-age=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
