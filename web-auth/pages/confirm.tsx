import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const { token_hash, type } = router.query
    if (!token_hash || !type) return

    supabase.auth.verifyOtp({
      token_hash: token_hash as string,
      type: type as 'signup' | 'recovery',
    }).then(({ error }) => {
      if (error) {
        setStatus('error')
      } else {
        setStatus('success')
        setTimeout(() => {
          window.location.href = `petadopt://auth/confirmed`
        }, 2000)
      }
    })
  }, [router.query])

  return (
    <div style={styles.container}>
      {status === 'loading' && <p>Verificando tu cuenta...</p>}
      {status === 'success' && (
        <>
          <h1>✅ ¡Cuenta confirmada!</h1>
          <p>Redirigiendo a la aplicación...</p>
        </>
      )}
      {status === 'error' && <p>❌ El enlace es inválido o expiró.</p>}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    height: '100vh', fontFamily: 'sans-serif'
  }
}
