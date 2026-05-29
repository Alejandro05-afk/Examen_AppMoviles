---
name: expo-mobile-ui
description: >
  Genera interfaces móviles atractivas y production-ready para Expo Go / React Native.
  Usa esta skill siempre que el usuario pida pantallas, componentes, layouts, dashboards,
  onboarding, login, tarjetas, listas, navegación o cualquier UI para una app móvil con
  Expo, React Native, NativeWind, o StyleSheet. También aplica cuando el usuario diga
  "hazlo para móvil", "pantalla de inicio", "diseño de app", "componente nativo" o similar.
---

# Expo Mobile UI Skill

Genera código React Native / Expo Go limpio, atractivo y listo para correr con `npx expo start`.

---

## Principios de diseño

Antes de escribir código, define:

- **Propósito**: ¿Qué problema resuelve esta pantalla? ¿Qué acción principal debe ejecutar el usuario?
- **Tono visual**: Elige una dirección clara. Ejemplos: oscuro/premium, minimalista/blanco, colorido/energético, suave/pastel. Comprométete con una sola.
- **Jerarquía**: Qué es lo más importante visualmente en pantalla. El ojo del usuario debe ir ahí primero.

**CRÍTICO**: Nunca produzcas UI genérica. Cada pantalla debe tener un punto de vista visual claro.

---

## Stack y dependencias

### Core (ya incluido en Expo Go — sin instalación)
```
react-native          → View, Text, ScrollView, TouchableOpacity, FlatList, Image, etc.
expo-status-bar       → StatusBar
expo-linear-gradient  → LinearGradient (gradientes)
@expo/vector-icons    → Ionicons, MaterialIcons, Feather, FontAwesome5, etc.
```

### Opcional recomendado (instalar si el usuario no los tiene)
```bash
npx expo install react-native-safe-area-context react-native-screens
npm install nativewind tailwindcss          # si se usa NativeWind
npm install @shopify/restyle                # sistema de temas tipado
```

Siempre indica al usuario qué debe instalar si el código lo requiere.

---

## Íconos disponibles (sin instalación)

`@expo/vector-icons` ya viene en Expo Go. Úsalos así:

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

<Ionicons name="home-outline" size={24} color="#fff" />
<Feather name="arrow-right" size={20} color="#000" />
<MaterialIcons name="dashboard" size={28} color="#6C63FF" />
```

Nombres comunes de Ionicons: `home-outline`, `person-outline`, `settings-outline`,
`search-outline`, `notifications-outline`, `heart-outline`, `star-outline`,
`arrow-back`, `chevron-forward`, `add-circle-outline`, `log-out-outline`,
`moon-outline`, `sunny-outline`, `camera-outline`, `image-outline`.

---

## Sistema de estilos

### Paleta base recomendada (oscuro/premium)
```ts
const colors = {
  bg:        '#0D0D0D',
  surface:   '#1A1A1A',
  card:      '#222222',
  border:    '#2E2E2E',
  accent:    '#7C6FFF',   // morado/violeta — color principal
  accentSoft:'#3D3580',
  text:      '#F5F5F5',
  muted:     '#888888',
  success:   '#4CAF50',
  warning:   '#FF9800',
  danger:    '#F44336',
};
```

### Alternativa claro/minimalista
```ts
const colors = {
  bg:        '#FAFAFA',
  surface:   '#FFFFFF',
  card:      '#F2F2F2',
  border:    '#E5E5E5',
  accent:    '#5B4FE8',
  text:      '#111111',
  muted:     '#777777',
};
```

### Tipografía (System Fonts — sin instalación)
```ts
const typography = {
  h1:    { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:    { fontSize: 22, fontWeight: '600' as const },
  h3:    { fontSize: 18, fontWeight: '600' as const },
  body:  { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};
```

### Espaciado y radios
```ts
const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const radius  = { sm: 8, md: 12, lg: 20, full: 999 };
```

---

## Componentes reutilizables

### Card base
```tsx
<View style={{
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
}}>
  {children}
</View>
```

### Botón primario
```tsx
<TouchableOpacity
  activeOpacity={0.8}
  style={{
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  }}
>
  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
    Continuar
  </Text>
</TouchableOpacity>
```

### Botón secundario / outline
```tsx
<TouchableOpacity
  activeOpacity={0.8}
  style={{
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  }}
>
  <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '600' }}>
    Cancelar
  </Text>
