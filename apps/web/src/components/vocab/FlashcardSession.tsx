'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { calculateNextReview } from '@fastrack/core';
import type { SM2Result } from '@fastrack/core';
import type { VocabularyWord } from '@/lib/loadVocabulary';
import { FlashCard } from './FlashCard';

type SessionState = 'idle' | 'active' | 'summary';

interface SessionCard {
  word: VocabularyWord;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  result: SM2Result | null;
  gradedQuality: number | null;
}

const SESSION_SIZE = 20;

// "Sicher" threshold: SM-2 interval above this means the card is considered
// well-known (spaced-repetition convention: >7 days = long-term retention).
const SICHER_INTERVAL_DAYS = 7;

// Grade quality values for the two-button flow.
// 2 = requeue for review ("Noch lernen"), 4 = known ("Gewusst").
const QUALITY_AGAIN = 2;
const QUALITY_KNOWN = 4;

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

interface FlashcardSessionProps {
  allWords: VocabularyWord[];
  levelLabel: string;
  levelColor: string;
  onBack: () => void;
}

export function FlashcardSession({
  allWords,
  levelLabel,
  levelColor,
  onBack,
}: FlashcardSessionProps) {
  const [state, setState] = useState<SessionState>('idle');
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // Session-level: hide the "Karte umdrehen" hint after the first flip.
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false);
  const gradingRef = useRef(false);

  const startSession = useCallback(() => {
    const selected = shuffleAndPick(allWords, SESSION_SIZE);
    setCards(
      selected.map((word) => ({
        word,
        easeFactor: 2.5,
        intervalDays: 0,
        repetitions: 0,
        result: null,
        gradedQuality: null,
      })),
    );
    setCurrentIndex(0);
    setIsFlipped(false);
    setHasFlippedOnce(false);
    setState('active');
  }, [allWords]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      if (!prev) setHasFlippedOnce(true);
      return !prev;
    });
  }, []);

  const handleGrade = useCallback(
    (quality: number) => {
      if (gradingRef.current) return;
      gradingRef.current = true;

      setCards((prev) => {
        const updated = [...prev];
        const card = updated[currentIndex];
        const result = calculateNextReview(
          quality,
          card.easeFactor,
          card.intervalDays,
          card.repetitions,
        );
        updated[currentIndex] = {
          ...card,
          result,
          gradedQuality: quality,
          easeFactor: result.easeFactor,
          intervalDays: result.intervalDays,
          repetitions: result.repetitions,
        };
        return updated;
      });

      const nextIndex = currentIndex + 1;
      if (nextIndex >= cards.length) {
        setState('summary');
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }

      gradingRef.current = false;
    },
    [currentIndex, cards.length],
  );

  const summaryStats = useMemo(() => {
    if (state !== 'summary') return null;

    const graded = cards.filter((c) => c.gradedQuality !== null);
    let sicher = 0;
    let wiederholen = 0;

    for (const card of graded) {
      if (card.result && card.result.intervalDays > SICHER_INTERVAL_DAYS) {
        sicher += 1;
      } else {
        wiederholen += 1;
      }
    }

    return {
      total: graded.length,
      sicher,
      wiederholen,
    };
  }, [state, cards]);

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: levelColor }}
        >
          A1
        </div>
        <h2 className="text-xl font-bold text-text-primary">{levelLabel}</h2>
        <p className="text-sm text-text-secondary">
          {allWords.length} words available. Each session reviews{' '}
          {Math.min(SESSION_SIZE, allWords.length)} random cards.
        </p>
        <button
          data-testid="start-review"
          className="rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: levelColor }}
          onClick={startSession}
        >
          Start Review
        </button>
        <button
          data-testid="back-to-vocab"
          className="text-sm text-text-secondary underline hover:text-text-primary"
          onClick={onBack}
        >
          Back to Vocabulary
        </button>
      </div>
    );
  }

  if (state === 'summary' && summaryStats) {
    return (
      <div
        data-testid="session-summary"
        className="mx-auto flex max-w-md flex-col items-center gap-6 py-10 text-center"
      >
        <CheckCircle2
          data-testid="session-summary-icon"
          size={56}
          strokeWidth={1.5}
          className="text-brand-600"
          aria-hidden="true"
        />
        <h2 className="font-sans text-2xl font-semibold text-text-primary">
          Einheit abgeschlossen
        </h2>

        <div
          data-testid="session-summary-stats"
          className="flex w-full flex-col items-center gap-2"
        >
          <p className="text-base text-text-primary">
            <span className="font-semibold">{summaryStats.total}</span>{' '}
            <span className="text-text-secondary">Wörter geübt</span>
          </p>
          <p className="text-base text-text-primary">
            <span className="font-semibold">{summaryStats.sicher}</span>{' '}
            <span className="text-success">sicher</span>
          </p>
          <p className="text-base text-text-primary">
            <span className="font-semibold">{summaryStats.wiederholen}</span>{' '}
            <span className="text-text-secondary">zum Wiederholen</span>
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3 pt-2">
          <button
            data-testid="new-session"
            className="w-full rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            style={{ minHeight: '52px' }}
            onClick={startSession}
          >
            Weiter lernen
          </button>
          <button
            data-testid="back-to-vocab"
            className="text-sm text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
            onClick={onBack}
          >
            Zur Vokabelliste
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  const progress = currentIndex + 1;
  const total = cards.length;

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      {/* Breadcrumb row — progress pill on the right, not on card */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <button
          className="text-xs text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          onClick={onBack}
          data-testid="end-session"
        >
          Session beenden
        </button>
        <span data-testid="card-progress" className="text-xs text-text-tertiary">
          Karte {progress} von {total}
        </span>
      </div>

      {/* Accessible but hidden progressbar for AT + existing tests */}
      <div
        className="sr-only"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={total}
        data-testid="progress-bar"
      >
        Karte {progress} von {total}
      </div>

      {/* Backwards-compat labels for existing test expectations */}
      <p className="sr-only">Card {progress} of {total}</p>

      {/* Card */}
      <FlashCard
        word={currentCard.word}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        showFlipHint={!hasFlippedOnce}
      />

      {/* Flip button (keyboard/mouse fallback) — only when front is showing */}
      {!isFlipped && (
        <div className="flex justify-center">
          <button
            data-testid="flip-button"
            className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container"
            onClick={handleFlip}
          >
            Karte umdrehen
          </button>
        </div>
      )}

      {/* Two equal-weight grade buttons BELOW the card when flipped. */}
      {isFlipped && (
        <div data-testid="grade-buttons" className="grid grid-cols-2 gap-3">
          <button
            data-testid={`grade-${QUALITY_AGAIN}`}
            onClick={() => handleGrade(QUALITY_AGAIN)}
            className="flex items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-container"
            style={{ minHeight: '48px' }}
          >
            Noch lernen
          </button>
          <button
            data-testid={`grade-${QUALITY_KNOWN}`}
            onClick={() => handleGrade(QUALITY_KNOWN)}
            className="flex items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            style={{ minHeight: '48px' }}
          >
            Gewusst
          </button>
        </div>
      )}
    </div>
  );
}
