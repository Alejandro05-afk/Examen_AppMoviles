# AGENT.md — PetAdopt 🐾

> Guía completa para construir la aplicación PetAdopt con React Native, Supabase, Gemini AI y OpenStreetMap siguiendo Clean Architecture, NativeWind/Tamagui + Lottie.

---

## ÍNDICE

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura Clean](#3-arquitectura-clean)
4. [Estructura de Carpetas](#4-estructura-de-carpetas)
5. [Configuración Inicial del Proyecto](#5-configuración-inicial-del-proyecto)
6. [⚙️ Configuraciones Externas Paso a Paso](#6-️-configuraciones-externas-paso-a-paso)
   - [6.1 Supabase](#61-supabase)
   - [6.2 Google OAuth](#62-google-oauth)
   - [6.3 Vercel/Railway/Render (Web Auxiliar)](#63-vercelrailwayrender-web-auxiliar)
   - [6.4 Gemini AI](#64-gemini-ai)
7. [Esquema de Base de Datos](#7-esquema-de-base-de-datos)
8. [Row Level Security (RLS)](#8-row-level-security-rls)
9. [Supabase Storage](#9-supabase-storage)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Módulo 1: Autenticación](#11-módulo-1-autenticación)
12. [Módulo 2: CRUD de Mascotas](#12-módulo-2-crud-de-mascotas)
13. [Módulo 3: Chat con Gemini AI](#13-módulo-3-chat-con-gemini-ai)
14. [Módulo 4: Solicitudes de Adopción](#14-módulo-4-solicitudes-de-adopción)
15. [Módulo 5: Mapa con OpenStreetMap](#15-módulo-5-mapa-con-openstreetmap)
16. [UI: Tamagui](#16-ui-tamagui)
17. [Animaciones: Lottie](#17-animaciones-lottie)
18. [Notificaciones Push (Bonus +15pts)](#18-notificaciones-push-bonus-15pts)
19. [Chat en Tiempo Real (Bonus +15pts)](#19-chat-en-tiempo-real-bonus-15pts)
20. [Checklist de Entrega](#20-checklist-de-entrega)

---

## 1. Visión General del Proyecto

**PetAdopt** es una app móvil multiplataforma (React Native + Expo) que conecta **refugios de animales** con **adoptantes**, ofreciendo:

| Rol | Capacidades |
|---|---|
| **Refugio** | Registro/Login, CRUD de mascotas, gestión de solicitudes de adopción, chat con solicitantes |
| **Adoptante/Solicitante** | Registro/Login, explorar mascotas, solicitar adopción, chat IA, ver refugios en mapa |

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión para SDK 54 |
|---|---|---|
| Framework móvil | React Native + Expo | `expo ~54.0.0` / RN `0.81.x` / React `19.1.0` |
| Backend / Auth / DB / Storage | Supabase | `@supabase/supabase-js ^2.x` |
| UI Components | **Tamagui v2** | `tamagui@latest` (v2, requiere RN 0.81+) |
| Animaciones | **Lottie** | `lottie-react-native ~7.3.1` |
| Mapas | `react-native-maps` + OpenStreetMap | `react-native-maps@1.20.1` |
| IA Conversacional | Google Gemini API | vía Edge Function Supabase |
| Navegación | Expo Router | v4 (incluido en SDK 54) |
| Animaciones nativas | Reanimated | `~4.1.0` |
| Gestos | Gesture Handler | `~2.28.0` |
| Estado global | Zustand | `^5.x` |
| Formularios | React Hook Form + Zod | latest |
| Async Storage | AsyncStorage | `2.2.0` |
| Safe Area | react-native-safe-area-context | `~5.6.0` |
| Screens | react-native-screens | `~4.16.0` |
| Web Auxiliar | Next.js | v14+ desplegado en Vercel/Railway/Render |

> ⚠️ **Compatibilidad crítica:** Tamagui **v1** NO funciona con Expo SDK 54 / React Native 0.81. Es **obligatorio** usar Tamagui **v2**.

---

## 3. Arquitectura Clean

```
Presentation Layer  →  Domain Layer  →  Data Layer
     (UI)                (Use Cases)       (Repos / API)
```

**Reglas:**
- Las capas externas dependen de las internas. NUNCA al revés.
- El `Domain Layer` no importa nada de React Native ni de Supabase.
- Las interfaces (contratos) viven en `domain/repositories/`.
- Las implementaciones concretas viven en `data/repositories/`.
- Los Use Cases orquestan la lógica de negocio sin conocer la UI.

```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │  ← Screens, Components, Tamagui, Lottie
│         (src/presentation)          │
└────────────────┬────────────────────┘
                 │ usa
┌────────────────▼────────────────────┐
│           DOMAIN LAYER              │  ← Entities, Use Cases, Repository Interfaces
│           (src/domain)              │     (NO depende de nada externo)
└────────────────┬────────────────────┘
                 │ implementado por
┌────────────────▼────────────────────┐
│            DATA LAYER               │  ← Supabase, Gemini API, AsyncStorage
│            (src/data)               │
└─────────────────────────────────────┘
```

---

## 4. Estructura de Carpetas

```
petadopt/
├── app/                          # Expo Router — rutas de navegación
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (shelter)/                # Stack del refugio
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── pets/
│   │   │   ├── index.tsx         # Lista de mascotas del refugio
│   │   │   ├── create.tsx
│   │   │   └── [id]/
│   │   │       ├── edit.tsx
│   │   │       └── adoption-requests.tsx
│   │   └── chat/
│   │       └── [requestId].tsx
│   ├── (adopter)/                # Stack del adoptante
│   │   ├── _layout.tsx
│   │   ├── home.tsx              # Explorar mascotas
│   │   ├── pet/[id].tsx          # Detalle mascota
│   │   ├── my-requests.tsx
│   │   ├── ai-chat.tsx
│   │   ├── map.tsx
│   │   └── chat/
│   │       └── [requestId].tsx
│   └── _layout.tsx
│
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Pet.ts
│   │   │   ├── AdoptionRequest.ts
│   │   │   ├── Shelter.ts
│   │   │   └── ChatMessage.ts
│   │   ├── repositories/         # Contratos / Interfaces
│   │   │   ├── IAuthRepository.ts
│   │   │   ├── IPetRepository.ts
│   │   │   ├── IAdoptionRepository.ts
│   │   │   ├── IShelterRepository.ts
│   │   │   └── IChatRepository.ts
│   │   └── usecases/
│   │       ├── auth/
│   │       │   ├── LoginUseCase.ts
│   │       │   ├── RegisterUseCase.ts
│   │       │   ├── LoginWithGoogleUseCase.ts
│   │       │   └── ResetPasswordUseCase.ts
│   │       ├── pets/
│   │       │   ├── CreatePetUseCase.ts
│   │       │   ├── UpdatePetUseCase.ts
│   │       │   ├── DeletePetUseCase.ts
│   │       │   ├── GetShelterPetsUseCase.ts
│   │       │   └── GetAvailablePetsUseCase.ts
│   │       ├── adoption/
│   │       │   ├── CreateAdoptionRequestUseCase.ts
│   │       │   ├── AcceptAdoptionRequestUseCase.ts
│   │       │   ├── RejectAdoptionRequestUseCase.ts
│   │       │   └── GetAdoptionRequestsUseCase.ts
│   │       ├── shelters/
│   │       │   └── GetNearbySheltersUseCase.ts
│   │       └── ai/
│   │           └── SendAIMessageUseCase.ts
│   │
│   ├── data/
│   │   ├── supabase/
│   │   │   └── client.ts         # Instancia Supabase
│   │   ├── repositories/         # Implementaciones concretas
│   │   │   ├── SupabaseAuthRepository.ts
│   │   │   ├── SupabasePetRepository.ts
│   │   │   ├── SupabaseAdoptionRepository.ts
│   │   │   ├── SupabaseShelterRepository.ts
│   │   │   └── SupabaseChatRepository.ts
│   │   └── datasources/
│   │       └── GeminiDataSource.ts
│   │
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── LottieLoader.tsx
│   │   │   │   ├── LottieSplash.tsx
│   │   │   │   └── LottieSuccess.tsx
│   │   │   ├── pets/
│   │   │   │   ├── PetCard.tsx
│   │   │   │   └── PetForm.tsx
│   │   │   ├── adoption/
│   │   │   │   └── AdoptionRequestCard.tsx
│   │   │   └── map/
│   │   │       └── ShelterMarker.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePets.ts
│   │   │   ├── useAdoption.ts
│   │   │   └── useGemini.ts
│   │   └── store/
│   │       ├── authStore.ts      # Zustand
│   │       └── petsStore.ts
│   │
│   └── di/                       # Inyección de dependencias
│       └── container.ts          # Construye y exporta los use cases con sus repos
│
├── assets/
│   └── lottie/
│       ├── loading.json
│       ├── success.json
│       ├── empty-pets.json
│       ├── paw-animation.json
│       └── splash.json
│
├── web-auth/                     # Proyecto auxiliar (Next.js) para Vercel/Railway/Render
│   ├── pages/
│   │   ├── confirm.tsx
│   │   └── reset-password.tsx
│   └── package.json
│
├── .env
└── package.json
```

---

## 5. Configuración Inicial del Proyecto

```bash
# 1. Crear proyecto Expo SDK 54
npx create-expo-app@latest petadopt --template blank-typescript
cd petadopt

# Verificar que package.json tenga:
# "expo": "~54.0.0", "react-native": "0.81.x", "react": "19.1.0"

# 2. Expo Router v4 (incluido en SDK 54)
npx expo install expo-router react-native-safe-area-context@~5.6.0 react-native-screens@~4.16.0 expo-linking expo-constants expo-status-bar

# 3. Supabase
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage@2.2.0 expo-secure-store react-native-url-polyfill

# 4. Tamagui v2 (compatible con RN 0.81+ / SDK 54)
# ⚠️ Tamagui v1 NO es compatible con SDK 54. Usar v2 obligatoriamente.
npm install tamagui@latest @tamagui/config@latest @tamagui/babel-plugin@latest @tamagui/font-inter@latest

# 5. Lottie — versión verificada para SDK 54
npx expo install lottie-react-native@~7.3.1

# 6. Mapas — 1.20.x es la versión estable con New Architecture interop en SDK 54
npx expo install react-native-maps@1.20.1 expo-location

# 7. Google Auth
npx expo install expo-auth-session expo-crypto expo-web-browser

# 8. Reanimated v4 (requerido por SDK 54 / RN 0.81)
npx expo install react-native-reanimated@~4.1.0

# 9. Gesture Handler
npx expo install react-native-gesture-handler@~2.28.0

# 10. Formularios
npm install react-hook-form zod @hookform/resolvers

# 11. Estado global
npm install zustand

# 12. Imágenes
npx expo install expo-image-picker expo-file-system

# 13. Notificaciones (bonus)
npx expo install expo-notifications expo-device

# 14. Web auxiliar
mkdir web-auth && cd web-auth
npx create-next-app . --typescript
npm install @supabase/supabase-js
```

> ⚠️ **IMPORTANTE — New Architecture en SDK 54:**
> SDK 54 es la **última versión** que soporta la arquitectura legacy. Se recomienda habilitar New Architecture ya que será obligatoria en SDK 55.
> En `app.json`:
> ```json
> {
>   "expo": {
>     "ios": { "newArchEnabled": true },
>     "android": { "newArchEnabled": true }
>   }
> }
> ```
> Tamagui v2 y `react-native-maps 1.20.x` son compatibles con New Architecture via interop layer.

### `package.json` de referencia (versiones verificadas SDK 54)

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.1.0",
    "react-native": "0.81.4",
    "expo-router": "~4.0.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-reanimated": "~4.1.0",
    "react-native-gesture-handler": "~2.28.0",
    "@supabase/supabase-js": "^2.49.0",
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo-secure-store": "~14.0.0",
    "react-native-url-polyfill": "^2.0.0",
    "tamagui": "^2.0.0",
    "@tamagui/config": "^2.0.0",
    "@tamagui/babel-plugin": "^2.0.0",
    "@tamagui/font-inter": "^2.0.0",
    "lottie-react-native": "~7.3.1",
    "react-native-maps": "1.20.1",
    "expo-location": "~18.0.0",
    "expo-auth-session": "~6.0.0",
    "expo-crypto": "~14.0.0",
    "expo-web-browser": "~14.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-file-system": "~18.0.0",
    "expo-notifications": "~0.31.0",
    "expo-device": "~7.0.0",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "zustand": "^5.x"
  }
}
```

---

## 6. ⚙️ Configuraciones Externas Paso a Paso

### 6.1 Supabase

#### Paso 1: Crear el proyecto

1. Ve a [https://supabase.com](https://supabase.com) → **New Project**
2. Elige nombre: `petadopt`, selecciona región más cercana (us-east-1 o similar)
3. Anota:
   - `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### Paso 2: Ejecutar el SQL de la base de datos

Ve a **SQL Editor** en Supabase y ejecuta el bloque completo del [Sección 7](#7-esquema-de-base-de-datos).

#### Paso 3: Configurar Auth

1. Ve a **Authentication → Settings**
2. En **Email Auth**:
   - ✅ Enable email confirmations
   - **Site URL**: URL de tu web auxiliar (ej: `https://petadopt-auth.vercel.app`)
   - **Redirect URLs**: agrega:
     ```
     https://petadopt-auth.vercel.app/confirm
     https://petadopt-auth.vercel.app/reset-password
     petadopt://auth/callback
     ```
3. En **Email Templates**:
   - **Confirm signup** → cambia `{{ .ConfirmationURL }}` a:
     ```
     https://petadopt-auth.vercel.app/confirm?token_hash={{ .TokenHash }}&type=signup
     ```
   - **Reset password** → cambia la URL a:
     ```
     https://petadopt-auth.vercel.app/reset-password?token_hash={{ .TokenHash }}&type=recovery
     ```

#### Paso 4: Configurar Storage

1. Ve a **Storage → New bucket**
2. Crea bucket: `pets-images`
   - ✅ Public bucket
3. En **Policies** del bucket, añade política de INSERT para usuarios autenticados:
   ```sql
   CREATE POLICY "Authenticated can upload pet images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'pets-images');

   CREATE POLICY "Public can view pet images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'pets-images');

   CREATE POLICY "Owners can update/delete their pet images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'pets-images' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

---

### 6.2 Google OAuth

#### Paso 1: Google Cloud Console

1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Crear proyecto** → nombre: `PetAdopt`
3. Ve a **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Configura la pantalla de consentimiento OAuth:
   - Tipo: **External**
   - App name: `PetAdopt`
   - Agrega scopes: `email`, `profile`
5. Crea dos clientes OAuth:

**Para Web (usado por Supabase):**
- Application type: **Web application**
- Authorized redirect URIs:
  ```
  https://<TU_PROJECT_REF>.supabase.co/auth/v1/callback
  ```
- Anota: `Web Client ID` y `Web Client Secret`

**Para Android:**
- Application type: **Android**
- Package name: `com.tuapp.petadopt` (el de tu app.json)
- SHA-1: obtén con:
  ```bash
  cd android && ./gradlew signingReport
  ```

**Para iOS:**
- Application type: **iOS**
- Bundle ID: `com.tuapp.petadopt`
- Anota: `iOS Client ID`

#### Paso 2: Configurar en Supabase

1. Ve a **Authentication → Providers → Google**
2. ✅ Enable Google provider
3. Pega el **Web Client ID** y **Web Client Secret**
4. Guardar

#### Paso 3: Configurar en la app

```jsonc
// app.json
{
  "expo": {
    "scheme": "petadopt",
    "ios": {
      "bundleIdentifier": "com.tuapp.petadopt",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.tuapp.petadopt",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

### 6.3 Vercel/Railway/Render (Web Auxiliar)

El web auxiliar maneja las páginas de **confirmación de cuenta** y **reseteo de contraseña** porque Supabase redirige a una URL web, no puede redirigir directamente a la app móvil en todos los casos.

#### Flujo:
```
Email de Supabase → Link al Web Auxiliar → Web procesa token → Redirige a la app (deep link)
```

#### Página `/confirm` (Next.js)

```tsx
// web-auth/pages/confirm.tsx
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
        // Deep link de vuelta a la app
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
```

#### Página `/reset-password` (Next.js)

```tsx
// web-auth/pages/reset-password.tsx
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
```

#### Deploy en Vercel

```bash
cd web-auth
# Instalar Vercel CLI
npm i -g vercel
vercel

# Variables de entorno en Vercel Dashboard:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Una vez desplegado, copia la URL (ej: `https://petadopt-auth.vercel.app`) y colócala como **Site URL** en Supabase Auth Settings.

---

### 6.4 Gemini AI

#### Paso 1: Obtener API Key

1. Ve a [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta Google
3. Clic en **Create API Key**
4. Selecciona tu proyecto GCP (el mismo de Google OAuth)
5. Copia la API key → `GEMINI_API_KEY`

> ⚠️ **NUNCA** guardes la API key directamente en el código cliente. En producción, usa un Edge Function de Supabase como proxy.

#### Paso 2: Crear Edge Function en Supabase como proxy

```bash
# En tu proyecto local
npx supabase functions new gemini-chat
```

```typescript
// supabase/functions/gemini-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  try {
    const { messages } = await req.json()

    // Contexto del sistema para PetAdopt
    const systemContext = `Eres un asistente virtual de PetAdopt, una plataforma de adopción de mascotas. 
    Ayudas a los usuarios con preguntas sobre:
    - Cuidados de mascotas (alimentación, salud, higiene)
    - Proceso de adopción
    - Primeros pasos con una mascota nueva
    - Señales de alerta de salud animal
    Responde siempre en español, de forma amable y concisa.`

    const contents = [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: '¡Hola! Soy el asistente de PetAdopt. ¿En qué puedo ayudarte hoy? 🐾' }] },
      ...messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))
    ]

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Lo siento, no pude procesar tu mensaje.'

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
```

#### Paso 3: Desplegar la Edge Function

```bash
# Configurar secret en Supabase
npx supabase secrets set GEMINI_API_KEY=tu_api_key_aqui

# Desplegar
npx supabase functions deploy gemini-chat --no-verify-jwt
```

> Nota: `--no-verify-jwt` permite llamarla sin token. Si quieres protegerla, quita esa flag y pasa el JWT del usuario en el header `Authorization`.

---

## 7. Esquema de Base de Datos

Ejecuta todo este bloque en el **SQL Editor** de Supabase:

```sql
-- =============================================
-- EXTENSIONES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES (extiende auth.users)
-- =============================================
CREATE TYPE user_role AS ENUM ('adopter', 'shelter');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'adopter',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SHELTERS
-- =============================================
CREATE TABLE shelters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PETS
-- =============================================
CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'rabbit', 'bird', 'other');
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE pet_gender AS ENUM ('male', 'female');
CREATE TYPE pet_status AS ENUM ('available', 'pending', 'adopted');

CREATE TABLE pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species pet_species NOT NULL,
  breed TEXT,
  age_years INTEGER DEFAULT 0,
  age_months INTEGER DEFAULT 0,
  size pet_size NOT NULL,
  gender pet_gender NOT NULL,
  description TEXT,
  is_vaccinated BOOLEAN DEFAULT FALSE,
  is_sterilized BOOLEAN DEFAULT FALSE,
  is_dewormed BOOLEAN DEFAULT FALSE,
  status pet_status DEFAULT 'available',
  main_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PET PHOTOS (galería)
-- =============================================
CREATE TABLE pet_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADOPTION REQUESTS
-- =============================================
CREATE TYPE adoption_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE adoption_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  adopter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE NOT NULL,
  status adoption_status DEFAULT 'pending',
  message TEXT,
  shelter_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Un adoptante solo puede tener una solicitud activa por mascota
  UNIQUE(pet_id, adopter_id)
);

-- =============================================
-- CHAT MESSAGES (tiempo real - bonus)
-- =============================================
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES adoption_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRIGGER: auto-crear profile al registrarse
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'adopter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TRIGGER: actualizar updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_adoption_requests_updated_at BEFORE UPDATE ON adoption_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar Realtime para chat (bonus)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE adoption_requests;
```

---

## 8. Row Level Security (RLS)

```sql
-- =============================================
-- RLS PROFILES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =============================================
-- RLS SHELTERS
-- =============================================
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shelters" ON shelters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Shelter owner can insert" ON shelters FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Shelter owner can update" ON shelters FOR UPDATE TO authenticated
  USING (auth.uid() = profile_id);
CREATE POLICY "Shelter owner can delete" ON shelters FOR DELETE TO authenticated
  USING (auth.uid() = profile_id);

-- =============================================
-- RLS PETS
-- =============================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available pets" ON pets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Shelter can insert pets" ON pets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM shelters WHERE id = pets.shelter_id AND profile_id = auth.uid())
  );
CREATE POLICY "Shelter can update own pets" ON pets FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM shelters WHERE id = pets.shelter_id AND profile_id = auth.uid())
  );
CREATE POLICY "Shelter can delete own pets" ON pets FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM shelters WHERE id = pets.shelter_id AND profile_id = auth.uid())
  );

-- =============================================
-- RLS ADOPTION REQUESTS
-- =============================================
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adopter sees own requests" ON adoption_requests FOR SELECT TO authenticated
  USING (adopter_id = auth.uid());
CREATE POLICY "Shelter sees requests for their pets" ON adoption_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM shelters WHERE id = adoption_requests.shelter_id AND profile_id = auth.uid())
  );
CREATE POLICY "Adopter can create request" ON adoption_requests FOR INSERT TO authenticated
  WITH CHECK (adopter_id = auth.uid());
CREATE POLICY "Shelter can update request status" ON adoption_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM shelters WHERE id = adoption_requests.shelter_id AND profile_id = auth.uid())
  );

-- =============================================
-- RLS CHAT MESSAGES
-- =============================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages" ON chat_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adoption_requests ar
      WHERE ar.id = chat_messages.request_id
        AND (
          ar.adopter_id = auth.uid() OR
          EXISTS (SELECT 1 FROM shelters s WHERE s.id = ar.shelter_id AND s.profile_id = auth.uid())
        )
    )
  );
CREATE POLICY "Participants can send messages" ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
```

---

## 9. Supabase Storage

```sql
-- Política adicional para actualizar fotos propias
CREATE POLICY "Shelters can update pet images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pets-images');
```

---

## 10. Variables de Entorno

```env
# .env (raíz del proyecto Expo)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GEMINI_FUNCTION_URL=https://xxxx.supabase.co/functions/v1/gemini-chat

# web-auth/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 11. Módulo 1: Autenticación

### Domain Layer

```typescript
// src/domain/entities/User.ts
export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: 'adopter' | 'shelter'
  phone?: string
}

// src/domain/repositories/IAuthRepository.ts
import { User } from '../entities/User'

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>
  register(email: string, password: string, fullName: string, role: 'adopter' | 'shelter'): Promise<User>
  loginWithGoogle(): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
}
```

### Data Layer

```typescript
// src/data/supabase/client.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

// src/data/repositories/SupabaseAuthRepository.ts
import { supabase } from '../supabase/client'
import { IAuthRepository } from '../../domain/repositories/IAuthRepository'
import { User } from '../../domain/entities/User'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return this.mapToUser(data.user!)
  }

  async register(email: string, password: string, fullName: string, role: 'adopter' | 'shelter'): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${process.env.EXPO_PUBLIC_WEB_AUTH_URL}/confirm`,
      },
    })
    if (error) throw new Error(error.message)
    return this.mapToUser(data.user!)
  }

  async loginWithGoogle(): Promise<User> {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'petadopt', path: 'auth/callback' })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUri, skipBrowserRedirect: true },
    })
    if (error) throw new Error(error.message)

    const result = await WebBrowser.openAuthSessionAsync(data.url!, redirectUri)
    if (result.type !== 'success') throw new Error('Google sign-in cancelled')

    const url = new URL(result.url)
    const code = url.searchParams.get('code')
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }

    const { data: userData } = await supabase.auth.getUser()
    return this.mapToUser(userData.user!)
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    return this.mapToUser(data.user)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_WEB_AUTH_URL}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  private async mapToUser(authUser: any): Promise<User> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    return {
      id: authUser.id,
      email: authUser.email!,
      fullName: profile?.full_name ?? '',
      avatarUrl: profile?.avatar_url,
      role: profile?.role ?? 'adopter',
      phone: profile?.phone,
    }
  }
}
```

### Use Cases

```typescript
// src/domain/usecases/auth/LoginUseCase.ts
import { IAuthRepository } from '../../repositories/IAuthRepository'
import { User } from '../../entities/User'

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password) throw new Error('Email y contraseña son requeridos')
    return this.authRepo.login(email, password)
  }
}

// src/domain/usecases/auth/RegisterUseCase.ts
import { IAuthRepository } from '../../repositories/IAuthRepository'

export class RegisterUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string, fullName: string, role: 'adopter' | 'shelter') {
    if (!email || !password || !fullName) throw new Error('Todos los campos son requeridos')
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')
    return this.authRepo.register(email, password, fullName, role)
  }
}
```

### DI Container

```typescript
// src/di/container.ts
import { SupabaseAuthRepository } from '../data/repositories/SupabaseAuthRepository'
import { SupabasePetRepository } from '../data/repositories/SupabasePetRepository'
import { SupabaseAdoptionRepository } from '../data/repositories/SupabaseAdoptionRepository'
import { SupabaseShelterRepository } from '../data/repositories/SupabaseShelterRepository'
import { GeminiDataSource } from '../data/datasources/GeminiDataSource'

import { LoginUseCase } from '../domain/usecases/auth/LoginUseCase'
import { RegisterUseCase } from '../domain/usecases/auth/RegisterUseCase'
import { LoginWithGoogleUseCase } from '../domain/usecases/auth/LoginWithGoogleUseCase'
import { CreatePetUseCase } from '../domain/usecases/pets/CreatePetUseCase'
import { GetShelterPetsUseCase } from '../domain/usecases/pets/GetShelterPetsUseCase'
import { UpdatePetUseCase } from '../domain/usecases/pets/UpdatePetUseCase'
import { DeletePetUseCase } from '../domain/usecases/pets/DeletePetUseCase'
import { GetAvailablePetsUseCase } from '../domain/usecases/pets/GetAvailablePetsUseCase'
import { CreateAdoptionRequestUseCase } from '../domain/usecases/adoption/CreateAdoptionRequestUseCase'
import { AcceptAdoptionRequestUseCase } from '../domain/usecases/adoption/AcceptAdoptionRequestUseCase'
import { RejectAdoptionRequestUseCase } from '../domain/usecases/adoption/RejectAdoptionRequestUseCase'
import { GetAdoptionRequestsUseCase } from '../domain/usecases/adoption/GetAdoptionRequestsUseCase'
import { SendAIMessageUseCase } from '../domain/usecases/ai/SendAIMessageUseCase'
import { GetNearbySheltersUseCase } from '../domain/usecases/shelters/GetNearbySheltersUseCase'

// Repos
const authRepo = new SupabaseAuthRepository()
const petRepo = new SupabasePetRepository()
const adoptionRepo = new SupabaseAdoptionRepository()
const shelterRepo = new SupabaseShelterRepository()
const geminiDS = new GeminiDataSource()

// Auth
export const loginUseCase = new LoginUseCase(authRepo)
export const registerUseCase = new RegisterUseCase(authRepo)
export const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepo)

// Pets
export const createPetUseCase = new CreatePetUseCase(petRepo)
export const getShelterPetsUseCase = new GetShelterPetsUseCase(petRepo)
export const updatePetUseCase = new UpdatePetUseCase(petRepo)
export const deletePetUseCase = new DeletePetUseCase(petRepo)
export const getAvailablePetsUseCase = new GetAvailablePetsUseCase(petRepo)

// Adoption
export const createAdoptionRequestUseCase = new CreateAdoptionRequestUseCase(adoptionRepo)
export const acceptAdoptionRequestUseCase = new AcceptAdoptionRequestUseCase(adoptionRepo)
export const rejectAdoptionRequestUseCase = new RejectAdoptionRequestUseCase(adoptionRepo)
export const getAdoptionRequestsUseCase = new GetAdoptionRequestsUseCase(adoptionRepo)

// AI
export const sendAIMessageUseCase = new SendAIMessageUseCase(geminiDS)

// Shelters/Map
export const getNearbySheltersUseCase = new GetNearbySheltersUseCase(shelterRepo)
```

---

## 12. Módulo 2: CRUD de Mascotas

### Data Repository

```typescript
// src/data/repositories/SupabasePetRepository.ts
import { supabase } from '../supabase/client'
import { IPetRepository } from '../../domain/repositories/IPetRepository'
import { Pet } from '../../domain/entities/Pet'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

export class SupabasePetRepository implements IPetRepository {
  async getShelterPets(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, shelters(name)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Pet[]
  }

  async getAvailablePets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*, shelters(name, latitude, longitude)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Pet[]
  }

  async createPet(pet: Omit<Pet, 'id' | 'createdAt'>, photoUri?: string): Promise<Pet> {
    let mainPhotoUrl: string | undefined

    if (photoUri) {
      mainPhotoUrl = await this.uploadPhoto(photoUri, pet.shelterId)
    }

    const { data, error } = await supabase
      .from('pets')
      .insert({ ...pet, main_photo_url: mainPhotoUrl })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Pet
  }

  async updatePet(petId: string, updates: Partial<Pet>, newPhotoUri?: string): Promise<Pet> {
    let updateData: any = { ...updates }

    if (newPhotoUri) {
      // Obtener shelterId de la mascota actual
      const { data: existing } = await supabase.from('pets').select('shelter_id').eq('id', petId).single()
      updateData.main_photo_url = await this.uploadPhoto(newPhotoUri, existing!.shelter_id)
    }

    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', petId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Pet
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase.from('pets').delete().eq('id', petId)
    if (error) throw new Error(error.message)
  }

  private async uploadPhoto(uri: string, shelterId: string): Promise<string> {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
    const ext = uri.split('.').pop() ?? 'jpg'
    const filePath = `${shelterId}/${Date.now()}.${ext}`
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`

    const { error } = await supabase.storage
      .from('pets-images')
      .upload(filePath, decode(base64), { contentType, upsert: true })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('pets-images').getPublicUrl(filePath)
    return data.publicUrl
  }
}
```

### Screen: Crear/Editar Mascota

```typescript
// app/(shelter)/pets/create.tsx
import { useState } from 'react'
import { ScrollView, Alert, Image, Pressable } from 'react-native'
import { YStack, XStack, Text, Button, Input, Select, Sheet, Spinner } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import LottieView from 'lottie-react-native'
import { useRouter } from 'expo-router'
import { createPetUseCase } from '../../../src/di/container'
import { useAuthStore } from '../../../src/presentation/store/authStore'

export default function CreatePetScreen() {
  const router = useRouter()
  const { user, shelterId } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', species: 'dog', breed: '', size: 'medium',
    gender: 'male', description: '', ageYears: '0',
    isVaccinated: false, isSterilized: false, isDewormed: false,
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  const handleSubmit = async () => {
    if (!form.name || !shelterId) return Alert.alert('Error', 'Nombre es requerido')
    setLoading(true)
    try {
      await createPetUseCase.execute({
        shelterId,
        name: form.name,
        species: form.species as any,
        breed: form.breed,
        size: form.size as any,
        gender: form.gender as any,
        description: form.description,
        ageYears: parseInt(form.ageYears),
        isVaccinated: form.isVaccinated,
        isSterilized: form.isSterilized,
        isDewormed: form.isDewormed,
        status: 'available',
      }, photoUri ?? undefined)

      setSuccess(true)
      setTimeout(() => router.back(), 2000)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <LottieView
          source={require('../../../assets/lottie/success.json')}
          autoPlay loop={false}
          style={{ width: 200, height: 200 }}
        />
        <Text fontSize={18} fontWeight="bold" color="$color" mt="$4">
          ¡Mascota publicada! 🐾
        </Text>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        <Text fontSize={22} fontWeight="bold">Nueva Mascota</Text>

        {/* Foto */}
        <Pressable onPress={pickImage}>
          <YStack
            height={200} borderRadius={12}
            backgroundColor="$backgroundHover"
            alignItems="center" justifyContent="center"
            overflow="hidden"
          >
            {photoUri
              ? <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
              : <Text color="$colorMuted">📷 Toca para agregar foto</Text>
            }
          </YStack>
        </Pressable>

        <Input placeholder="Nombre de la mascota" value={form.name}
          onChangeText={v => setForm(p => ({ ...p, name: v }))} />
        <Input placeholder="Raza (opcional)" value={form.breed}
          onChangeText={v => setForm(p => ({ ...p, breed: v }))} />
        <Input placeholder="Descripción" value={form.description}
          onChangeText={v => setForm(p => ({ ...p, description: v }))}
          multiline numberOfLines={3} />

        {/* Selects de especie, tamaño, género van aquí con componente Select de Tamagui */}

        <Button
          onPress={handleSubmit}
          disabled={loading}
          backgroundColor="$primary"
          icon={loading ? <Spinner /> : undefined}
        >
          {loading ? 'Publicando...' : 'Publicar Mascota'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
```

---

## 13. Módulo 3: Chat con Gemini AI

```typescript
// src/data/datasources/GeminiDataSource.ts
export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export class GeminiDataSource {
  private readonly functionUrl = process.env.EXPO_PUBLIC_GEMINI_FUNCTION_URL!

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(this.functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) throw new Error('Error al conectar con el asistente')
    const data = await response.json()
    return data.reply
  }
}

// src/domain/usecases/ai/SendAIMessageUseCase.ts
import { GeminiDataSource, ChatMessage } from '../../data/datasources/GeminiDataSource'

export class SendAIMessageUseCase {
  constructor(private geminiDS: GeminiDataSource) {}

  async execute(messages: ChatMessage[], newMessage: string): Promise<string> {
    const allMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: newMessage },
    ]
    return this.geminiDS.sendMessage(allMessages)
  }
}
```

### Screen: AI Chat

```typescript
// app/(adopter)/ai-chat.tsx
import { useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Input, Button, Text } from 'tamagui'
import LottieView from 'lottie-react-native'
import { sendAIMessageUseCase } from '../../src/di/container'

interface Message { id: string; role: 'user' | 'assistant'; text: string }

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: '¡Hola! 🐾 Soy el asistente de PetAdopt. ¿Tienes dudas sobre el cuidado de tu futura mascota?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const flatRef = useRef<FlatList>(null)

  const send = async () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const reply = await sendAIMessageUseCase.execute(
        messages.map(m => ({ role: m.role, text: m.text })),
        input
      )
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { id: '999', role: 'assistant', text: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor="$background">
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <XStack justifyContent={item.role === 'user' ? 'flex-end' : 'flex-start'}>
              <YStack
                maxWidth="80%"
                backgroundColor={item.role === 'user' ? '$primary' : '$backgroundHover'}
                padding="$3" borderRadius={16}
                borderBottomRightRadius={item.role === 'user' ? 4 : 16}
                borderBottomLeftRadius={item.role === 'assistant' ? 4 : 16}
              >
                <Text color={item.role === 'user' ? 'white' : '$color'}>{item.text}</Text>
              </YStack>
            </XStack>
          )}
          ListFooterComponent={loading ? (
            <LottieView
              source={require('../../assets/lottie/loading.json')}
              autoPlay loop style={{ width: 60, height: 30, alignSelf: 'flex-start' }}
            />
          ) : null}
        />

        <XStack padding="$3" gap="$2" borderTopWidth={1} borderTopColor="$borderColor">
          <Input
            flex={1} placeholder="Pregunta sobre cuidados, salud..."
            value={input} onChangeText={setInput}
            onSubmitEditing={send}
          />
          <Button onPress={send} disabled={loading} backgroundColor="$primary">
            Enviar
          </Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
```

---

## 14. Módulo 4: Solicitudes de Adopción

### Data Repository

```typescript
// src/data/repositories/SupabaseAdoptionRepository.ts
import { supabase } from '../supabase/client'
import { AdoptionRequest } from '../../domain/entities/AdoptionRequest'

export class SupabaseAdoptionRepository {
  async createRequest(petId: string, adopterId: string, shelterId: string, message: string): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({ pet_id: petId, adopter_id: adopterId, shelter_id: shelterId, message })
      .select('*, pets(name, main_photo_url), profiles(full_name)')
      .single()

    if (error) throw new Error(error.message)
    return data as AdoptionRequest
  }

  async getRequestsByAdopter(adopterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url, species), shelters(name)')
      .eq('adopter_id', adopterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as AdoptionRequest[]
  }

  async getRequestsByShelter(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*, pets(name, main_photo_url), profiles!adopter_id(full_name, avatar_url, phone)')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as AdoptionRequest[]
  }

  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected',
    shelterResponse: string
  ): Promise<void> {
    const { error } = await supabase
      .from('adoption_requests')
      .update({ status, shelter_response: shelterResponse })
      .eq('id', requestId)

    if (error) throw new Error(error.message)

    // Si se acepta, cambiar el estado de la mascota a 'pending'
    if (status === 'accepted') {
      const { data: req } = await supabase
        .from('adoption_requests')
        .select('pet_id')
        .eq('id', requestId)
        .single()

      if (req) {
        await supabase.from('pets').update({ status: 'pending' }).eq('id', req.pet_id)
      }
    }
  }
}
```

### Screen: Solicitudes del Refugio

```typescript
// app/(shelter)/pets/[id]/adoption-requests.tsx
import { useEffect, useState } from 'react'
import { FlatList, Alert } from 'react-native'
import { YStack, XStack, Text, Button, Card, Avatar, Spinner } from 'tamagui'
import LottieView from 'lottie-react-native'
import { useLocalSearchParams } from 'expo-router'
import { getAdoptionRequestsUseCase, acceptAdoptionRequestUseCase, rejectAdoptionRequestUseCase } from '../../../../src/di/container'

export default function AdoptionRequestsScreen() {
  const { id: petId } = useLocalSearchParams()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      const data = await getAdoptionRequestsUseCase.executeByPet(petId as string)
      setRequests(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  const handleAccept = (requestId: string) => {
    Alert.alert('Aceptar solicitud', '¿Seguro que deseas aceptar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: async () => {
          await acceptAdoptionRequestUseCase.execute(requestId, '¡Felicitaciones! Tu solicitud ha sido aprobada.')
          loadRequests()
        }
      }
    ])
  }

  const handleReject = (requestId: string) => {
    Alert.alert('Rechazar solicitud', '¿Seguro que deseas rechazar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          await rejectAdoptionRequestUseCase.execute(requestId, 'Lamentablemente tu solicitud no fue aprobada en esta ocasión.')
          loadRequests()
        }
      }
    ])
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../../../assets/lottie/loading.json')} autoPlay loop style={{ width: 100, height: 100 }} />
      </YStack>
    )
  }

  if (requests.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        <LottieView source={require('../../../../assets/lottie/empty-pets.json')} autoPlay loop style={{ width: 180, height: 180 }} />
        <Text>No hay solicitudes aún</Text>
      </YStack>
    )
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Card padding="$4" borderRadius={12} elevate>
          <XStack gap="$3" alignItems="center">
            <Avatar circular size="$5">
              <Avatar.Image src={item.profiles?.avatar_url} />
              <Avatar.Fallback backgroundColor="$backgroundHover">
                <Text>{item.profiles?.full_name?.[0] ?? '?'}</Text>
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontWeight="bold">{item.profiles?.full_name}</Text>
              <Text fontSize={12} color="$colorMuted">{new Date(item.created_at).toLocaleDateString()}</Text>
            </YStack>
            <Text
              fontSize={12} fontWeight="bold"
              color={item.status === 'pending' ? '$yellow10' : item.status === 'accepted' ? '$green10' : '$red10'}
            >
              {item.status === 'pending' ? 'Pendiente' : item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
            </Text>
          </XStack>

          {item.message && (
            <Text mt="$2" color="$colorMuted" fontSize={14}>{item.message}</Text>
          )}

          {item.status === 'pending' && (
            <XStack gap="$2" mt="$3">
              <Button flex={1} backgroundColor="$green8" onPress={() => handleAccept(item.id)}>Aceptar</Button>
              <Button flex={1} backgroundColor="$red8" onPress={() => handleReject(item.id)}>Rechazar</Button>
            </XStack>
          )}
        </Card>
      )}
    />
  )
}
```

---

## 15. Módulo 5: Mapa con OpenStreetMap

```typescript
// src/data/repositories/SupabaseShelterRepository.ts
import { supabase } from '../supabase/client'

export class SupabaseShelterRepository {
  async getAllShelters() {
    const { data, error } = await supabase
      .from('shelters')
      .select('id, name, address, latitude, longitude, logo_url, phone')
      .not('latitude', 'is', null)

    if (error) throw new Error(error.message)
    return data
  }
}
```

```typescript
// app/(adopter)/map.tsx
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps'
import * as Location from 'expo-location'
import { YStack, Text, Spinner, Card } from 'tamagui'
import LottieView from 'lottie-react-native'
import { getNearbySheltersUseCase } from '../../src/di/container'

export default function MapScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [shelters, setShelters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado')
        setLoading(false)
        return
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })

      const data = await getNearbySheltersUseCase.execute()
      setShelters(data)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <LottieView source={require('../../assets/lottie/loading.json')} autoPlay loop style={{ width: 120, height: 120 }} />
        <Text mt="$2">Obteniendo ubicación...</Text>
      </YStack>
    )
  }

  if (error || !location) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>{error ?? 'No se pudo obtener la ubicación'}</Text>
      </YStack>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        mapType="none" // Usamos tiles de OSM
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Ubicación del usuario */}
        <Marker coordinate={location} title="Tu ubicación" pinColor="blue" />

        {/* Refugios */}
        {shelters.map(shelter => (
          <Marker
            key={shelter.id}
            coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
            title={shelter.name}
            pinColor="red"
          >
            <Callout>
              <YStack padding="$2" minWidth={150}>
                <Text fontWeight="bold">{shelter.name}</Text>
                <Text fontSize={12}>{shelter.address}</Text>
                {shelter.phone && <Text fontSize={12}>📞 {shelter.phone}</Text>}
              </YStack>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  )
}
```

---

## 16. UI: Tamagui

### ⚠️ Tamagui v2 (obligatorio para SDK 54 / RN 0.81)

Tamagui v1 **no es compatible** con React Native 0.81 (Expo SDK 54). Debes usar **Tamagui v2**, que aprovecha las nuevas capacidades de estilo de RN 0.81 (`boxShadow`, `filter`, etc.) y requiere New Architecture.

### Configuración

```typescript
// tamagui.config.ts  ← usa defaultConfig de v5, NO config de v3
import { defaultConfig } from '@tamagui/config/v5'
import { createTamagui } from 'tamagui'

export const tamaguiConfig = createTamagui(defaultConfig)

export default tamaguiConfig

export type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
```

```typescript
// app/_layout.tsx
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'
import { useColorScheme } from 'react-native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  // Cargar fuentes de Tamagui
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  if (!loaded) return null

  return (
    // ✅ Usar defaultTheme como prop, NO envolver en <Theme> antes del Provider
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  )
}
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@tamagui/babel-plugin', // sin opciones extra en v2
    ],
  }
}
```

```javascript
// metro.config.js — necesario para resolver módulos de Tamagui v2 correctamente
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Fix para Tamagui v2: evita que Metro cargue builds ESM web en lugar de native
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web') {
    const isTamagui =
      moduleName === 'tamagui' ||
      moduleName.startsWith('tamagui/') ||
      moduleName.startsWith('@tamagui/')
    if (isTamagui) {
      return context.resolveRequest(
        {
          ...context,
          unstable_conditionNames: ['react-native', 'require', 'default'],
        },
        moduleName,
        platform
      )
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
```

> 💡 **Primer inicio:** Siempre limpiar cache la primera vez:
> ```bash
> npx expo start -c
> ```

---

## 17. Animaciones: Lottie

Debes incluir **al menos 3 animaciones Lottie** en la app.

### Fuentes de archivos .json

- [LottieFiles](https://lottiefiles.com) — busca: "paw", "loading", "success", "empty", "pet"
- Descarga archivos `.json` y colócalos en `assets/lottie/`

### Componentes reutilizables

```typescript
// src/presentation/components/common/LottieLoader.tsx
import LottieView from 'lottie-react-native'
import { YStack, Text } from 'tamagui'

interface Props { message?: string }

export const LottieLoader = ({ message = 'Cargando...' }: Props) => (
  <YStack flex={1} alignItems="center" justifyContent="center">
    <LottieView
      source={require('../../../assets/lottie/loading.json')}
      autoPlay loop style={{ width: 120, height: 120 }}
    />
    <Text mt="$2" color="$colorMuted">{message}</Text>
  </YStack>
)

// src/presentation/components/common/LottieSuccess.tsx
import LottieView from 'lottie-react-native'
import { YStack, Text } from 'tamagui'

interface Props { message: string; onFinish?: () => void }

export const LottieSuccess = ({ message, onFinish }: Props) => (
  <YStack flex={1} alignItems="center" justifyContent="center">
    <LottieView
      source={require('../../../assets/lottie/success.json')}
      autoPlay loop={false}
      onAnimationFinish={onFinish}
      style={{ width: 180, height: 180 }}
    />
    <Text fontSize={18} fontWeight="bold" mt="$3">{message}</Text>
  </YStack>
)

// src/presentation/components/common/LottieSplash.tsx — Pantalla de bienvenida
import LottieView from 'lottie-react-native'
import { YStack, Text } from 'tamagui'

export const LottieSplash = () => (
  <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
    <LottieView
      source={require('../../../assets/lottie/paw-animation.json')}
      autoPlay loop style={{ width: 250, height: 250 }}
    />
    <Text fontSize={28} fontWeight="bold" color="$primary" mt="$4">PetAdopt 🐾</Text>
    <Text color="$colorMuted">Encuentra tu compañero perfecto</Text>
  </YStack>
)
```

### Uso mínimo requerido (3 animaciones)

| # | Animación | Dónde se usa |
|---|---|---|
| 1 | `loading.json` | Pantallas de carga de datos |
| 2 | `success.json` | Tras crear mascota / enviar solicitud / login exitoso |
| 3 | `empty-pets.json` | Cuando no hay mascotas / solicitudes que mostrar |
| 4 | `paw-animation.json` | Splash screen o header decorativo |

---

## 18. Notificaciones Push (Bonus +15pts)

```bash
npx expo install expo-notifications expo-device
```

```typescript
// src/data/datasources/NotificationsDataSource.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from '../supabase/client'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
  }),
})