</TouchableOpacity>
```

### Input
```tsx
<View style={{
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: spacing.md,
  height: 52,
}}>
  <Feather name="mail" size={18} color={colors.muted} />
  <TextInput
    placeholder="tu@email.com"
    placeholderTextColor={colors.muted}
    style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 15 }}
  />
</View>
```

### Avatar / iniciales
```tsx
<View style={{
  width: 44, height: 44,
  borderRadius: 22,
  backgroundColor: colors.accentSoft,
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 15 }}>MR</Text>
</View>
```

### Badge / etiqueta
```tsx
<View style={{
  backgroundColor: colors.accentSoft,
  borderRadius: radius.full,
  paddingHorizontal: 10,
  paddingVertical: 3,
}}>
  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Nuevo</Text>
</View>
```

### Tab bar inferior (manual, sin librería)
```tsx
const tabs = [
  { icon: 'home-outline',         label: 'Inicio'  },
  { icon: 'search-outline',       label: 'Buscar'  },
  { icon: 'notifications-outline',label: 'Alertas' },
  { icon: 'person-outline',       label: 'Perfil'  },
];

<View style={{
  flexDirection: 'row',
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  paddingBottom: 24, // safe area manual
  paddingTop: 10,
}}>
  {tabs.map((t, i) => (
    <TouchableOpacity key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={t.icon as any} size={22} color={active === i ? colors.accent : colors.muted} />
      <Text style={{ fontSize: 10, color: active === i ? colors.accent : colors.muted }}>{t.label}</Text>
    </TouchableOpacity>
  ))}
</View>
```

---

## Estructura de pantalla completa

```tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Buen día,</Text>
          <Text style={styles.name}>María García</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn}>
          <Ionicons name="person-outline" size={20} color="#F5F5F5" />
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ... componentes aquí */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0D0D0D' },
  header:     { flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center', paddingHorizontal: 20,
                paddingTop: 56, paddingBottom: 16 },
  greeting:   { color: '#888', fontSize: 14 },
  name:       { color: '#F5F5F5', fontSize: 22, fontWeight: '700' },
  avatarBtn:  { width: 40, height: 40, borderRadius: 20,
                backgroundColor: '#222', alignItems: 'center',
                justifyContent: 'center', borderWidth: 1, borderColor: '#2E2E2E' },
  content:    { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
});
```

---

## Reglas obligatorias

1. **Un archivo por pantalla** — todo el código (estilos incluidos) en un solo `.tsx`.
2. **StyleSheet.create()** siempre — nunca objetos de estilo inline para estilos repetidos.
3. **Nada de `position: 'absolute'` a menos que sea imprescindible** (overlay, FAB).
4. **ScrollView** en pantallas con contenido largo; **FlatList** si hay listas dinámicas.
5. **TouchableOpacity** con `activeOpacity={0.8}` para todos los botones.
6. **Safe area manual**: `paddingTop: 48–56` en el header; `paddingBottom: 24` en la tab bar.
   Usar `react-native-safe-area-context` si está disponible, sino padding manual.
7. **Nunca uses colores hardcoded dispersos** — define el objeto `colors` arriba y referencíalo.
8. **Indica al usuario** si necesita instalar algo con `npx expo install` o `npm install`.

---

## Patrones de pantalla comunes

| Pantalla        | Componentes clave                                           |
|-----------------|-------------------------------------------------------------|
| Login/Registro  | Logo, inputs con ícono, botón primario, link secundario     |
| Home/Dashboard  | Header con saludo, stat cards en grid 2×2, lista de items   |
| Perfil          | Avatar grande, stats horizontales, lista de ajustes         |
| Detalle         | Imagen hero, info superpuesta, botón de acción sticky abajo |
| Onboarding      | Ilustración centrada, título, subtítulo, dots, botón        |
| Lista/Feed      | FlatList con cards, pull-to-refresh, empty state            |
| Settings        | Secciones con filas, toggle switches, íconos de fila        |

---

## Checklists antes de entregar

- [ ] ¿Corre en Expo Go sin errores? (sin dependencias nativas no compatibles)
- [ ] ¿Los colores tienen contraste suficiente (texto sobre fondo)?
- [ ] ¿Hay un estado vacío o de carga si hay datos dinámicos?
- [ ] ¿Los tap targets miden al menos 44×44 puntos?
- [ ] ¿El código es un solo archivo autocontenido?
- [ ] ¿Se indicaron las instalaciones necesarias?