/**
 * Fastrack Deutsch — Design Tokens
 *
 * Authoritative source per `.planning/design-system/tokens.md` (2026-04-20).
 * Web consumes these via CSS variables declared in `apps/web/src/app/globals.css`;
 * React Native (mobile) imports the flat named exports directly.
 *
 * Structure:
 *   - `colors`: structured palette (brand, neutral, level, semantic, text, surface, border)
 *   - Flat legacy exports (primary, levelA1, textPrimary, …) point at the new values
 *     so the mobile app keeps compiling unchanged. Do not remove until mobile is
 *     migrated off `@fastrack/config` flat names.
 */

/* Brand — Ink Navy scale (identity color) */
const brand = {
  50: '#eef2f8',
  100: '#d5e0ef',
  200: '#a8bfdf',
  300: '#7099c8',
  400: '#3d72b0',
  500: '#1e5599',
  600: '#1a3a5c',
  700: '#152e4a',
  800: '#0e2038',
  900: '#081527',
  950: '#040c18',
} as const;

/* Neutral — pure greyscale, no blue/purple cast */
const neutral = {
  0: '#ffffff',
  50: '#f7f7f8',
  100: '#f0f0f1',
  150: '#e8e8ea',
  200: '#d9d9db',
  300: '#c0c0c3',
  400: '#9a9a9e',
  500: '#6b6b70',
  600: '#48484e',
  700: '#2e2e34',
  800: '#1c1c21',
  900: '#101013',
  950: '#08080a',
} as const;

/* CEFR level colors — WCAG AA passing with white text on solid */
const level = {
  a1: { solid: '#2d8a4e', surface: '#eaf7ef', text: '#1a5c34' },
  a2: { solid: '#5e8a1a', surface: '#f1f7e6', text: '#3d5c10' },
  b1: { solid: '#b86200', surface: '#fff4e6', text: '#7a4200' },
  b2: { solid: '#c0390b', surface: '#fdeee9', text: '#8a2608' },
  c1: { solid: '#6b2fa0', surface: '#f3ecfa', text: '#4a1f70' },
} as const;

/* Semantic tokens — what components should consume */
const semantic = {
  success: '#1e6e36',
  successSurface: '#eaf7ef',
  warning: '#9a5200',
  warningSurface: '#fff4e6',
  error: '#b91c1c',
  errorSurface: '#fdecea',
  info: brand[500],
  infoSurface: brand[50],

  pass: '#1e6e36',
  passSurface: '#eaf7ef',
  fail: '#b91c1c',
  failSurface: '#fdecea',

  /* Timer never turns red — warning amber is the max alarm state. */
  timerDefault: brand[600],
  timerWarning: '#9a5200',
  timerWarningSurface: '#fff4e6',

  /* Streak — calendar-grid treatment in brand tint, no fire imagery. */
  streak: brand[500],
  streakSurface: brand[50],

  readinessBuilding: neutral[400],
  readinessDeveloping: brand[500],
  readinessAlmost: '#9a5200',
  readinessReady: '#1e6e36',
} as const;

const text = {
  primary: neutral[700],
  secondary: neutral[500],
  tertiary: neutral[400],
  disabled: neutral[400],
  onBrand: neutral[0],
  onLevel: neutral[0],
} as const;

const surfaces = {
  background: neutral[50],
  surface: neutral[0],
  surfaceRaised: neutral[0],
  surfaceContainer: neutral[100],
  surfaceContainerHi: neutral[150],
} as const;

const borders = {
  default: neutral[200],
  hover: neutral[300],
  focus: brand[500],
} as const;

