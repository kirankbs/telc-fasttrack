// loadMockExam is now a thin shim over the static @fastrack/content accessor.
// The original implementation called fs.readFile() at request time, which caused
// 8s Lambda hangs on Vercel (#108 — same root cause as #102, #104, and #106).
// All exam subroute pages now call getMockExam directly; this shim is kept
// for backward compatibility with call sites that import loadMockExam by name.
import { notFound } from 'next/navigation';
import { getMockExam } from '@fastrack/content';
import type { MockExam, Level } from '@fastrack/types';

export async function loadMockExam(
  level: string,
  mockNumber: number,
): Promise<MockExam | null> {
  const validLevels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const upperLevel = level.toUpperCase() as Level;
  if (!validLevels.includes(upperLevel)) return null;
  return getMockExam(upperLevel, mockNumber);
}

export function parseMockId(mockId: string): { level: string; mockNumber: number } | null {
  const match = mockId.match(/^(A1|A2|B1|B2|C1)_mock_(\d+)$/);
  if (!match) return null;
  return { level: match[1], mockNumber: parseInt(match[2], 10) };
}

export async function getMockExamOrNotFound(mockId: string): Promise<{
  exam: MockExam;
  level: string;
  mockNumber: number;
}> {
  const parsed = parseMockId(mockId);
  if (!parsed) notFound();
  const exam = await loadMockExam(parsed.level, parsed.mockNumber);
  if (!exam) notFound();
  return { exam, ...parsed };
}
