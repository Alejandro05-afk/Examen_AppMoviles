export const petColors = {
  coral: '#FF6B6B',
  coralSoft: '#FF8E8E',
  coralDeep: '#E85555',
  amber: '#FFB347',
  amberSoft: '#FFD08A',
  cream: '#FFF8F0',
  sand: '#F5ECD7',
  bark: '#8B6F47',
  chocolate: '#3D2314',
  darkBg: '#1C1008',
  darkSurface: '#2A1A0E',
  darkCard: '#3D2A1A',
  darkBorder: '#5C3D22',
  success: '#4CAF82',
  warning: '#FFB347',
  danger: '#FF6B6B',
  info: '#64B5F6',
  textPrimary: '#3D2314',
  textMuted: '#8B6F47',
  textLight: '#FFF8F0',
}

export const colors = {
  ...petColors,
  white: '#FFFFFF',
  background: '#FFF8F0',
  primary: '#FF6B6B',
  primarySoft: '#FFD08A',
  secondary: '#FFB347',
  secondarySoft: '#FFF3E0',
  text: '#3D2314',
  textLight: '#8B6F47',
  card: '#FFFFFF',
  alert: '#FF6B6B',
  alertSoft: '#FFE8E8',
  border: '#E8ECF0',
  dark: '#1C1008',
  overlay: 'rgba(0,0,0,0.5)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
}

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
}

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
}

export const safeArea = {
  paddingTop: 52,
  paddingBottom: 20,
}

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
}
