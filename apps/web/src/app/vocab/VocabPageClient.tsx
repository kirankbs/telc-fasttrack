'use client';

import { useState } from 'react';
import type { VocabularyWord } from '@/lib/loadVocabulary';
import { FlashcardSession } from '@/components/vocab/FlashcardSession';

interface LevelConfig {
  level: string;
  color: string;
  label: string;
  wordCount: number;
  words: VocabularyWord[];
}

interface VocabPageClientProps {
  levels: LevelConfig[];
}

export function VocabPageClient({ levels }: VocabPageClientProps) {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  const activeLevelConfig = levels.find((l) => l.level === activeLevel);

  if (activeLevelConfig && activeLevelConfig.wordCount > 0) {
    return (
      <div className="space-y-6">
        <FlashcardSession
          allWords={activeLevelConfig.words}
          levelLabel={`${activeLevelConfig.level} Vocabulary`}
          levelColor={activeLevelConfig.color}
          onBack={() => setActiveLevel(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Vocabulary</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Flashcards with SM-2 spaced repetition. Review daily for best results.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((cfg) => {
          const hasWords = cfg.wordCount > 0;
          return (
            <div
              key={cfg.level}
              className="rounded-xl border border-border bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: cfg.color }}
                >
                  {cfg.level}
                </span>
                <div>
                  <div className="font-semibold text-text-primary">
                    {cfg.level} Vocabulary
                  </div>
                  <div className="text-xs text-text-secondary">
                    {hasWords ? `~${cfg.wordCount} words` : 'Coming soon'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  data-testid={`start-review-${cfg.level}`}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: cfg.color }}
                  disabled={!hasWords}
                  onClick={() => setActiveLevel(cfg.level)}
                >
                  {hasWords ? 'Start Review' : 'Coming Soon'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
