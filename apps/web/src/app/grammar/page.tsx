import { LEVEL_CONFIG } from '@fastrack/config';
import type { Level } from '@fastrack/types';
import { loadGrammar } from '@/lib/loadGrammar';
import { GrammarPageClient } from './GrammarPageClient';

const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default async function GrammarPage() {
  const levelConfigs = await Promise.all(
    levels.map(async (level) => {
      const topics = await loadGrammar(level);
      return {
        level,
        color: LEVEL_CONFIG[level].color,
        label: LEVEL_CONFIG[level].label,
        topicCount: topics.length,
      };
    }),
  );

  return <GrammarPageClient levels={levelConfigs} />;
}
