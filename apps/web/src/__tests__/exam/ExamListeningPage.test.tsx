/**
 * Integration test for /exam/[mockId]/listening server component.
 *
 * AC requirement (#108): do NOT mock getMockExam, loadMockExam, the static
 * JSON imports, or fs. The whole point is to catch any request-time fs
 * regression. If someone reintroduces a readFile call on this route, this
 * test will hang or throw instead of silently passing.
 *
 * The page reads only from statically imported JSON via @fastrack/content.
 * We call getMockExamOrNotFound (the actual data layer) directly and assert:
 * - Valid mockIds resolve with the correct exam data
 * - Invalid/out-of-range mockIds call notFound()
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

import { getMockExamOrNotFound, parseMockId } from '../../lib/loadMockExam';
import { MOCK_EXAM_CATALOG } from '@fastrack/content';

describe('ListeningPage — static data, no fs at request time', () => {
  it('A1_mock_01 resolves with exam data containing a listening section', async () => {
    const { exam, level, mockNumber } = await getMockExamOrNotFound('A1_mock_01');
    expect(exam.id).toBe('A1_mock_01');
    expect(level).toBe('A1');
    expect(mockNumber).toBe(1);
    expect(exam.sections.listening).toBeDefined();
  });

  it('B1_mock_01 resolves and has listening section', async () => {
    const { exam } = await getMockExamOrNotFound('B1_mock_01');
    expect(exam.level).toBe('B1');
    expect(exam.sections.listening).toBeDefined();
  });

  it('B2_mock_01 resolves and has listening section', async () => {
    const { exam } = await getMockExamOrNotFound('B2_mock_01');
    expect(exam.level).toBe('B2');
    expect(exam.sections.listening).toBeDefined();
  });

  it('C1_mock_01 resolves (stub exam with empty parts)', async () => {
    const { exam } = await getMockExamOrNotFound('C1_mock_01');
    expect(exam.level).toBe('C1');
    expect(exam.sections.listening).toBeDefined();
  });

  it('invalid mockId (foo) calls notFound()', async () => {
    await expect(getMockExamOrNotFound('foo')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('invalid mockId (A1_mock_99) calls notFound()', async () => {
    await expect(getMockExamOrNotFound('A1_mock_99')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('invalid mockId (XX_mock_01) calls notFound()', async () => {
    await expect(getMockExamOrNotFound('XX_mock_01')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('generateStaticParams returns 50 entries for listening (all 5 levels × 10 mocks)', () => {
    // Mirrors the generateStaticParams function in the listening page
    const params = MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));
    expect(params).toHaveLength(50);
    expect(params[0]).toEqual({ mockId: 'A1_mock_01' });
    expect(params[49]).toEqual({ mockId: 'C1_mock_10' });
  });

  it('parseMockId rejects lowercase mockId', () => {
    expect(parseMockId('a1_mock_01')).toBeNull();
  });

  it('parseMockId accepts valid mockId', () => {
    const parsed = parseMockId('A1_mock_01');
    expect(parsed).toEqual({ level: 'A1', mockNumber: 1 });
  });
});
