// Design tokens for telc-fasttrack
// PRIMARY SOURCE OF TRUTH for colors and typography.
// Never use raw hex values anywhere else in the codebase.

export const colors = {
  // Brand
  primary: '#1a3a5c',          // Deep navy — telc authority
  primaryLight: '#2a5298',     // Medium blue — interactive elements
  primarySurface: '#e8f0fe',   // Light blue surface

  // Levels
  levelA1: '#4caf50',          // Green — beginner
  levelA2: '#8bc34a',          // Light green
  levelB1: '#ff9800',          // Orange — intermediate
  levelB2: '#ff5722',          // Deep orange
  levelC1: '#9c27b0',          // Purple — advanced

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

  // Timer (neutral — never red to avoid exam anxiety)
  timerNormal: '#1a3a5c',
  timerWarning: '#f57c00',     // Under 5 minutes remaining

  // Streaks / gamification
  streakFire: '#ff6d00',
  streakText: '#e65100',
  streakBackground: '#fff3e0',

  // Score readiness stages
  readinessBuilding: '#78909c',     // "Building foundation"
  readinessDeveloping: '#1565c0',   // "Developing skills"
  readinessAlmost: '#f57c00',       // "Nearly ready"
  readinessReady: '#2e7d32',        // "Exam ready"
} as const;

export const typography = {
  // Font families — system fonts for now; replace with custom font if added to assets/fonts
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Scale
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

// Minimum touch target — 44pt per HIG / Material Design
export const MIN_TOUCH_TARGET = 44;

// Telc exam level display config
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
