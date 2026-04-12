export const colors = {
  // Brand
  primary: '#1a3a5c',
  primaryLight: '#2a5298',
  primarySurface: '#e8f0fe',

  // Levels
  levelA1: '#4caf50',
  levelA2: '#8bc34a',
  levelB1: '#ff9800',
  levelB2: '#ff5722',
  levelC1: '#9c27b0',

  // Semantic
  success: '#2e7d32',
  successLight: '#e8f5e9',
  warning: '#f57c00',
  warningLight: '#fff3e0',
  error: '#c62828',
  errorLight: '#ffebee',
  info: '#1565c0',
  infoLight: '#e3f2fd',

  // Pass / Fail
  pass: '#2e7d32',
  fail: '#c62828',
  passLight: '#e8f5e9',
  failLight: '#ffebee',

  // Neutrals
  white: '#ffffff',
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceContainer: '#f0f4f8',
  surfaceContainerHigh: '#e4e8ec',
  border: '#e0e0e0',
  divider: '#f0f0f0',

  // Text
  textPrimary: '#1a1a2e',
  textSecondary: '#5f6368',
  textDisabled: '#9e9e9e',
  textOnPrimary: '#ffffff',
  textOnSuccess: '#ffffff',
  textOnError: '#ffffff',

  // Timer
  timerNormal: '#1a3a5c',
  timerWarning: '#f57c00',

  // Streaks / gamification
  streakFire: '#ff6d00',
  streakText: '#e65100',
  streakBackground: '#fff3e0',

  // Score readiness stages
  readinessBuilding: '#78909c',
  readinessDeveloping: '#1565c0',
  readinessAlmost: '#f57c00',
  readinessReady: '#2e7d32',
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
    '4xl': 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const MIN_TOUCH_TARGET = 44;

export const LEVEL_CONFIG = {
  A1: {
    color: colors.levelA1,
    label: 'Start Deutsch 1',
    targetHours: 20,
    passThreshold: 0.6,
  },
  A2: {
    color: colors.levelA2,
    label: 'Start Deutsch 2',
    targetHours: 30,
    passThreshold: 0.6,
  },
  B1: {
    color: colors.levelB1,
    label: 'Zertifikat Deutsch',
    targetHours: 40,
    passThreshold: 0.6,
  },
  B2: {
    color: colors.levelB2,
    label: 'telc Deutsch B2',
    targetHours: 50,
    passThreshold: 0.6,
  },
  C1: {
    color: colors.levelC1,
    label: 'telc Deutsch C1 Hochschule',
    targetHours: 60,
    passThreshold: 0.6,
  },
} as const;
