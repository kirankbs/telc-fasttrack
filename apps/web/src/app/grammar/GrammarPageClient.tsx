'use client';

import Link from 'next/link';
import type { Level } from '@fastrack/types';

interface LevelConfig {
  level: Level;
  color: string;
  label: string;
  topicCount: number;
}

interface GrammarPageClientProps {
  levels: LevelConfig[];
}

export function GrammarPageClient({ levels }: GrammarPageClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Grammar</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Key grammar topics with explanations, examples, and exercises.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map(({ level, color, topicCount }) => {
          const available = topicCount > 0;

          return (
            <div
              key={level}
              data-testid={`level-card-${level}`}
              className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-sm"
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
                {available ? (
                  <Link
                    href={`/grammar/${level}`}
                    data-testid={`browse-button-${level}`}
                    className="block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: color }}
                  >
                    Browse Topics
                  </Link>
                ) : (
                  <button
                    data-testid={`browse-button-${level}`}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: color }}
                    disabled
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
