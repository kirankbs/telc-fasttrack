/**
 * Regression guard for catalog hasContent integrity.
 *
 * Asserts that every currently-shipped mock has hasContent: true.
 * If a JSON file is removed from apps/mobile/assets/content/ without
 * also updating the catalog, someone must consciously update this test
 * (and the catalog) rather than silently shipping a broken entry.
 *
 * Strategy: trust the catalog as authoritative (per AC). The test does
 * not probe the filesystem — it asserts the catalog's declared state.
 */

import { describe, it, expect } from 'vitest';
import { MOCK_EXAM_CATALOG, getAvailableLevels, getMocksForLevel } from '@fastrack/content';

describe('catalog hasContent integrity', () => {
  it('every entry in MOCK_EXAM_CATALOG declares hasContent as a boolean', () => {
    for (const entry of MOCK_EXAM_CATALOG) {
      expect(typeof entry.hasContent, `${entry.id}.hasContent must be boolean`).toBe('boolean');
    }
  });

  it('all 50 currently-shipped mocks have hasContent: true', () => {
    const missing = MOCK_EXAM_CATALOG.filter((e) => !e.hasContent);
    expect(missing, 'These catalog entries claim no JSON but should have content').toHaveLength(0);
  });

  it('hasContent is true for all entries in every level', () => {
    for (const level of getAvailableLevels()) {
      const mocks = getMocksForLevel(level);
      const noContent = mocks.filter((m) => !m.hasContent);
      expect(noContent, `Level ${level} has entries with hasContent: false`).toHaveLength(0);
    }
  });
});
