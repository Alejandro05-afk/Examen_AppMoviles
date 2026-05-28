import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const { token_hash, type } = router.query
    if (!token_hash || type !== 'recovery') return

    supabase.auth.verifyOtp({
      token_hash: token_hash as string,
      type: 'recovery',
    }).then(({ error }) => {
      if (!error) setSessionReady(true)
    })
  }, [router.query])

  const handleSubmit = async () => {
    if (password !== confirm) return alert('Las contraseñas no coinciden')
    setStatus('loading')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => {
        window.location.href = `petadopt://auth/password-updated`
      }, 2000)
    }
  }

  if (!sessionReady) return <p>Validando enlace...</p>

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>🔐 Nueva contraseña</h2>
      {status === 'form' || status === 'loading' ? (
        <>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleSubmit} disabled={status === 'loading'} style={btnStyle}>
            {status === 'loading' ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </>
      ) : status === 'success' ? (
        <p>✅ Contraseña actualizada. Volviendo a la app...</p>
      ) : (
        <p>❌ Error al actualizar. Intenta de nuevo.</p>
      )}
    </div>
  )
}

const inputStyle = { display: 'block', width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }
const btnStyle = { padding: '12px 24px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
