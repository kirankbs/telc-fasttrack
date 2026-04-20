import { LEVEL_CONFIG } from '@fastrack/config';
import type { Level } from '@fastrack/types';
import { loadGrammar } from '@/lib/loadGrammar';
import { GrammarPageClient } from './GrammarPageClient';

const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default async function GrammarPage() {
  const topicsByLevel: Record<string, Awaited<ReturnType<typeof loadGrammar>>> = {};

  for (const level of levels) {
    topicsByLevel[level] = await loadGrammar(level);
  }

  const levelConfigs = levels.map((level) => ({
    level,
    color: LEVEL_CONFIG[level].color,
    label: LEVEL_CONFIG[level].label,
    topicCount: topicsByLevel[level].length,
    topics: topicsByLevel[level],
  }));

  return <GrammarPageClient levels={levelConfigs} />;
}
