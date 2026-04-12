// Re-export scoring logic from the shared @telc/core package.
export {
  calculateSectionScore,
  calculateExamScore,
  getReadinessLevel,
  formatScore,
} from '@telc/core';
export type {
  SectionScore,
  ExamScore,
  QuestionResponse,
  ReadinessLevel,
} from '@telc/core';
