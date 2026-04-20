import { readFile } from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import { validateMockExam } from '@fastrack/content';
import type { MockExam } from '@fastrack/types';

// process.cwd() = apps/web/ when Next.js runs; ../mobile resolves to apps/mobile/
const CONTENT_DIR =
  process.env.CONTENT_DIR ??
  path.resolve(process.cwd(), '../mobile/assets/content');

export async function loadMockExam(
  level: string,
  mockNumber: number,
): Promise<MockExam | null> {
  const padded = String(mockNumber).padStart(2, '0');
  const mockId = `${level}_mock_${padded}`;
  const filePath = path.join(CONTENT_DIR, level, `mock_${padded}.json`);

  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as unknown;
    return validateMockExam(data, mockId);
  } catch {
    return null;
  }
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
