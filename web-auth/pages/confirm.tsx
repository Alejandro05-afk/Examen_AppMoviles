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
      {status === 'loading' && <p>Verificando tu cuenta...</p>}
      {status === 'success' && (
        <>
          <h1>Cuenta confirmada</h1>
          <p>Redirigiendo a la aplicacion...</p>
        </>
      )}
      {status === 'error' && <p>El enlace es invalido o expiro.</p>}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 12,
    padding: 24,
    fontFamily: 'sans-serif',
    textAlign: 'center' as const,
  },
}
