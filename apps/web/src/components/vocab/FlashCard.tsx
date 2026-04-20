'use client';

import { useCallback } from 'react';
import type { VocabularyWord } from '@/lib/loadVocabulary';

interface FlashCardProps {
  word: VocabularyWord;
  isFlipped: boolean;
  onFlip: () => void;
  showFlipHint?: boolean;
}

const GENDER_HINTS: Record<string, string> = {
  der: 'masculine',
  die: 'feminine',
  das: 'neuter',
};

export function FlashCard({ word, isFlipped, onFlip, showFlipHint = true }: FlashCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onFlip();
      }
    },
    [onFlip],
  );

  // Front already shows the article inline with the noun when present
  // (e.g. "das Frühstück"). Guard against double-prefixed data.
  const germanDisplay =
    word.article && !word.german.toLowerCase().startsWith(`${word.article.toLowerCase()} `)
      ? `${word.article} ${word.german}`
      : word.german;

  return (
    <div
      data-testid="flashcard"
      className="relative mx-auto w-full max-w-md cursor-pointer select-none motion-reduce:cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Karte zeigt Antwort. Zum Umdrehen klicken.' : 'Karte umdrehen.'}
    >
      {/* Motion-safe: 3D flip. Motion-reduce: cross-fade. Both share the
          same DOM structure so reduced-motion users get the content
          without rotation. */}
      <div
        data-testid="flashcard-flipper"
        className="relative w-full motion-safe:transition-transform motion-safe:duration-500 motion-reduce:transition-none"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Front face */}
        <div
          data-testid="flashcard-front"
          className="rounded-2xl border border-border bg-surface p-10 shadow-lg motion-reduce:transition-opacity motion-reduce:duration-[150ms]"
          style={{
            backfaceVisibility: 'hidden',
            minHeight: '280px',
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="inline-block rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-text-tertiary">
              {word.topic}
            </span>
            <p
              data-testid="flashcard-german"
              className="font-sans text-3xl font-semibold text-text-primary"
              lang="de"
            >
              {germanDisplay}
            </p>
            {showFlipHint && (
              <p data-testid="flashcard-flip-hint" className="text-xs text-text-tertiary">
                Karte umdrehen
              </p>
            )}
          </div>
        </div>

        {/* Back face */}
        <div
          data-testid="flashcard-back"
          className="absolute inset-0 rounded-2xl border border-border bg-surface p-10 shadow-lg motion-reduce:transition-opacity motion-reduce:duration-[150ms]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            minHeight: '280px',
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="font-sans text-2xl font-medium text-text-primary">{word.english}</p>

            {word.article && (
              <p className="text-sm text-text-secondary">
                {word.article} ({GENDER_HINTS[word.article] ?? 'unknown'})
              </p>
            )}

            {word.plural && (
              <p className="text-sm text-text-secondary">Plural: {word.plural}</p>
            )}

            <div className="mt-2 w-full max-w-[340px] rounded-lg bg-surface-container p-3">
              <p className="text-sm italic text-text-secondary" lang="de">
                {word.exampleSentence}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
