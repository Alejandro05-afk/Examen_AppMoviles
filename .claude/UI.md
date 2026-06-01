---
name: petadopt-ui-ux
description: >
  Skill para mejorar la UI y UX de la app PetAdopt (Expo + React Native).
  Úsala siempre que el usuario pida mejorar pantallas, componentes, o la apariencia
  visual de la app PetAdopt. Cubre migración de StyleSheet a Tamagui, animaciones
  con Lottie, temática "Pet Match" (tonos cálidos coral/naranja + crema/beige),
  y la web en Vercel (Next.js puro, sin Tamagui/Lottie).
  Aplica cuando el usuario mencione: "mejorar UI", "pantalla de login", "home de adopter",
  "dashboard de shelter", "animaciones", "Tamagui", "tema mascota", "web-auth",
  o cualquier componente de PetAdopt que necesite rediseño visual.
---

# PetAdopt UI/UX Skill

## Contexto del Proyecto

App móvil de adopción de mascotas. Stack:
- **Expo Router v3** + React Native (New Architecture habilitada)
- **Tamagui** — sistema de diseño y componentes (migración desde StyleSheet.create)
- **Lottie** — animaciones (mínimo 3 por pantalla donde aplique)
- **Supabase** — backend (NO tocar lógica)
- **Clean Architecture** — src/domain, src/data, src/presentation (NO tocar)
- **Zustand** — stores (NO tocar)
- **web-auth/** — Next.js desplegado en Vercel (CSS puro + Tailwind, sin Tamagui)

## ⚠️ Reglas Críticas

1. **NUNCA modificar** archivos en `src/domain/`, `src/data/`, `src/di/`, `src/presentation/hooks/`, `src/presentation/store/`
2. **NUNCA eliminar** funcionalidades existentes (adopción, chat, mapa, AI, notificaciones, auth)
3. Solo tocar: archivos en `app/`, `src/presentation/components/`, `src/presentation/theme.ts`, `web-auth/`
4. Mantener toda la lógica de handlers, hooks y llamadas a repositorios intacta
5. Al migrar a Tamagui: preservar exactamente los mismos props y callbacks de cada componente

---

## Temática Visual: "Pet Match Warm"

Inspirada en apps de adopción con estética cálida, amorosa y accesible. Ver detalles completos en `references/theme.md`.

### Paleta principal
```ts
export const petColors = {
  // Primarios
  coral:       '#FF6B6B',   // acción principal, CTAs
  coralSoft:   '#FF8E8E',   // hover/pressed state
  coralDeep:   '#E85555',   // active/destructive
  
  // Secundarios
  amber:       '#FFB347',   // highlights, badges "Nuevo"
  amberSoft:   '#FFD08A',   // backgrounds suaves
  
  // Neutros cálidos
  cream:       '#FFF8F0',   // background principal (light)
  sand:        '#F5ECD7',   // surface/cards (light)
  bark:        '#8B6F47',   // texto secundario
  chocolate:   '#3D2314',   // texto principal
  
  // Modo oscuro
  darkBg:      '#1C1008',
  darkSurface: '#2A1A0E',
  darkCard:    '#3D2A1A',
  darkBorder:  '#5C3D22',
  
  // Estado
  success:     '#4CAF82',
  warning:     '#FFB347',
  danger:      '#FF6B6B',
  info:        '#64B5F6',
  
  // Texto
  textPrimary: '#3D2314',
  textMuted:   '#8B6F47',
  textLight:   '#FFF8F0',
}
```

### Modo oscuro/claro
La app usa `useColorScheme` de React Native. Tamagui maneja el tema automáticamente con `light` y `dark` tokens.

---

## Tamagui: Setup y Uso

### Instalación (indicar al usuario)
```bash
npx expo install tamagui @tamagui/core @tamagui/config @tamagui/animations-react-native
npx expo install @tamagui/babel-plugin
```

Agregar al `babel.config.js`:
```js
plugins: [
  ['@tamagui/babel-plugin', {
    components: ['tamagui'],
    config: './tamagui.config.ts',
    logTimings: true,
  }]
]
```

Ver `references/tamagui-setup.md` para la configuración completa del `tamagui.config.ts`.

### Componentes Tamagui más usados en PetAdopt
```tsx
import {
  YStack, XStack, Stack,   // layouts
  Text, H1, H2, H3,        // tipografía
  Button,                  // botones
  Input,                   // inputs
  Card,                    // tarjetas
  Image,                   // imágenes
  ScrollView,              // scroll
  Sheet,                   // bottom sheets
  Avatar,                  // avatares
  Badge,                   // etiquetas
  Separator,               // divisores
  useTheme,                // acceso a tokens
} from 'tamagui'
```

### Patrón de migración StyleSheet → Tamagui
```tsx
// ANTES (StyleSheet)
<View style={styles.container}>
  <Text style={styles.title}>Hola</Text>
  <TouchableOpacity style={styles.btn} onPress={onPress}>
    <Text style={styles.btnText}>Adoptar</Text>
  </TouchableOpacity>
</View>

// DESPUÉS (Tamagui) — misma lógica, diferente UI
<YStack flex={1} backgroundColor="$cream" padding="$4">
  <H2 color="$chocolate" fontFamily="$heading">Hola</H2>
  <Button
    backgroundColor="$coral"
    color="white"
    borderRadius="$full"
    onPress={onPress}   // ← misma función, intacta
    pressStyle={{ backgroundColor: '$coralDeep' }}
  >
    Adoptar
  </Button>
</YStack>
```

---

## Lottie: Animaciones Requeridas (mínimo 3)

### Archivos disponibles en `assets/lottie/`
- `loading.json` — carga de datos
- `paw-animation.json` — pata de animal (usar en splash, éxito, vacío)
- `empty-pets.json` — estado vacío de lista
- `success.json` — confirmación de acción
- `splash.json` — pantalla de inicio

### Cuándo usar cada uno
| Situación | Lottie a usar |
|-----------|--------------|
| Cargando mascotas / solicitudes | `loading.json` |
| Lista vacía de mascotas | `empty-pets.json` |
| Solicitud de adopción enviada | `success.json` |
| Splash screen | `splash.json` |
| Confirmación de chat iniciado | `paw-animation.json` |
| Éxito en formulario | `success.json` |

### Uso con LottieLoader existente
```tsx
// El componente ya existe en src/presentation/components/common/
import { LottieLoader } from '@/src/presentation/components/common/LottieLoader'
import { LottieSuccess } from '@/src/presentation/components/common/LottieSuccess'

// Para empty state
<LottieLoader /> // cuando isLoading
// Para éxito
<LottieSuccess /> // cuando operación completada
```

Para animaciones nuevas inline:
```tsx
import LottieView from 'lottie-react-native'

<LottieView
  source={require('@/assets/lottie/paw-animation.json')}
  autoPlay
  loop={false}
  style={{ width: 120, height: 120 }}
  speed={1.2}
/>
```

---

## Pantallas y Componentes a Mejorar

Lee `references/screens.md` para el detalle de cada pantalla. Resumen:

| Archivo | Mejoras clave |
|---------|--------------|
| `app/(auth)/login.tsx` | Ilustración Lottie arriba, inputs Tamagui, botón coral |
| `app/(auth)/register.tsx` | Mismo estilo que login, stepper visual |
| `app/(adopter)/home.tsx` | Cards con imagen hero, FlatList animada |
| `app/(adopter)/pet/[id].tsx` | Imagen hero full-width, Sheet para adoptar |
| `app/(adopter)/my-requests.tsx` | Timeline de estado, Lottie empty state |
| `app/(adopter)/ai-chat.tsx` | Burbujas de chat estilizadas, avatar IA |
| `app/(shelter)/dashboard.tsx` | Stat cards en grid, Lottie en métricas vacías |
| `app/(shelter)/pets/index.tsx` | Grid de mascotas, FAB coral para añadir |
| `src/presentation/components/pets/PetCard.tsx` | Card con imagen, badge especie, corazón |
| `web-auth/pages/` | Estética web consistente con la app |

---

## Web Auth (Vercel) — sin Tamagui

Para `web-auth/`, usar solo CSS/Tailwind. Ver `references/web-theme.md` para clases y estilos exactos que replican la temática "Pet Match Warm" en web.

Paleta web (CSS variables en `global.css`):
```css
:root {
  --coral: #FF6B6B;
  --amber: #FFB347;
  --cream: #FFF8F0;
  --sand: #F5ECD7;
  --chocolate: #3D2314;
  --bark: #8B6F47;
}
```

---

## Flujo de Trabajo al Mejorar una Pantalla

1. Leer el archivo original completo
2. Identificar: handlers, hooks, lógica de negocio → **preservar intactos**
3. Reemplazar solo: Views → YStack/XStack, TouchableOpacity → Button Tamagui, Text → Text/H2 Tamagui, StyleSheet → tokens Tamagui
4. Agregar Lottie donde corresponda (empty state, loading, success)
5. Aplicar colores de `petColors` / tokens Tamagui
6. Verificar que todos los `onPress`, `useAdoption()`, `usePets()`, etc. sigan llamándose igual

## Referencias adicionales

- `references/theme.md` — tokens Tamagui completos, tipografía, espaciado
- `references/tamagui-setup.md` — configuración completa de tamagui.config.ts
- `references/screens.md` — especificaciones detalladas por pantalla
- `references/web-theme.md` — estilos CSS/Tailwind para web-auth en Vercel