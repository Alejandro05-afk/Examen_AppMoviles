import { useEffect, useMemo } from 'react'

export default function HomePage() {
  const appUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'petadopt://auth/callback'

    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('return_url') ?? 'petadopt://auth/callback'
    params.delete('return_url')

    const query = params.toString()
    const separator = returnUrl.includes('?') ? '&' : '?'
    const queryString = query ? `${separator}${query}` : ''

    return `${returnUrl}${queryString}${window.location.hash}`
  }, [])

  useEffect(() => {
    window.location.replace(appUrl)
  }, [appUrl])

  return (
    <div style={styles.container}>
      <h1>Redirigiendo a PetAdopt...</h1>
      <p>Si la app no se abre automaticamente, toca el boton.</p>
      <a href={appUrl} style={styles.button}>Abrir PetAdopt</a>
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
  button: {
    display: 'inline-block',
    padding: '12px 18px',
    background: '#6C63FF',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 700,
  },
}
