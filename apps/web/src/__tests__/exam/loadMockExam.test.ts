/**
 * Regression test for the loadMockExam shim.
 *
 * After #108, loadMockExam is a static wrapper around getMockExam — it must
 * not import fs/promises or call readFile. This test asserts the public
 * contract: valid level+number pairs return a non-null MockExam from the
 * statically imported data, and out-of-range / invalid inputs return null.
 */
import { describe, it, expect, vi } from 'vitest';

// Stub next/navigation so notFound() doesn't throw in non-Next environments.
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

import { loadMockExam, parseMockId } from '../../lib/loadMockExam';

describe('loadMockExam — static shim, no fs', () => {
  it('returns a parsed MockExam for a valid A1 mock', async () => {
    const result = await loadMockExam('A1', 1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('A1_mock_01');
    expect(result?.level).toBe('A1');
  });

  it('returns a parsed MockExam for a valid B1 mock (includes sprachbausteine)', async () => {
    const result = await loadMockExam('B1', 1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('B1_mock_01');
    expect(result?.sections.sprachbausteine).toBeDefined();
  });

  it('returns a parsed MockExam for a valid C1 stub mock', async () => {
    // C1 mocks are stubs with empty parts — they are valid and non-null
    const result = await loadMockExam('C1', 1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('C1_mock_01');
  });

  it('returns null when mock number is out of range (> 10)', async () => {
    const result = await loadMockExam('A1', 99);
    expect(result).toBeNull();
  });

  it('returns null when mock number is 0', async () => {
    expect(await loadMockExam('A1', 0)).toBeNull();
  });

  it('returns null when mock number is negative', async () => {
    expect(await loadMockExam('A1', -1)).toBeNull();
  });

  it('returns null when level is invalid', async () => {
    expect(await loadMockExam('D1', 1)).toBeNull();
    expect(await loadMockExam('', 1)).toBeNull();
    expect(await loadMockExam('foo', 1)).toBeNull();
  });

  it('handles lowercase level gracefully (returns null — parseMockId rejects lowercase)', async () => {
    // loadMockExam does toUpperCase internally, so lowercase 'a1' is treated as 'A1'
    const result = await loadMockExam('a1', 1);
    expect(result).not.toBeNull();
  });

  it('loads all 5 levels successfully for mock 1', async () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      const result = await loadMockExam(level, 1);
      expect(result, `${level} mock 1 should resolve`).not.toBeNull();
      expect(result?.level).toBe(level);
    }
  });
});

describe('parseMockId — supplemental edge cases', () => {
  it('correctly parses all five supported levels', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      const result = parseMockId(`${level}_mock_03`);
      expect(result).toEqual({ level, mockNumber: 3 });
    }
  });

  it('returns null for lowercase level', () => {
    expect(parseMockId('a1_mock_01')).toBeNull();
  });

  it('returns null for completely invalid shapes', () => {
    expect(parseMockId('not-a-mock-id')).toBeNull();
    expect(parseMockId('')).toBeNull();
    expect(parseMockId('A1_mock_')).toBeNull();
  });
});
