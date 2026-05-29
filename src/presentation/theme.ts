export const colors = {
  background: '#F5F7FA',
  primary: '#4A90E2',
  primarySoft: '#E8F0FE',
  secondary: '#6FCF97',
  secondarySoft: '#E6F7ED',
  text: '#4F4F4F',
  textLight: '#9CA3AF',
  card: '#FFFFFF',
  alert: '#FF8A80',
  alertSoft: '#FFE8E8',
  border: '#E8ECF0',
  white: '#FFFFFF',
  dark: '#2D3748',
  overlay: 'rgba(0,0,0,0.5)',
  warning: '#F5A623',
  warningSoft: '#FFF3E0',
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
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
}
