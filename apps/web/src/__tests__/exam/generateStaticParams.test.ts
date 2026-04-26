import { describe, it, expect } from 'vitest';
import { MOCK_EXAM_CATALOG, getAvailableLevels, getMocksForLevel } from '@fastrack/content';

// This test guards the static param generation that fixes #102.
// generateStaticParams() in apps/web/src/app/exam/[mockId]/page.tsx maps
// MOCK_EXAM_CATALOG to { mockId } objects. If the catalog shrinks or the id
// format changes, these assertions catch it before the build goes live.

describe('MOCK_EXAM_CATALOG — static params source of truth', () => {
  it('has exactly 50 entries (5 levels × 10 mocks each)', () => {
    expect(MOCK_EXAM_CATALOG).toHaveLength(50);
  });

  it('every entry has an id matching the A1_mock_01 format', () => {
    const pattern = /^(A1|A2|B1|B2|C1)_mock_(0[1-9]|10)$/;
    for (const entry of MOCK_EXAM_CATALOG) {
      expect(entry.id).toMatch(pattern);
    }
  });

  it('every level has exactly 10 catalog entries', () => {
    for (const level of getAvailableLevels()) {
      const mocks = getMocksForLevel(level);
      expect(mocks).toHaveLength(10);
    }
  });

  it('all 50 mock ids are unique', () => {
    const ids = MOCK_EXAM_CATALOG.map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });

  it('ids are sequential within each level (mock_01 through mock_10)', () => {
    for (const level of getAvailableLevels()) {
      const mocks = getMocksForLevel(level);
      for (let i = 0; i < mocks.length; i++) {
        const expectedId = `${level}_mock_${String(i + 1).padStart(2, '0')}`;
        expect(mocks[i].id).toBe(expectedId);
      }
    }
  });

  it('generateStaticParams shape — each entry produces { mockId: string }', () => {
    // Mirrors the exact logic in [mockId]/page.tsx generateStaticParams()
    const params = MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));

    expect(params).toHaveLength(50);
    expect(params[0]).toEqual({ mockId: 'A1_mock_01' });
    expect(params[49]).toEqual({ mockId: 'C1_mock_10' });

    for (const p of params) {
      expect(typeof p.mockId).toBe('string');
      expect(p.mockId.length).toBeGreaterThan(0);
    }
  });
});
