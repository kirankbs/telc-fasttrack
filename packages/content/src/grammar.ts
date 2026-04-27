import type { GrammarTopic, Level } from '@fastrack/types';

// Static imports — bundler traces these at build time, no fs reads at request time.
// Root cause of #106: loadGrammar.ts called readFile() against a sibling-package path
// that Vercel does not trace into the Lambda bundle, causing 8s hangs on all
// /grammar/[level] and /grammar/[level]/[topicId] routes.
import A1Raw from '../../../apps/mobile/src/data/grammar/A1_grammar.json';
import A2Raw from '../../../apps/mobile/src/data/grammar/A2_grammar.json';
import B1Raw from '../../../apps/mobile/src/data/grammar/B1_grammar.json';
import B2Raw from '../../../apps/mobile/src/data/grammar/B2_grammar.json';
import C1Raw from '../../../apps/mobile/src/data/grammar/C1_grammar.json';

// Validate at module load (build time). If the JSON root is not an array the
// build will throw here — never ships a broken module to runtime.
function assertTopicArray(data: unknown, level: string): GrammarTopic[] {
  if (!Array.isArray(data)) {
    throw new Error(`Grammar JSON for ${level} is not an array — build is broken`);
  }
  return data as GrammarTopic[];
}

const GRAMMAR_DATA: Record<Level, GrammarTopic[]> = {
  A1: assertTopicArray(A1Raw, 'A1').sort((a, b) => a.orderIndex - b.orderIndex),
  A2: assertTopicArray(A2Raw, 'A2').sort((a, b) => a.orderIndex - b.orderIndex),
  B1: assertTopicArray(B1Raw, 'B1').sort((a, b) => a.orderIndex - b.orderIndex),
  B2: assertTopicArray(B2Raw, 'B2').sort((a, b) => a.orderIndex - b.orderIndex),
  C1: assertTopicArray(C1Raw, 'C1').sort((a, b) => a.orderIndex - b.orderIndex),
};

/**
 * Returns grammar topics for the given level, sorted by orderIndex.
 * Data is statically imported at build time — no fs reads at request time.
 * C1 is an empty array and is a valid runtime state.
 */
export function getGrammarTopics(level: Level): GrammarTopic[] {
  return GRAMMAR_DATA[level];
}

export function getGrammarLevels(): Level[] {
  return ['A1', 'A2', 'B1', 'B2', 'C1'];
}
