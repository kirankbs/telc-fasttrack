'use client';

import { useState, useCallback, useMemo } from 'react';
import { Check, X } from 'lucide-react';
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

// Short-answer pill rendering kicks in for MCQ options where every option
// is compact (≤ 12 chars). Long MCQ options fall back to stacked buttons.
const PILL_MAX_CHARS = 12;

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

  const isPillLayout =
    mcqOptions.length > 0 && mcqOptions.every((o) => o.length <= PILL_MAX_CHARS);

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
        className="rounded-xl border border-border bg-surface p-6 text-center"
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
  const progressPct = ((currentIndex + (isChecked ? 1 : 0)) / total) * 100;

  return (
    <div data-testid="exercise-player" className="space-y-5">
      {/* Progress label + 3px progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            data-testid="exercise-counter"
            className="text-xs font-medium uppercase tracking-wide text-text-tertiary"
          >
            Aufgabe {currentIndex + 1} von {total}
          </span>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-surface-container-hi">
          <div
            data-testid="exercise-progress"
            className="h-[3px] rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <p
        data-testid="exercise-prompt"
        className="font-sans text-lg font-medium leading-relaxed text-text-primary"
        lang="de"
      >
        {exercise.prompt}
      </p>

      {/* Answer input area */}
      {exercise.type === 'mcq' ? (
        isPillLayout ? (
          <div
            data-testid="mcq-pills"
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Answer options"
          >
            {mcqOptions.map((option) => {
              const isSelected = selectedOption === option;
              const showCorrect = isChecked && option === exercise.correctAnswer;
              const showWrong =
                isChecked && isSelected && option !== exercise.correctAnswer;

              let className =
                'border border-border bg-surface text-text-primary hover:bg-surface-container';
              if (showCorrect) {
                className =
                  'border-[1.5px] border-pass bg-pass-surface text-pass';
              } else if (showWrong) {
                className = 'border-[1.5px] border-fail bg-fail-surface text-fail';
              } else if (isSelected && !isChecked) {
                className =
                  'border-[1.5px] border-brand-600 bg-surface-container text-brand-600';
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
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-default ${className}`}
                  style={{ minHeight: '44px', minWidth: '80px' }}
                  role="radio"
                  aria-checked={isSelected}
                >
                  {showCorrect && <Check size={14} aria-hidden="true" />}
                  {showWrong && <X size={14} aria-hidden="true" />}
                  <span lang="de">{option}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2" role="radiogroup" aria-label="Answer options">
            {mcqOptions.map((option) => {
              const isSelected = selectedOption === option;
              const showCorrect = isChecked && option === exercise.correctAnswer;
              const showWrong =
                isChecked && isSelected && option !== exercise.correctAnswer;

              let className =
                'border border-border bg-surface text-text-primary';
              if (showCorrect) {
                className =
                  'border-[1.5px] border-pass bg-pass-surface text-pass';
              } else if (showWrong) {
                className = 'border-[1.5px] border-fail bg-fail-surface text-fail';
              } else if (isSelected && !isChecked) {
                className =
                  'border-[1.5px] border-brand-600 bg-surface-container text-brand-600';
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
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${className}`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  {showCorrect && <Check size={16} aria-hidden="true" />}
                  {showWrong && <X size={16} aria-hidden="true" />}
                  <span lang="de">{option}</span>
                </button>
              );
            })}
          </div>
        )
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
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-container disabled:cursor-default"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hasAnswer && !isChecked) handleCheck();
          }}
          lang="de"
        />
      )}

      {/* Feedback */}
      {isChecked && result && (
        <div
          data-testid={`exercise-feedback-${result.isCorrect ? 'correct' : 'incorrect'}`}
          className={`rounded-lg p-4 ${
            result.isCorrect ? 'bg-pass-surface' : 'bg-fail-surface'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.isCorrect ? (
              <Check
                size={18}
                className="text-pass"
                aria-hidden="true"
                strokeWidth={2.5}
              />
            ) : (
              <X
                size={18}
                className="text-fail"
                aria-hidden="true"
                strokeWidth={2.5}
              />
            )}
            <span
              className={`font-semibold ${
                result.isCorrect ? 'text-pass' : 'text-fail'
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
          <p className="mt-1 text-sm text-text-secondary">{exercise.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isChecked ? (
          <button
            data-testid="check-button"
            onClick={handleCheck}
            disabled={!hasAnswer}
            className="rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ minHeight: '48px' }}
          >
            Prüfen
          </button>
        ) : (
          <button
            data-testid="next-button"
            onClick={handleNext}
            className="w-full rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            style={{ minHeight: '48px' }}
          >
            {isLast ? 'Abschluss' : 'Nächste Aufgabe'}
          </button>
        )}
      </div>
    </div>
  );
}
