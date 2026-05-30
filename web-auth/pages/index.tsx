import { useEffect, useState } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type View = 'loading' | 'forward' | 'choose-role'

export default function HomePage() {
  const [view, setView] = useState<View>('loading')
  const [appUrl, setAppUrl] = useState('petadopt://auth/callback')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const tokens = getTokensFromHash()
    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('return_url') ?? 'petadopt://auth/callback'
    // Pasamos tokens como query params (el hash se pierde en Intents de Android)
    const qp = new URLSearchParams()
    if (tokens.accessToken) qp.set('access_token', tokens.accessToken)
    if (tokens.refreshToken) qp.set('refresh_token', tokens.refreshToken)
    const qs = qp.toString()
    const sep = returnUrl.includes('?') ? '&' : '?'
    const url = `${returnUrl}${qs ? sep + qs : ''}`
    setAppUrl(url)
    checkUserRole()
  }, [])

  useEffect(() => {
    if (view === 'forward' && appUrl) {
      window.location.replace(appUrl)
    }
  }, [view, appUrl])

  function getTokensFromHash() {
    const hash = window.location.hash.replace('#', '?')
    const p = new URLSearchParams(hash)
    return { accessToken: p.get('access_token'), refreshToken: p.get('refresh_token') }
  }

  function decodeJWT(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  }

  async function checkUserRole() {
    try {
      const { accessToken } = getTokensFromHash()
      if (!accessToken) { setView('forward'); return }

      const payload = decodeJWT(accessToken)
      if (!payload) { setView('forward'); return }

      const meta = payload.user_metadata || {}
      setView(meta.role === 'adopter' || meta.role === 'shelter' ? 'forward' : 'choose-role')
    } catch {
      setView('forward')
    }
  }

  async function selectRole(role: 'adopter' | 'shelter') {
    setSaving(true)
    try {
      const { accessToken } = getTokensFromHash()
      if (!accessToken) throw new Error('No hay tokens')

      const payload = decodeJWT(accessToken)
      if (!payload) throw new Error('No se pudo obtener el usuario')

      const headers: Record<string, string> = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }

      const meta = payload.user_metadata || {}
      const fullName = meta.full_name ?? meta.name ?? ''
      const avatarUrl = meta.avatar_url ?? meta.picture ?? null

      // Update user_metadata so future logins detect the role
      await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data: { ...meta, role } }),
      })

      // Upsert profile in database
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: payload.sub,
          email: payload.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role,
        }),
      })
      if (!profileRes.ok) throw new Error('Error al guardar el perfil')

      // Create shelter record if needed
      if (role === 'shelter') {
        const shelterRes = await fetch(`${supabaseUrl}/rest/v1/shelters`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            profile_id: payload.sub,
            name: fullName || 'Mi Refugio',
          }),
        })
        if (!shelterRes.ok) throw new Error('Error al crear el refugio')
      }

      // Pequeña espera para que el navegador procese las peticiones
      await new Promise(r => setTimeout(r, 500))
      window.location.href = appUrl
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar el rol')
      setSaving(false)
    }
  }

  if (view === 'choose-role') {
    return (
      <div style={styles.page}>
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.card}>
          <div style={styles.logo}>🐾</div>
          <h1 style={styles.title}>PetAdopt</h1>
          <p style={styles.subtitle}>¿Qué tipo de cuenta deseas crear?</p>
          <div style={styles.buttons}>
            <button
              style={{ ...styles.btn, ...styles.btnShelter }}
              onClick={() => selectRole('shelter')}
              disabled={saving}
            >
              <span style={styles.btnIcon}>🏠</span>
              <span style={styles.btnLabel}>Soy un Refugio</span>
              <span style={styles.btnDesc}>Publica mascotas y recibe solicitudes de adopción</span>
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnAdopter }}
              onClick={() => selectRole('adopter')}
              disabled={saving}
            >
              <span style={styles.btnIcon}>❤️</span>
              <span style={styles.btnLabel}>Soy un Adoptante</span>
              <span style={styles.btnDesc}>Busca mascotas y envía solicitudes de adopción</span>
            </button>
          </div>
          <p style={styles.footer}>
            {saving ? 'Guardando...' : `¿Ya tienes cuenta? `}
            {!saving && <a href={appUrl} style={styles.link}>Ir a la app</a>}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <p style={styles.redirecting}>Redirigiendo a PetAdopt...</p>
      {appUrl && <a href={appUrl} style={styles.linkFallback}>Abrir PetAdopt</a>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 24,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textAlign: 'center',
    gap: 16,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    background: 'white',
    borderRadius: 20,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logo: {
    fontSize: 48,
    lineHeight: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#2D3748',
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    margin: 0,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '20px 16px',
    borderRadius: 14,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    fontFamily: 'inherit',
  },
  btnShelter: {
    background: '#EBF4FF',
    borderColor: '#4A90E2',
    color: '#2B6CB0',
  },
  btnAdopter: {
    background: '#FFF5F5',
    borderColor: '#FF6584',
    color: '#C53030',
  },
  btnIcon: {
    fontSize: 32,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: 700,
  },
  btnDesc: {
    fontSize: 13,
    opacity: 0.8,
  },
  footer: {
    fontSize: 13,
    color: '#A0AEC0',
    margin: 0,
    marginTop: 8,
  },
  link: {
    color: '#4A90E2',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  linkFallback: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.95)',
    color: '#4A90E2',
    borderRadius: 12,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 15,
  },
  redirecting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: 600,
  },
  error: {
    color: '#FC8181',
    background: '#FFF5F5',
    padding: '12px 20px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 400,
    textAlign: 'center',
  },
}
