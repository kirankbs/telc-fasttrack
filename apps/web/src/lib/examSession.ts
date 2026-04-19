import type { SectionScore } from '@telc/core';
import type { Level } from '@telc/types';

export interface SectionResult {
  answers: Record<string, string>;
  taskAnswers?: Record<number, Record<string, string>>;
  score: SectionScore;
  submittedAt: string;
  selfAssessment?: number;
}

export interface ExamSessionState {
  mockId: string;
  level: Level;
  startedAt: string;
  sections: {
    listening?: SectionResult;
    reading?: SectionResult;
    writing?: SectionResult;
    speaking?: SectionResult;
  };
}

type SectionKey = keyof ExamSessionState['sections'];

function storageKey(mockId: string): string {
  return `exam_session_${mockId}`;
}

export function getSession(mockId: string): ExamSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey(mockId));
    if (!raw) return null;
    return JSON.parse(raw) as ExamSessionState;
  } catch {
    return null;
  }
}

export function saveSection(
  mockId: string,
  level: Level,
  section: SectionKey,
  result: SectionResult,
): void {
  if (typeof window === 'undefined') return;
  const existing = getSession(mockId);
  const session: ExamSessionState = existing ?? {
    mockId,
    level,
    startedAt: new Date().toISOString(),
    sections: {},
  };
  session.sections[section] = result;
  sessionStorage.setItem(storageKey(mockId), JSON.stringify(session));
}

export function clearSession(mockId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(storageKey(mockId));
}

export function isSessionComplete(session: ExamSessionState): boolean {
  const { listening, reading, writing, speaking } = session.sections;
  return !!(listening && reading && writing && speaking);
}

export function hasAnySection(session: ExamSessionState): boolean {
  const { listening, reading, writing, speaking } = session.sections;
  return !!(listening || reading || writing || speaking);
}
