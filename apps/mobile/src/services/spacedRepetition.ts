// Re-export spaced repetition logic from the shared @telc/core package.
export {
  calculateNextReview,
  isDueToday,
  getDaysUntilReview,
  getQualityLabel,
} from '@telc/core';
export type { SM2Result } from '@telc/core';
