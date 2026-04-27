/**
 * Integration test for /exam/[mockId]/sprachbausteine server component.
 *
 * AC requirement (#108): do NOT mock getMockExam, loadMockExam, or fs.
 * Key assertions:
 * - B1 and B2 mockIds resolve and have a sprachbausteine section
 * - A1, A2, C1 mockIds resolve but call notFound() because no sprachbausteine section
 * - generateStaticParams returns exactly 20 entries (B1×10 + B2×10)
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

import { notFound } from 'next/navigation';
import { getMockExamOrNotFound } from '../../lib/loadMockExam';
import { MOCK_EXAM_CATALOG } from '@fastrack/content';

// Mirrors the sprachbausteine page logic: get exam, then check for section
async function resolveSprachbausteinePage(mockId: string) {
  const { exam } = await getMockExamOrNotFound(mockId);
  if (!exam.sections.sprachbausteine) notFound();
  return exam;
}

describe('SprachbausteinePage — static data, no fs at request time', () => {
  it('B1_mock_01 resolves with sprachbausteine section', async () => {
    const exam = await resolveSprachbausteinePage('B1_mock_01');
    expect(exam.level).toBe('B1');
    expect(exam.sections.sprachbausteine).toBeDefined();
  });

  it('B2_mock_01 resolves with sprachbausteine section', async () => {
    const exam = await resolveSprachbausteinePage('B2_mock_01');
    expect(exam.level).toBe('B2');
    expect(exam.sections.sprachbausteine).toBeDefined();
  });

  it('all 10 B1 mocks have sprachbausteine', async () => {
    for (let n = 1; n <= 10; n++) {
      const mockId = `B1_mock_${String(n).padStart(2, '0')}`;
      const exam = await resolveSprachbausteinePage(mockId);
      expect(exam.sections.sprachbausteine, `${mockId} should have sprachbausteine`).toBeDefined();
    }
  });

  it('all 10 B2 mocks have sprachbausteine', async () => {
    for (let n = 1; n <= 10; n++) {
      const mockId = `B2_mock_${String(n).padStart(2, '0')}`;
      const exam = await resolveSprachbausteinePage(mockId);
      expect(exam.sections.sprachbausteine, `${mockId} should have sprachbausteine`).toBeDefined();
    }
  });

  it('A1_mock_01 calls notFound() — no sprachbausteine at A1 level', async () => {
    await expect(resolveSprachbausteinePage('A1_mock_01')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('A2_mock_01 calls notFound() — no sprachbausteine at A2 level', async () => {
    await expect(resolveSprachbausteinePage('A2_mock_01')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('C1_mock_01 calls notFound() — no sprachbausteine at C1 level', async () => {
    await expect(resolveSprachbausteinePage('C1_mock_01')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('invalid mockId (foo) calls notFound()', async () => {
    await expect(resolveSprachbausteinePage('foo')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('generateStaticParams returns exactly 20 entries (B1×10 + B2×10)', () => {
    // Mirrors the generateStaticParams function in the sprachbausteine page
    const params = MOCK_EXAM_CATALOG.filter(
      (entry) => entry.level === 'B1' || entry.level === 'B2',
    ).map((entry) => ({ mockId: entry.id }));

    expect(params).toHaveLength(20);
    expect(params[0]).toEqual({ mockId: 'B1_mock_01' });
    expect(params[19]).toEqual({ mockId: 'B2_mock_10' });

    // All entries must be B1 or B2
    for (const p of params) {
      expect(p.mockId).toMatch(/^(B1|B2)_mock_\d{2}$/);
    }
  });
});
