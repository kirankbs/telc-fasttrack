'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { calculateNextReview, getQualityLabel } from '@fastrack/core';
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

interface GradeButton {
  quality: number;
  label: string;
  className: string;
}

const GRADE_BUTTONS: GradeButton[] = [
  { quality: 0, label: 'Again', className: 'bg-error text-white hover:opacity-90' },
  { quality: 2, label: 'Hard', className: 'bg-warning text-white hover:opacity-90' },
  { quality: 3, label: 'Good', className: 'bg-level-a2 text-white hover:opacity-90' },
  { quality: 5, label: 'Easy', className: 'bg-success text-white hover:opacity-90' },
];

const SESSION_SIZE = 20;

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
    setState('active');
  }, [allWords]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
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
    const breakdown: Record<string, number> = { Again: 0, Hard: 0, Good: 0, Easy: 0 };
    let totalEase = 0;

    for (const card of graded) {
      const label = getQualityLabel(card.gradedQuality!);
      breakdown[label] = (breakdown[label] ?? 0) + 1;
      totalEase += card.easeFactor;
    }

    return {
      total: graded.length,
      breakdown,
      avgEase: graded.length > 0 ? (totalEase / graded.length).toFixed(2) : '0.00',
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
          {allWords.length} words available. Each session reviews {Math.min(SESSION_SIZE, allWords.length)} random cards.
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
      <div data-testid="session-summary" className="mx-auto max-w-md space-y-6 py-8">
        <h2 className="text-center text-xl font-bold text-text-primary">Session Complete</h2>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Cards reviewed</span>
              <span className="font-bold text-text-primary">{summaryStats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Avg. ease factor</span>
              <span className="font-bold text-text-primary">{summaryStats.avgEase}</span>
            </div>

            <hr className="border-border" />

            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Breakdown</p>
              {Object.entries(summaryStats.breakdown).map(([label, count]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{label}</span>
                  <span className="text-sm font-medium text-text-primary">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            data-testid="new-session"
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: levelColor }}
            onClick={startSession}
          >
            New Session
          </button>
          <button
            data-testid="back-to-vocab"
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container"
            onClick={onBack}
          >
            Back to Vocabulary
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  const progress = currentIndex + 1;
  const total = cards.length;
  const progressPercent = (progress / total) * 100;

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Card {progress} of {total}</span>
          <button
            className="text-xs text-text-secondary underline hover:text-text-primary"
            onClick={onBack}
          >
            End session
          </button>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-surface-container"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={total}
          data-testid="progress-bar"
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, backgroundColor: levelColor }}
          />
        </div>
      </div>

      {/* Card */}
      <FlashCard
        word={currentCard.word}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      {/* Flip button (explicit) */}
      {!isFlipped && (
        <div className="flex justify-center">
          <button
            data-testid="flip-button"
            className="rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container"
            onClick={handleFlip}
          >
            Show Answer
          </button>
        </div>
      )}

      {/* Grade buttons — visible only when flipped */}
      {isFlipped && (
        <div className="space-y-2">
          <p className="text-center text-xs text-text-secondary">How well did you know this?</p>
          <div data-testid="grade-buttons" className="grid grid-cols-4 gap-2">
            {GRADE_BUTTONS.map((btn) => (
              <button
                key={btn.quality}
                data-testid={`grade-${btn.quality}`}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${btn.className}`}
                onClick={() => handleGrade(btn.quality)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
