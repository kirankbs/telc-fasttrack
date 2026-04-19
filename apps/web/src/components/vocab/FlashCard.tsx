'use client';

import { useState, useCallback } from 'react';
import type { VocabularyWord } from '@/lib/loadVocabulary';

interface FlashCardProps {
  word: VocabularyWord;
  isFlipped: boolean;
  onFlip: () => void;
}

const GENDER_HINTS: Record<string, string> = {
  der: 'masculine',
  die: 'feminine',
  das: 'neuter',
};

export function FlashCard({ word, isFlipped, onFlip }: FlashCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onFlip();
      }
    },
    [onFlip],
  );

  return (
    <div
      data-testid="flashcard"
      className="relative mx-auto w-full max-w-md cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Card showing answer. Click to flip back.' : 'Click to reveal answer.'}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          data-testid="flashcard-front"
          className="rounded-xl border border-border bg-white p-8 shadow-sm"
          style={{ backfaceVisibility: 'hidden', minHeight: '260px' }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <span className="inline-block rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-text-secondary">
              {word.topic}
            </span>
            <p className="text-3xl font-bold text-text-primary">{word.german}</p>
            <p className="text-sm text-text-secondary">Tap card or press Enter to flip</p>
          </div>
        </div>

        {/* Back */}
        <div
          data-testid="flashcard-back"
          className="absolute inset-0 rounded-xl border border-border bg-white p-8 shadow-sm"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            minHeight: '260px',
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold text-text-primary">{word.english}</p>

            {word.article && (
              <p className="text-sm text-text-secondary">
                {word.article} ({GENDER_HINTS[word.article] ?? 'unknown'})
              </p>
            )}

            {word.plural && (
              <p className="text-sm text-text-secondary">
                Plural: {word.plural}
              </p>
            )}

            <div className="mt-2 w-full rounded-lg bg-surface-container p-3">
              <p className="text-center text-sm italic text-text-secondary">
                {word.exampleSentence}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
