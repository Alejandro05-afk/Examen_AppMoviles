El problema está en `completeOAuthSessionFromUrl`. Cuando llega el URL desde Vercel, viene con el `code` en los parámetros, pero la función `getParamsFromUrl` en `SupabaseAuthRepository.ts` puede estar fallando al parsear la URL porque el deep link `petadopt://auth/callback?code=xxx` tiene un formato que no siempre se parsea bien.

Agrega logs para confirmar, pero lo más probable es uno de estos dos problemas:

**Problema 1 - La URL llega al listener pero el `code` está en el hash (`#`) en vez del query string (`?`):**

Revisa `getParamsFromUrl` en `SupabaseAuthRepository.ts`:

```ts
const getParamsFromUrl = (url: string) => {
  const params = new URLSearchParams()
  const [, queryAndHash = ''] = url.split('?')
  const [query = '', hash = ''] = queryAndHash.split('#')
  const hashOnly = url.includes('#') ? url.split('#')[1] : hash

  new URLSearchParams(query).forEach((value, key) => params.set(key, value))
  new URLSearchParams(hashOnly).forEach((value, key) => params.set(key, value))

  return params
}
```

Esta función está bien escrita, así que el parseo no debería ser el problema.

**Problema 2 (más probable) - El listener en `callback.tsx` se dispara con la URL `petadopt://auth/callback` pero `completeOAuthSessionFromUrl` retorna `null` porque no hay `code` ni tokens aún:**

Esto pasa cuando el evento `url` se dispara con la URL base sin parámetros, o cuando `exchangeCodeForSession` falla silenciosamente.

Lo que necesitas es agregar logs para ver exactamente qué URL está llegando y qué está pasando. Modifica temporalmente el callback:

```tsx
const handleUrl = async (url: string) => {
  console.log('🔗 URL recibida:', url)  // <-- agrega esto
  if (!mounted) return
  try {
    const user = await completeOAuthSessionFromUrl(url)
    console.log('👤 Usuario:', user)  // <-- y esto
    if (!mounted || !user) {
      console.log('❌ No user, mounted:', mounted)  // <-- y esto
      return
    }
    router.replace(user.role === 'shelter' ? '/(shelter)/dashboard' : '/(adopter)/home')
  } catch (e: any) {
    console.log('💥 Error:', e.message)  // <-- y esto
    if (mounted) setError(e.message ?? 'No se pudo completar el inicio de sesion')
  }
}
```

Corre la app con `expo start` y mira los logs en la terminal. Dime qué URL aparece en el log `🔗 URL recibida:` y si hay algún error, así puedo darte la solución exacta.

Lo más común que veo que puede estar pasando es que el `onAuthStateChange` en `_layout.tsx` ya detectó la sesión antes de que `callback.tsx` llame a `exchangeCodeForSession`, o que el `code` ya fue consumido. ¿Los logs qué dicen?