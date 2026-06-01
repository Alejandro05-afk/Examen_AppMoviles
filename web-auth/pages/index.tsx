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
      setTimeout(() => { window.location.href = appUrl }, 100)
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

      await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data: { ...meta, role } }),
      })

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
          <div style={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="4" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="20" cy="14" r="2"/><circle cx="4" cy="14" r="2"/><circle cx="7" cy="7" r="2"/>
              <path d="M11 10c-2.5 0-4.5 1.8-5 4h10c-.5-2.2-2.5-4-5-4z"/>
            </svg>
          </div>
          <h1 style={styles.title}>PetAdopt</h1>
          <p style={styles.subtitle}>¿Qué tipo de cuenta deseas crear?</p>
          <div style={styles.buttons}>
            <button
              style={{ ...styles.btn, ...styles.btnShelter }}
              onClick={() => selectRole('shelter')}
              disabled={saving}
            >
              <span style={styles.btnIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <span style={styles.btnLabel}>Soy un Refugio</span>
              <span style={styles.btnDesc}>Publica mascotas y recibe solicitudes de adopción</span>
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnAdopter }}
              onClick={() => selectRole('adopter')}
              disabled={saving}
            >
              <span style={styles.btnIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </span>
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
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)',
    textAlign: 'center',
    gap: 16,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    background: '#FFF8F0',
    borderRadius: 20,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 60px rgba(61,35,20,0.15)',
  },
  logo: {
    fontSize: 48,
    lineHeight: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#3D2314',
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B6F47',
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
    background: '#FFF3E0',
    borderColor: '#FFB347',
    color: '#8B6F47',
  },
  btnAdopter: {
    background: '#FFE8E8',
    borderColor: '#FF6B6B',
    color: '#E85555',
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
    color: '#8B6F47',
    margin: 0,
    marginTop: 8,
  },
  link: {
    color: '#FF6B6B',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  redirecting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: 600,
  },
  error: {
    color: '#E85555',
    background: '#FFE8E8',
    padding: '12px 20px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 400,
    textAlign: 'center',
  },
}
