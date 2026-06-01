import { createTamagui, createTokens, createFont } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { createAnimations } from '@tamagui/animations-react-native'

const animations = createAnimations({
  bouncy: { damping: 9, mass: 0.9, stiffness: 150 },
  lazy:   { damping: 18, stiffness: 50 },
  medium: { damping: 15, stiffness: 120, mass: 1 },
  slow:   { damping: 15, stiffness: 40 },
  quick:  { damping: 20, mass: 1.2, stiffness: 250 },
  '100ms': { type: 'timing', duration: 100 },
  '200ms': { type: 'timing', duration: 200 },
  '300ms': { type: 'timing', duration: 300 },
  fast:   { type: 'timing', duration: 150 },
})

const headingFont = createFont({
  family: 'System',
  size:   { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 28, 8: 32, 9: 40, 10: 48, true: 18 },
  lineHeight: { 1: 16, 2: 20, 3: 22, 4: 26, 5: 28, 6: 32, 7: 36, 8: 42, 9: 50, 10: 58, true: 26 },
  weight: { 1: '400', 6: '600', 7: '700', 8: '800', true: '700' },
  letterSpacing: { 5: 0, 6: -0.3, 7: -0.5, true: 0 },
})

const bodyFont = createFont({
  family: 'System',
  size:   { 1: 11, 2: 12, 3: 13, 4: 14, 5: 15, 6: 16, 7: 18, 8: 20, 9: 22, 10: 24, true: 15 },
  lineHeight: { 1: 15, 2: 17, 3: 18, 4: 20, 5: 22, 6: 24, 7: 26, 8: 28, 9: 30, 10: 32, true: 22 },
  weight: { 1: '400', 5: '500', 6: '600', true: '400' },
  letterSpacing: { true: 0 },
})

const tokens = createTokens({
  color: {
    coral:       '#FF6B6B',
    coralSoft:   '#FF8E8E',
    coralDeep:   '#E85555',
    amber:       '#FFB347',
    amberSoft:   '#FFD08A',
    cream:       '#FFF8F0',
    sand:        '#F5ECD7',
    sandDeep:    '#EAD9BB',
    bark:        '#8B6F47',
    chocolate:   '#3D2314',
    darkBg:      '#1C1008',
    darkSurface: '#2A1A0E',
    darkCard:    '#3D2A1A',
    darkBorder:  '#5C3D22',
    darkText:    '#F5EAD7',
    success:     '#4CAF82',
    warning:     '#FFB347',
    danger:      '#FF6B6B',
    info:        '#64B5F6',
    white:       '#FFFFFF',
    black:       '#000000',
    transparent: 'transparent',
  },
  radius: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16,
    5: 20, 6: 24, full: 999, true: 12,
  },
  size: {
    0: 0, '$0.25': 2, '$0.5': 4, '$0.75': 8,
    1: 20, '$1.5': 24, 2: 28, '$2.5': 32,
    3: 36, '$3.5': 40, 4: 44, '$4.5': 48,
    5: 52, 6: 64, 7: 74, 8: 84, 9: 94,
    10: 104, 11: 124, 12: 144, true: 44,
  },
  space: {
    0: 0, '$0.5': 1, 1: 4, '$1.5': 6, 2: 8,
    '$2.5': 10, 3: 12, '$3.5': 14, 4: 16,
    '$4.5': 18, 5: 20, 6: 24, 7: 28, 8: 32,
    9: 36, 10: 40, 11: 44, 12: 48, true: 16,
  },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
})

const config = createTamagui({
  animations,
  tokens,
  shorthands,
  themes: {
    light: {
      background:          '#FFF8F0',
      backgroundHover:     '#F5ECD7',
      backgroundPress:     '#EAD9BB',
      backgroundFocus:     '#F5ECD7',
      backgroundStrong:    '#FFFFFF',
      color:               '#3D2314',
      colorHover:          '#3D2314',
      colorPress:          '#8B6F47',
      colorFocus:          '#3D2314',
      colorTransparent:    'transparent',
      borderColor:         '#EAD9BB',
      borderColorHover:    '#D4B896',
      borderColorFocus:    '#FF6B6B',
      borderColorPress:    '#FF6B6B',
      shadowColor:         'rgba(61,35,20,0.08)',
      shadowColorHover:    'rgba(61,35,20,0.12)',
      shadowColorPress:    'rgba(61,35,20,0.12)',
      shadowColorFocus:    'rgba(61,35,20,0.12)',
      placeholderColor:    '#8B6F47',
    },
    dark: {
      background:          '#1C1008',
      backgroundHover:     '#2A1A0E',
      backgroundPress:     '#3D2A1A',
      backgroundFocus:     '#2A1A0E',
      backgroundStrong:    '#2A1A0E',
      color:               '#F5EAD7',
      colorHover:          '#FFD08A',
      colorPress:          '#A07850',
      colorFocus:          '#F5EAD7',
      colorTransparent:    'transparent',
      borderColor:         '#5C3D22',
      borderColorHover:    '#8B6030',
      borderColorFocus:    '#FF6B6B',
      borderColorPress:    '#FF6B6B',
      shadowColor:         'rgba(0,0,0,0.35)',
      shadowColorHover:    'rgba(0,0,0,0.45)',
      shadowColorPress:    'rgba(0,0,0,0.45)',
      shadowColorFocus:    'rgba(0,0,0,0.45)',
      placeholderColor:    '#A07850',
    },
  },
  fonts: {
    heading: headingFont,
    body:    bodyFont,
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1650 },
  },
  settings: {
    defaultFont:                 'body',
    fastSchemeChange:            true,
    shouldAddPrefersColorThemes: true,
    allowedStyleValues:          'somewhat-strict',
  },
})

export type AppConfig = typeof config
export default config