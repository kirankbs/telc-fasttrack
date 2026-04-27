// loadGrammar is now a thin shim over the static @fastrack/content accessor.
// The original implementation called fs.readFile() at request time, which caused
// 8s Lambda hangs on Vercel (#106 — same root cause as #102 and #104).
// All grammar pages now import getGrammarTopics directly; this shim is kept
// only for any test files that still import loadGrammar by name.
import type { GrammarTopic, Level } from '@fastrack/types';
import { getGrammarTopics } from '@fastrack/content';

export function loadGrammar(level: string): GrammarTopic[] {
  const validLevels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const upperLevel = level.toUpperCase() as Level;
  if (!validLevels.includes(upperLevel)) return [];
  return getGrammarTopics(upperLevel);
}
