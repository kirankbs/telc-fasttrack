// loadVocabulary is now a thin shim over the static @fastrack/content accessor.
// The original implementation called fs.readFile() at request time, which caused
// Lambda hangs on Vercel (#102, #104, #106, #108 — same root cause across all loaders).
// All vocab pages now import getVocabulary directly; this shim is kept
// for backward compatibility with call sites that import loadVocabulary by name.
import type { Level } from '@fastrack/types';
import { getVocabulary } from '@fastrack/content';

// Re-export VocabularyWord so callers that import it from this module still work.
export type { VocabularyWord } from '@fastrack/content';

export async function loadVocabulary(level: string): Promise<ReturnType<typeof getVocabulary>> {
  const validLevels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const upperLevel = level.toUpperCase() as Level;
  if (!validLevels.includes(upperLevel)) return [];
  return getVocabulary(upperLevel);
}
