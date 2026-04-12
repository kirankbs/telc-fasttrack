import type { MockExam } from '@telc/types';

export function getMockId(level: string, mockNumber: number): string {
  const padded = String(mockNumber).padStart(2, '0');
  return `${level}_mock_${padded}`;
}

export function validateMockExam(data: unknown, mockId: string): MockExam {
  if (data === null || typeof data !== 'object') {
    throw new Error(`Mock exam ${mockId}: JSON root must be an object`);
  }

  const d = data as Record<string, unknown>;

  if (typeof d.id !== 'string') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "id" field`);
  }
  if (typeof d.level !== 'string') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "level" field`);
  }
  if (typeof d.title !== 'string') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "title" field`);
  }
  if (typeof d.version !== 'number') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "version" field`);
  }
  if (d.sections === null || typeof d.sections !== 'object') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "sections" object`);
  }

  const sections = d.sections as Record<string, unknown>;

  for (const required of ['listening', 'reading', 'writing', 'speaking']) {
    if (sections[required] === null || typeof sections[required] !== 'object') {
      throw new Error(`Mock exam ${mockId}: missing required section "${required}"`);
    }
  }

  return d as unknown as MockExam;
}
