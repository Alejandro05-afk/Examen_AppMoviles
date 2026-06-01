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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [sessionReady, setSessionReady] = useState(false)

  const returnUrl = useMemo(() => {
    return getQueryValue(router.query.return_url) ?? 'petadopt://auth/password-updated'
  }, [router.query.return_url])

  useEffect(() => {
    const tokenHash = getQueryValue(router.query.token_hash)
    const type = getQueryValue(router.query.type)
    if (!tokenHash || type !== 'recovery') return

    getSupabase().auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    }).then(({ error }) => {
      if (!error) setSessionReady(true)
    })
  }, [router.query])

  const handleSubmit = async () => {
    if (password !== confirm) return alert('Las contraseñas no coinciden')
    setStatus('loading')

    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (!sessionReady) {
    return (
      <div style={styles.container}>
        <p style={styles.text}>Validando enlace...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nueva contraseña</h2>
        {status === 'form' || status === 'loading' ? (
          <div style={styles.form}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleSubmit} disabled={status === 'loading'} style={styles.button}>
              {status === 'loading' ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </div>
        ) : status === 'success' ? (
          <p style={styles.text}>Contraseña actualizada correctamente. Ahora puedes iniciar sesión en la app con tu nueva contraseña.</p>
        ) : (
          <p style={styles.text}>Error al actualizar. Intenta de nuevo.</p>
        )}
      </div>
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
    padding: 24,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)',
  },
  card: {
    background: '#FFF8F0',
    borderRadius: 20,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 60px rgba(61,35,20,0.15)',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#3D2314',
    margin: 0,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 14,
    fontSize: 16,
    border: '2px solid #E8ECF0',
    borderRadius: 12,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  button: {
    padding: '14px 24px',
    background: '#FF6B6B',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  linkButton: {
    display: 'inline-block',
    padding: '12px 18px',
    background: '#FF6B6B',
    color: '#fff',
    borderRadius: 12,
    textDecoration: 'none',
    fontWeight: 700,
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    color: '#8B6F47',
    margin: 0,
  },
}