export class NotificationsDataSource {
  async registerPushToken(userId: string): Promise<void> {
    if (!Device.isDevice) return

    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') return

    const tokenData = await Notifications.getExpoPushTokenAsync()
    const token = tokenData.data

    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId)
  }
}
```

Para enviar notificaciones al aceptar/rechazar una solicitud, crea otra **Edge Function** en Supabase que llame a la **Expo Push API**:

```typescript
// supabase/functions/send-push/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { token, title, body } = await req.json()

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: token, title, body, sound: 'default' })
  })

  return new Response('ok')
})
```

Llama a esta función desde el use case de `AcceptAdoptionRequestUseCase` tras actualizar el estado.

---

## 19. Chat en Tiempo Real (Bonus +15pts)

```typescript
// src/data/repositories/SupabaseChatRepository.ts
import { supabase } from '../supabase/client'

export class SupabaseChatRepository {
  async getMessages(requestId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data
  }

  async sendMessage(requestId: string, senderId: string, content: string) {
    const { error } = await supabase
      .from('chat_messages')
      .insert({ request_id: requestId, sender_id: senderId, content })

    if (error) throw new Error(error.message)
  }

  subscribeToMessages(requestId: string, callback: (msg: any) => void) {
    return supabase
      .channel(`chat:${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `request_id=eq.${requestId}`,
      }, payload => callback(payload.new))
      .subscribe()
  }
}
```

```typescript
// app/(adopter)/chat/[requestId].tsx
import { useEffect, useState, useRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { YStack, XStack, Input, Button, Text } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../src/data/supabase/client'
import { SupabaseChatRepository } from '../../../src/data/repositories/SupabaseChatRepository'
import { useAuthStore } from '../../../src/presentation/store/authStore'

const chatRepo = new SupabaseChatRepository()

export default function ChatScreen() {
  const { requestId } = useLocalSearchParams()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const flatRef = useRef<FlatList>(null)

  useEffect(() => {
    chatRepo.getMessages(requestId as string).then(setMessages)

    const subscription = chatRepo.subscribeToMessages(requestId as string, (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => { supabase.removeChannel(subscription) }
  }, [requestId])

  const send = async () => {
    if (!input.trim() || !user) return
    await chatRepo.sendMessage(requestId as string, user.id, input)
    setInput('')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <YStack flex={1}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd()}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id
            return (
              <XStack justifyContent={isMe ? 'flex-end' : 'flex-start'}>
                <YStack
                  maxWidth="75%" padding="$3" borderRadius={12}
                  backgroundColor={isMe ? '$primary' : '$backgroundHover'}
                  borderBottomRightRadius={isMe ? 2 : 12}
                  borderBottomLeftRadius={isMe ? 12 : 2}
                >
                  <Text color={isMe ? 'white' : '$color'}>{item.content}</Text>
                </YStack>
              </XStack>
            )
          }}
        />
        <XStack padding="$3" gap="$2" borderTopWidth={1} borderTopColor="$borderColor">
          <Input flex={1} value={input} onChangeText={setInput} placeholder="Escribe un mensaje..." />
          <Button onPress={send} backgroundColor="$primary">Enviar</Button>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
```

---

## 20. Checklist de Entrega

### Funcionalidades (100 pts)

- [ ] **Auth (25 pts)**
  - [ ] Registro con email/contraseña con confirmación de email
  - [ ] Login con email/contraseña
  - [ ] Login con Google
  - [ ] Reseteo de contraseña
  - [ ] Página web de confirmación de cuenta (Vercel/Railway/Render)
  - [ ] Página web de reseteo de contraseña (Vercel/Railway/Render)
  - [ ] Perfil de usuario con rol (adoptante / refugio)

- [ ] **CRUD Mascotas (25 pts)**
  - [ ] Crear mascota con foto (Supabase Storage)
  - [ ] Listar mascotas del refugio
  - [ ] Editar mascota
  - [ ] Eliminar mascota
  - [ ] Los adoptantes pueden ver todas las mascotas disponibles

- [ ] **Chat Gemini (15 pts)**
  - [ ] Edge Function como proxy
  - [ ] Contexto conversacional mantenido
  - [ ] Respuestas sobre cuidados/salud de mascotas

- [ ] **Solicitudes de Adopción (15 pts)**
  - [ ] Adoptante puede crear solicitud
  - [ ] Refugio ve solicitudes recibidas
  - [ ] Refugio puede aceptar solicitud
  - [ ] Refugio puede rechazar solicitud

- [ ] **Mapa (20 pts)**
  - [ ] Solicitar permiso de GPS
  - [ ] Mostrar ubicación del usuario
  - [ ] Mostrar todos los refugios con marcadores
  - [ ] OpenStreetMap como tiles base

### Bonus

- [ ] Notificaciones push en tiempo real (+15 pts)
- [ ] Chat en tiempo real refugio ↔ adoptante (+15 pts)
- [ ] UI 100% con librerías sin stylesheets (+5 pts)

### Sanciones a evitar

- [ ] ✅ Interfaz intuitiva, responsiva y moderna (evitar -6 pts)
- [ ] ✅ Al menos 3 animaciones Lottie (evitar -1 pt)
- [ ] ✅ Arquitectura Clean implementada (evitar -3 pts)
- [ ] ✅ App instalada en APK (evitar -10 pts)

### Entregables

- [ ] Repositorio en GitHub con README
- [ ] APK instalado en celular físico
- [ ] Demo en clase al docente

---

> 💡 **Recuerda:** El examen no solo evalúa que funcione, sino que puedas **explicar** cada archivo, función, el flujo de datos y la arquitectura. ¡Entiende cada línea de código que escribas!