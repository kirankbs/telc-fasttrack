/**
 * Regression test for the loadGrammar shim.
 *
 * After #106, loadGrammar is a static wrapper around getGrammarTopics — it must
 * not import fs/promises or call readFile. This test asserts the public contract:
 * all 5 levels return arrays sorted by orderIndex, C1 returns [] cleanly.
 */

import { describe, it, expect } from 'vitest';
import { loadGrammar } from '../../lib/loadGrammar';

describe('loadGrammar shim — no fs, static data only', () => {
  it('A1 returns 12 topics sorted by orderIndex', () => {
    const topics = loadGrammar('A1');
    expect(topics).toHaveLength(12);
    for (let i = 0; i < topics.length - 1; i++) {
      expect(topics[i].orderIndex).toBeLessThan(topics[i + 1].orderIndex);
    }
  });

  it('A2 returns 15 topics sorted by orderIndex', () => {
    const topics = loadGrammar('A2');
    expect(topics).toHaveLength(15);
    for (let i = 0; i < topics.length - 1; i++) {
      expect(topics[i].orderIndex).toBeLessThan(topics[i + 1].orderIndex);
    }
  });

  it('B1 returns 20 topics', () => {
    expect(loadGrammar('B1')).toHaveLength(20);
  });

  it('B2 returns 25 topics', () => {
    expect(loadGrammar('B2')).toHaveLength(25);
  });

  it('C1 returns empty array cleanly (does not throw)', () => {
    const topics = loadGrammar('C1');
    expect(Array.isArray(topics)).toBe(true);
    expect(topics).toHaveLength(0);
  });

  it('unknown level returns empty array', () => {
    expect(loadGrammar('D1')).toHaveLength(0);
    expect(loadGrammar('foo')).toHaveLength(0);
  });

  it('lowercase level is handled', () => {
    expect(loadGrammar('a1')).toHaveLength(12);
  });
});
