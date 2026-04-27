import type { Level } from '@fastrack/types';

// Static imports — bundler traces these at build time, no fs reads at request time.
// Root cause of #108 (and #102, #104, #106): helpers called readFile() against a
// sibling-package path that Vercel does not trace into the Lambda bundle, causing
// 8s Lambda hangs. loadVocabulary.ts is the last such helper — fixed here by
// mirroring the grammar.ts and mocks.ts static-import pattern (PRs #107, #109).
import A1Raw from '../../../apps/mobile/src/data/vocabulary/A1_vocabulary.json';
import A2Raw from '../../../apps/mobile/src/data/vocabulary/A2_vocabulary.json';
import B1Raw from '../../../apps/mobile/src/data/vocabulary/B1_vocabulary.json';
import B2Raw from '../../../apps/mobile/src/data/vocabulary/B2_vocabulary.json';
import C1Raw from '../../../apps/mobile/src/data/vocabulary/C1_vocabulary.json';

export interface VocabularyWord {
  id: number;
  level: string;
  german: string;
  english: string;
  article: string | null;
  plural?: string | null;
  exampleSentence: string;
  topic: string;
  audioFile: string | null;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string | null;
  lastReviewedAt: string | null;
}

function assertVocabArray(data: unknown, level: string): VocabularyWord[] {
  if (!Array.isArray(data)) {
    throw new Error(`Vocabulary JSON for ${level} is not an array — build is broken`);
  }
  return data as VocabularyWord[];
}

const VOCABULARY_DATA: Record<Level, VocabularyWord[]> = {
  A1: assertVocabArray(A1Raw, 'A1'),
  A2: assertVocabArray(A2Raw, 'A2'),
  B1: assertVocabArray(B1Raw, 'B1'),
  B2: assertVocabArray(B2Raw, 'B2'),
  C1: assertVocabArray(C1Raw, 'C1'),
};

/**
 * Returns vocabulary words for the given level.
 * Data is statically imported at build time — no fs reads at request time.
 */
export function getVocabulary(level: Level): VocabularyWord[] {
  return VOCABULARY_DATA[level];
}
