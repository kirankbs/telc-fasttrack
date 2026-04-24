import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LEVEL_CONFIG } from '@fastrack/config';
import type { Level } from '@fastrack/types';
import { loadGrammar } from '@/lib/loadGrammar';
import { TopicCard } from '@/components/grammar/TopicCard';

const VALID_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

interface Props {
  params: Promise<{ level: string }>;
}

export default async function GrammarLevelPage({ params }: Props) {
  const { level: rawLevel } = await params;
  const level = rawLevel.toUpperCase() as Level;

  if (!VALID_LEVELS.includes(level)) {
    notFound();
  }

  const topics = await loadGrammar(level);
  const cfg = LEVEL_CONFIG[level];

  return (
    <div className="space-y-6">
      <nav
        data-testid="breadcrumb"
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[13px] text-text-secondary"
      >
        <Link
          href="/grammar"
          data-testid="back-to-grammar"
          className="inline-flex items-center gap-1 hover:text-text-primary"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Grammatik</span>
        </Link>
        <span className="text-text-tertiary" aria-hidden="true">
          /
        </span>
        <span className="text-text-primary font-medium">{level}</span>
      </nav>

      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: cfg.color }}
        >
          {level}
        </span>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{level} Grammar</h1>
          <p className="text-sm text-text-secondary">{topics.length} topics</p>
        </div>
      </div>

      {topics.length > 0 ? (
        <div
          data-testid="topic-grid"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} levelColor={cfg.color} />
          ))}
        </div>
      ) : (
        <div
          data-testid="no-topics"
          className="rounded-xl border border-border bg-surface p-8 text-center text-text-secondary"
        >
          No grammar topics available for {level} yet.
        </div>
      )}
    </div>
  );
}
