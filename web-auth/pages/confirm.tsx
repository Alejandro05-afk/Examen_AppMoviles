import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

const getQueryValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0]
  return value
}

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const returnUrl = useMemo(() => {
    return getQueryValue(router.query.return_url) ?? 'petadopt://auth/confirmed'
  }, [router.query.return_url])

  useEffect(() => {
    const returnUrlParam = getQueryValue(router.query.return_url)
    const tokenHash = getQueryValue(router.query.token_hash)
    const type = getQueryValue(router.query.type)

    if (returnUrlParam) {
      setStatus('success')
      setTimeout(() => {
        window.location.href = returnUrl
      }, 1000)
      return
    }

    if (!tokenHash || !type) return

    getSupabase().auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'recovery',
    }).then(({ error }) => {
      if (error) {
        setStatus('error')
      } else {
        setStatus('success')
        setTimeout(() => {
          window.location.href = returnUrl
        }, 1000)
      }
    })
  }, [router.query, returnUrl])

  return (
    <div style={styles.container}>
      {status === 'loading' && <p style={styles.text}>Verificando tu cuenta...</p>}
      {status === 'success' && (
        <>
          <div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 style={styles.title}>Cuenta confirmada</h1>
          <p style={styles.text}>Redirigiendo a la aplicación...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p style={styles.text}>El enlace es inválido o expiró.</p>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 16,
    padding: 24,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#FFF8F0',
    margin: 0,
  },
  text: {
    fontSize: 16,
    color: 'rgba(255,248,240,0.9)',
    margin: 0,
  },
}
