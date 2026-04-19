'use client';

import { useState } from 'react';
import type { Level, GrammarTopic } from '@telc/types';
import { TopicCard } from '@/components/grammar/TopicCard';

interface LevelConfig {
  level: Level;
  color: string;
  label: string;
  topicCount: number;
  topics: GrammarTopic[];
}

interface GrammarPageClientProps {
  levels: LevelConfig[];
}

export function GrammarPageClient({ levels }: GrammarPageClientProps) {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const selected = levels.find((l) => l.level === selectedLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Grammar</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Key grammar topics with explanations, examples, and exercises.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map(({ level, color, label, topicCount }) => {
          const available = topicCount > 0;
          const isSelected = selectedLevel === level;

          return (
            <div
              key={level}
              data-testid={`level-card-${level}`}
              className={`rounded-xl border bg-white p-6 transition-shadow ${
                isSelected ? 'border-2 shadow-md' : 'border-border'
              }`}
              style={isSelected ? { borderColor: color } : undefined}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {level}
                </span>
                <div>
                  <div className="font-semibold text-text-primary">
                    {level} Grammar
                  </div>
                  <div className="text-xs text-text-secondary">
                    {available
                      ? `${topicCount} topics available`
                      : 'Coming soon'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  data-testid={`browse-button-${level}`}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: color }}
                  disabled={!available}
                  onClick={() =>
                    setSelectedLevel(isSelected ? null : level)
                  }
                >
                  {!available
                    ? 'Coming Soon'
                    : isSelected
                      ? 'Hide Topics'
                      : 'Browse Topics'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && selected.topics.length > 0 && (
        <section data-testid="topic-list">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">
            {selected.level} Topics
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selected.topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                levelColor={selected.color}
              />
            ))}
          </div>
        </section>
      )}

      {selected && selected.topics.length === 0 && (
        <div
          data-testid="no-topics"
          className="rounded-xl border border-border bg-white p-8 text-center text-text-secondary"
        >
          No grammar topics available for {selected.level}.
        </div>
      )}
    </div>
  );
}
