// Re-export scoring logic from the shared @fastrack/core package.
export {
  calculateSectionScore,
  calculateExamScore,
  getReadinessLevel,
  formatScore,
} from '@fastrack/core';
export type {
  SectionScore,
  ExamScore,
  QuestionResponse,
  ReadinessLevel,
} from '@fastrack/core';
