import { LEVEL_CONFIG } from '@fastrack/config';
import type { Level } from '@fastrack/types';
import { getGrammarTopics, getGrammarLevels } from '@fastrack/content';
import { GrammarPageClient } from './GrammarPageClient';

// Static page — grammar topic counts are baked from statically imported JSON.
// No fs reads at request time (fixes the /grammar/[level] hang family, #106).
export const dynamic = 'force-static';

export default function GrammarPage() {
  const levels = getGrammarLevels();
  const levelConfigs = levels.map((level: Level) => ({
    level,
    color: LEVEL_CONFIG[level].color,
    label: LEVEL_CONFIG[level].label,
    topicCount: getGrammarTopics(level).length,
  }));

  return <GrammarPageClient levels={levelConfigs} />;
}
