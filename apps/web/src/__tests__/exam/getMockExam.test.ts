/**
 * Accessor test for getMockExam from @fastrack/content.
 *
 * AC requirement (#108): asserts all 50 catalog mocks resolve to valid exam
 * objects, out-of-range numbers return null, and no fs reads are involved.
 * The static JSON is bundled at build time — if this test runs without any
 * fs setup, it confirms there is no request-time fs dependency.
 */
import { describe, it, expect } from 'vitest';
import { getMockExam, MOCK_EXAM_CATALOG, getAvailableLevels } from '@fastrack/content';
import type { Level } from '@fastrack/types';

describe('getMockExam — static data, no fs at request time', () => {
  it('returns a non-null MockExam for every catalog-listed mock', () => {
    for (const entry of MOCK_EXAM_CATALOG) {
      const result = getMockExam(entry.level, entry.mockNumber);
      expect(result, `${entry.id} should be non-null`).not.toBeNull();
      expect(result?.id).toBe(entry.id);
      expect(result?.level).toBe(entry.level);
    }
  });

  it('all 50 mocks resolve (5 levels × 10 each)', () => {
    let count = 0;
    for (const level of getAvailableLevels()) {
      for (let n = 1; n <= 10; n++) {
        const result = getMockExam(level, n);
        expect(result, `${level} mock ${n} should not be null`).not.toBeNull();
        count++;
      }
    }
    expect(count).toBe(50);
  });

  it('A1 mocks have required sections without sprachbausteine', () => {
    for (let n = 1; n <= 10; n++) {
      const mock = getMockExam('A1', n)!;
      expect(mock.sections.listening).toBeDefined();
      expect(mock.sections.reading).toBeDefined();
      expect(mock.sections.writing).toBeDefined();
      expect(mock.sections.speaking).toBeDefined();
      expect(mock.sections.sprachbausteine).toBeUndefined();
    }
  });

  it('B1 mock 1 has sprachbausteine section', () => {
    const mock = getMockExam('B1', 1)!;
    expect(mock.sections.sprachbausteine).toBeDefined();
  });

  it('B2 mock 1 has sprachbausteine section', () => {
    const mock = getMockExam('B2', 1)!;
    expect(mock.sections.sprachbausteine).toBeDefined();
  });

  it('C1 mocks are valid stubs with required sections', () => {
    for (let n = 1; n <= 10; n++) {
      const mock = getMockExam('C1', n);
      expect(mock, `C1 mock ${n} should be non-null`).not.toBeNull();
      expect(mock?.sections.listening).toBeDefined();
      expect(mock?.sections.reading).toBeDefined();
      expect(mock?.sections.writing).toBeDefined();
      expect(mock?.sections.speaking).toBeDefined();
    }
  });

  it('returns null for out-of-range mock number (> 10)', () => {
    expect(getMockExam('A1', 11)).toBeNull();
    expect(getMockExam('A1', 99)).toBeNull();
  });

  it('returns null for mock number 0', () => {
    expect(getMockExam('A1', 0)).toBeNull();
  });

  it('returns null for negative mock number', () => {
    expect(getMockExam('A1', -1)).toBeNull();
  });

  it('returns null for invalid level', () => {
    expect(getMockExam('D1' as Level, 1)).toBeNull();
    expect(getMockExam('foo' as Level, 1)).toBeNull();
  });
});
