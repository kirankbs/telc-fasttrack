/**
 * Regression test for the loadVocabulary shim.
 *
 * After #110, loadVocabulary is a static wrapper around getVocabulary — it must
 * not import fs/promises or call readFile. This test asserts the public contract:
 * all 5 levels return arrays of the correct length, C1 returns [] cleanly.
 */

import { describe, it, expect } from 'vitest';
import { loadVocabulary } from '../../lib/loadVocabulary';

describe('loadVocabulary shim — no fs, static data only', () => {
  it('A1 returns 650 vocabulary words', async () => {
    const words = await loadVocabulary('A1');
    expect(words).toHaveLength(650);
  });

  it('A2 returns 1300 vocabulary words', async () => {
    const words = await loadVocabulary('A2');
    expect(words).toHaveLength(1300);
  });

  it('B1 returns 2400 vocabulary words', async () => {
    const words = await loadVocabulary('B1');
    expect(words).toHaveLength(2400);
  });

  it('B2 returns words', async () => {
    const words = await loadVocabulary('B2');
    expect(words.length).toBeGreaterThan(0);
  });

  it('C1 returns empty array cleanly (does not throw)', async () => {
    const words = await loadVocabulary('C1');
    expect(Array.isArray(words)).toBe(true);
    expect(words).toHaveLength(0);
  });

  it('unknown level returns empty array', async () => {
    expect(await loadVocabulary('D1')).toHaveLength(0);
    expect(await loadVocabulary('foo')).toHaveLength(0);
  });

  it('lowercase level is handled', async () => {
    const words = await loadVocabulary('a1');
    expect(words).toHaveLength(650);
  });

  it('each word has required fields', async () => {
    const words = await loadVocabulary('A1');
    const sample = words[0];
    expect(typeof sample.id).toBe('number');
    expect(typeof sample.german).toBe('string');
    expect(typeof sample.english).toBe('string');
    expect(typeof sample.level).toBe('string');
  });
});
