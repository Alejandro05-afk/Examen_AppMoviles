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
    if (password !== confirm) return alert('Las contrasenas no coinciden')
    setStatus('loading')

    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => {
        window.location.href = returnUrl
      }, 1000)
    }
  }

  if (!sessionReady) {
    return <div style={styles.container}><p>Validando enlace...</p></div>
  }

  return (
    <div style={styles.formContainer}>
      <h2>Nueva contrasena</h2>
      {status === 'form' || status === 'loading' ? (
        <>
          <input
            type="password"
            placeholder="Nueva contrasena"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirmar contrasena"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSubmit} disabled={status === 'loading'} style={styles.button}>
            {status === 'loading' ? 'Guardando...' : 'Actualizar contrasena'}
          </button>
        </>
      ) : status === 'success' ? (
        <>
          <p>Contrasena actualizada. Volviendo a la app...</p>
          <a href={returnUrl} style={styles.linkButton}>Volver a PetAdopt</a>
        </>
      ) : (
        <p>Error al actualizar. Intenta de nuevo.</p>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  formContainer: {
    maxWidth: 400,
    margin: '80px auto',
    padding: 24,
    fontFamily: 'sans-serif',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    padding: '12px 24px',
    background: '#6C63FF',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  linkButton: {
    display: 'inline-block',
    padding: '12px 18px',
    background: '#6C63FF',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 700,
  },
}