export const colors = {
  brand,
  neutral,
  level,
  semantic,
  text,
  surfaces,
  borders,

  /* ------------------------------------------------------------------ */
  /* Legacy flat exports — kept for mobile app backward compatibility.  */
  /* These map onto the structured palette above; do not re-add new     */
  /* call sites against these names in new code.                        */
  /* ------------------------------------------------------------------ */

  primary: brand[600],
  primaryLight: brand[500],
  primarySurface: brand[50],

  levelA1: level.a1.solid,
  levelA2: level.a2.solid,
  levelB1: level.b1.solid,
  levelB2: level.b2.solid,
  levelC1: level.c1.solid,

  success: semantic.success,
  successLight: semantic.successSurface,
  warning: semantic.warning,
  warningLight: semantic.warningSurface,
  error: semantic.error,
  errorLight: semantic.errorSurface,
  info: semantic.info,
  infoLight: semantic.infoSurface,

  pass: semantic.pass,
  fail: semantic.fail,
  passLight: semantic.passSurface,
  failLight: semantic.failSurface,

  white: neutral[0],
  background: surfaces.background,
  surface: surfaces.surface,
  surfaceContainer: surfaces.surfaceContainer,
  surfaceContainerHigh: surfaces.surfaceContainerHi,
  border: borders.default,
  divider: neutral[100],

  textPrimary: text.primary,
  textSecondary: text.secondary,
  textDisabled: text.disabled,
  textOnPrimary: text.onBrand,
  textOnSuccess: neutral[0],
  textOnError: neutral[0],

  timerNormal: semantic.timerDefault,
  timerWarning: semantic.timerWarning,

  /** @deprecated Fire-emoji streak was replaced with a calm calendar-grid treatment in brand tint. Kept only for mobile backward compat; remove after mobile migration. */
  streakFire: semantic.streak,
  /** @deprecated See `streakFire`. */
  streakText: brand[700],
  /** @deprecated See `streakFire`. */
  streakBackground: semantic.streakSurface,

  readinessBuilding: semantic.readinessBuilding,
  readinessDeveloping: semantic.readinessDeveloping,
  readinessAlmost: semantic.readinessAlmost,
  readinessReady: semantic.readinessReady,
} as const;

export const typography = {
  fontFamily: {
    regular: 'var(--font-sans)',
    medium: 'var(--font-sans)',
    bold: 'var(--font-sans)',
    display: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  /* Web sizes in px per tokens.md. Legacy numeric keys retained for mobile
   * StyleSheet usages; they are due for reconciliation in a mobile-scoped
   * follow-up (out of Phase 1 scope). */
  fontSize: {
    display: 36,
    h1: 30,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySm: 14,
    caption: 12,
    mono: 14,
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
    display: 1.15,
    h1: 1.2,
    h2: 1.25,
    h3: 1.3,
    h4: 1.35,
    body: 1.55,
    bodySm: 1.5,
    caption: 1.4,
    mono: 1.0,
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    display: '-0.02em',
    h1: '-0.01em',
    h2: '-0.01em',
    h3: '0',
    h4: '0',
    body: '0',
    bodySm: '0',
    caption: '0.01em',
    mono: '0',
  },
} as const;

export const spacing = {
  '2xs': 2,
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
  '6xl': 80,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/* React Native-style shadow objects (consumed by mobile). */
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

/* Web box-shadow strings. Consumed by Tailwind class map and inline styles. */
export const shadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 2px 8px 0 rgb(0 0 0 / 0.07), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
  lg: '0 4px 16px 0 rgb(0 0 0 / 0.08), 0 2px 4px 0 rgb(0 0 0 / 0.04)',
  xl: '0 8px 32px 0 rgb(0 0 0 / 0.10), 0 4px 8px 0 rgb(0 0 0 / 0.05)',
} as const;

/* Motion tokens — durations in milliseconds. */
export const duration = {
  instant: 0,
  fast: 120,
  base: 200,
  moderate: 300,
  slow: 500,
  deliberate: 800,
} as const;

export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const MIN_TOUCH_TARGET = 44;

export const LEVEL_CONFIG = {
  A1: {
    color: colors.level.a1.solid,
    surface: colors.level.a1.surface,
    textColor: colors.level.a1.text,
    label: 'Start Deutsch 1',
    targetHours: 20,
    passThreshold: 0.6,
  },
  A2: {
    color: colors.level.a2.solid,
    surface: colors.level.a2.surface,
    textColor: colors.level.a2.text,
    label: 'Start Deutsch 2',
    targetHours: 30,
    passThreshold: 0.6,
  },
  B1: {
    color: colors.level.b1.solid,
    surface: colors.level.b1.surface,
    textColor: colors.level.b1.text,
    label: 'Zertifikat Deutsch',
    targetHours: 40,
    passThreshold: 0.6,
  },
  B2: {
    color: colors.level.b2.solid,
    surface: colors.level.b2.surface,
    textColor: colors.level.b2.text,
    label: 'telc Deutsch B2',
    targetHours: 50,
    passThreshold: 0.6,
  },
  C1: {
    color: colors.level.c1.solid,
    surface: colors.level.c1.surface,
    textColor: colors.level.c1.text,
    label: 'telc Deutsch C1 Hochschule',
    targetHours: 60,
    passThreshold: 0.6,
  },
} as const;
