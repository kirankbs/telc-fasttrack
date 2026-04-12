import { colors, spacing, borderRadius } from './theme';

export const tailwindTokens = {
  colors: {
    brand: {
      primary: colors.primary,
      'primary-light': colors.primaryLight,
      'primary-surface': colors.primarySurface,
    },
    level: {
      a1: colors.levelA1,
      a2: colors.levelA2,
      b1: colors.levelB1,
      b2: colors.levelB2,
      c1: colors.levelC1,
    },
    semantic: {
      success: colors.success,
      'success-light': colors.successLight,
      warning: colors.warning,
      'warning-light': colors.warningLight,
      error: colors.error,
      'error-light': colors.errorLight,
      info: colors.info,
      'info-light': colors.infoLight,
    },
    exam: {
      pass: colors.pass,
      fail: colors.fail,
      'pass-light': colors.passLight,
      'fail-light': colors.failLight,
    },
    neutral: {
      background: colors.background,
      surface: colors.surface,
      'surface-container': colors.surfaceContainer,
      'surface-container-high': colors.surfaceContainerHigh,
      border: colors.border,
      divider: colors.divider,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
      'on-primary': colors.textOnPrimary,
    },
    timer: {
      normal: colors.timerNormal,
      warning: colors.timerWarning,
    },
    streak: {
      fire: colors.streakFire,
      text: colors.streakText,
      background: colors.streakBackground,
    },
    readiness: {
      building: colors.readinessBuilding,
      developing: colors.readinessDeveloping,
      almost: colors.readinessAlmost,
      ready: colors.readinessReady,
    },
  },
  spacing: {
    xs: `${spacing.xs}px`,
    sm: `${spacing.sm}px`,
    md: `${spacing.md}px`,
    base: `${spacing.base}px`,
    lg: `${spacing.lg}px`,
    xl: `${spacing.xl}px`,
    '2xl': `${spacing['2xl']}px`,
    '3xl': `${spacing['3xl']}px`,
    '4xl': `${spacing['4xl']}px`,
    '5xl': `${spacing['5xl']}px`,
  },
  borderRadius: {
    sm: `${borderRadius.sm}px`,
    md: `${borderRadius.md}px`,
    lg: `${borderRadius.lg}px`,
    xl: `${borderRadius.xl}px`,
    '2xl': `${borderRadius['2xl']}px`,
    full: `${borderRadius.full}px`,
  },
} as const;
