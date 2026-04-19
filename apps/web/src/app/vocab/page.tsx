import { LEVEL_CONFIG } from '@telc/config';
import type { Level } from '@telc/types';
import { loadVocabulary } from '@/lib/loadVocabulary';
import { VocabPageClient } from './VocabPageClient';

const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default async function VocabPage() {
  const vocabByLevel: Record<string, Awaited<ReturnType<typeof loadVocabulary>>> = {};

  for (const level of levels) {
    vocabByLevel[level] = await loadVocabulary(level);
  }

  const levelConfigs = levels.map((level) => ({
    level,
    color: LEVEL_CONFIG[level].color,
    label: LEVEL_CONFIG[level].label,
    wordCount: vocabByLevel[level].length,
    words: vocabByLevel[level],
  }));

  return <VocabPageClient levels={levelConfigs} />;
}
