'use client';

import { useState, useCallback, useMemo } from 'react';
import type { GrammarExercise } from '@fastrack/types';

interface ExercisePlayerProps {
  exercises: GrammarExercise[];
  topicName: string;
  onComplete?: () => void;
}

type ExerciseState = 'idle' | 'answered' | 'checked';

interface CheckedResult {
  isCorrect: boolean;
  userAnswer: string;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function buildMcqOptions(
  exercise: GrammarExercise,
  allExercises: GrammarExercise[],
): string[] {
  const correct = exercise.correctAnswer;
  const pool = allExercises
    .filter((e) => e.correctAnswer !== correct)
    .map((e) => e.correctAnswer);

  const uniquePool = Array.from(new Set(pool));
  const distractors: string[] = [];

  // pick up to 2 distractors from pool
  const shuffled = uniquePool.sort(() => Math.random() - 0.5);
  for (const d of shuffled) {
    if (distractors.length >= 2) break;
    distractors.push(d);
  }

  // fallback generic distractors
  const fallbacks = ['ist', 'hat', 'kann'];
  for (const f of fallbacks) {
    if (distractors.length >= 2) break;
    if (f !== correct && !distractors.includes(f)) {
      distractors.push(f);
    }
  }

  const options = [correct, ...distractors];
  return options.sort(() => Math.random() - 0.5);
}

export function ExercisePlayer({
  exercises,
  topicName,
  onComplete,
}: ExercisePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [state, setState] = useState<ExerciseState>('idle');
  const [result, setResult] = useState<CheckedResult | null>(null);
  const [results, setResults] = useState<CheckedResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const exercise = exercises[currentIndex];
  const total = exercises.length;
  const isLast = currentIndex === total - 1;

  const mcqOptions = useMemo(() => {
    if (exercise?.type === 'mcq') {
      return buildMcqOptions(exercise, exercises);
    }
    return [];
    // intentionally only recalculate when exercise index changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleCheck = useCallback(() => {
    if (!exercise) return;
    const answer = exercise.type === 'mcq' ? (selectedOption ?? '') : userAnswer;
    const isCorrect = normalize(answer) === normalize(exercise.correctAnswer);
    const checked: CheckedResult = { isCorrect, userAnswer: answer };
    setResult(checked);
    setResults((prev) => [...prev, checked]);
    setState('checked');
  }, [exercise, selectedOption, userAnswer]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setShowSummary(true);
      onComplete?.();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setUserAnswer('');
    setSelectedOption(null);
    setState('idle');
    setResult(null);
  }, [isLast, onComplete]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setState('idle');
    setResult(null);
    setResults([]);
    setShowSummary(false);
  }, []);

  if (showSummary) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const pct = Math.round((correctCount / total) * 100);

    return (
      <div
        data-testid="exercise-summary"
        className="rounded-xl border border-border bg-white p-6 text-center"
      >
        <h3 className="text-lg font-semibold text-text-primary">
          Ergebnis — {topicName}
        </h3>
        <p
          data-testid="exercise-score"
          className="mt-3 text-2xl font-bold text-text-primary"
        >
          {correctCount} / {total} richtig ({pct}%)
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            data-testid="retry-button"
            onClick={handleRetry}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container"
          >
            Nochmal üben
          </button>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const hasAnswer =
    exercise.type === 'mcq' ? selectedOption !== null : userAnswer.trim().length > 0;
  const isChecked = state === 'checked';

  return (
    <div data-testid="exercise-player" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Übungen</h2>
        <span
          data-testid="exercise-counter"
          className="text-sm font-medium text-text-secondary"
        >
          Übung {currentIndex + 1} von {total}
        </span>
      </div>

      {/* progress bar */}
      <div className="h-1.5 w-full rounded-full bg-surface-container">
        <div
          data-testid="exercise-progress"
          className="h-1.5 rounded-full bg-brand-primary transition-all"
          style={{ width: `${((currentIndex + (isChecked ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* prompt */}
      <div className="rounded-xl border border-border bg-white p-5">
        <p
          data-testid="exercise-prompt"
          className="text-text-primary font-medium leading-relaxed"
        >
          {exercise.prompt}
        </p>

        {/* input area */}
        <div className="mt-4">
          {exercise.type === 'mcq' ? (
            <div className="space-y-2" role="radiogroup" aria-label="Answer options">
              {mcqOptions.map((option) => {
                const isSelected = selectedOption === option;
                const showCorrect = isChecked && option === exercise.correctAnswer;
                const showWrong =
                  isChecked && isSelected && option !== exercise.correctAnswer;

                let borderClass = 'border-border';
                let bgClass = 'bg-white';
                if (showCorrect) {
                  borderClass = 'border-success';
                  bgClass = 'bg-success-light';
                } else if (showWrong) {
                  borderClass = 'border-error';
                  bgClass = 'bg-error-light';
                } else if (isSelected && !isChecked) {
                  borderClass = 'border-brand-primary';
                  bgClass = 'bg-brand-primary-surface';
                }

                return (
                  <button
                    key={option}
                    data-testid={`mcq-option-${option}`}
                    disabled={isChecked}
                    onClick={() => {
                      setSelectedOption(option);
                      setState('answered');
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors ${borderClass} ${bgClass} disabled:cursor-default`}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : 'border-border bg-white'
                      }`}
                    >
                      {showCorrect && '✓'}
                      {showWrong && '✗'}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              data-testid="exercise-input"
              type="text"
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                if (state === 'idle') setState('answered');
              }}
              disabled={isChecked}
              placeholder="Antwort eingeben..."
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-surface-container disabled:cursor-default"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasAnswer && !isChecked) handleCheck();
              }}
            />
          )}
        </div>

        {/* feedback */}
        {isChecked && result && (
          <div
            data-testid={`exercise-feedback-${result.isCorrect ? 'correct' : 'incorrect'}`}
            className={`mt-4 rounded-lg p-4 ${
              result.isCorrect
                ? 'bg-success-light'
                : 'bg-error-light'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {result.isCorrect ? '✓' : '✗'}
              </span>
              <span
                className={`font-semibold ${
                  result.isCorrect ? 'text-success' : 'text-error'
                }`}
              >
                {result.isCorrect ? 'Richtig!' : 'Leider falsch'}
              </span>
            </div>
            {!result.isCorrect && (
              <p className="mt-1 text-sm text-text-primary">
                Richtige Antwort: <strong>{exercise.correctAnswer}</strong>
              </p>
            )}
            <p className="mt-1 text-sm text-text-secondary">
              {exercise.explanation}
            </p>
          </div>
        )}

        {/* action buttons */}
        <div className="mt-4 flex gap-3">
          {!isChecked ? (
            <button
              data-testid="check-button"
              onClick={handleCheck}
              disabled={!hasAnswer}
              className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prüfen
            </button>
          ) : (
            <button
              data-testid="next-button"
              onClick={handleNext}
              className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-light"
            >
              {isLast ? 'Ergebnis anzeigen' : 'Weiter'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
