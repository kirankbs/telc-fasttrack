'use client';

import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';

type AnswerState =
  | 'default'
  | 'selected'
  | 'correct'
  | 'wrong'
  | 'correctUnselected';

interface AnswerOptionProps {
  name: string;
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
  testId?: string;
  /** Post-submit state override. Leave undefined during active phase. */
  review?: {
    isCorrect: boolean;
    userPicked: boolean;
  };
  disabled?: boolean;
}

/**
 * Shared exam answer option. Selection uses a 4px left accent bar rather than
 * filling the entire row — per `.planning/design-system/screens.md` §Screen 4
 * the brand-filled approach was too heavy and read as a correctness signal.
 *
 * Post-submit states:
 *  - correct + picked       → pass-surface + pass border + Check
 *  - wrong + picked         → fail-surface + fail border + X
 *  - correct + not picked   → pass-surface + pass border (reveals answer)
 */
export function AnswerOption({
  name,
  value,
  selected,
  onChange,
  children,
  testId,
  review,
  disabled,
}: AnswerOptionProps) {
  let state: AnswerState = 'default';
  if (review) {
    if (review.isCorrect && review.userPicked) state = 'correct';
    else if (!review.isCorrect && review.userPicked) state = 'wrong';
    else if (review.isCorrect && !review.userPicked) state = 'correctUnselected';
  } else if (selected) {
    state = 'selected';
  }

  const base =
    'relative flex min-h-[48px] w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 pl-5 transition-colors';

  const toneByState: Record<AnswerState, string> = {
    default: 'border-border bg-white hover:border-border-hover',
    selected:
      'border-border bg-surface-container border-l-[4px] border-l-brand-500 pl-[calc(1.25rem-3px)]',
    correct:
      'border-border bg-pass-surface border-l-[4px] border-l-pass pl-[calc(1.25rem-3px)]',
    wrong:
      'border-border bg-fail-surface border-l-[4px] border-l-fail pl-[calc(1.25rem-3px)]',
    correctUnselected:
      'border-border bg-pass-surface border-l-[4px] border-l-pass pl-[calc(1.25rem-3px)]',
  };

  const isReviewing = Boolean(review);

  return (
    <label
      data-testid={testId}
      data-state={state}
      className={`${base} ${toneByState[state]} ${
        isReviewing || disabled ? 'cursor-default' : ''
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        disabled={isReviewing || disabled}
        className="h-4 w-4 shrink-0 accent-brand-500"
      />
      <span className="flex-1 text-[15px] leading-snug text-text-primary">
        {children}
      </span>
      {state === 'correct' && (
        <Check className="h-5 w-5 shrink-0 text-pass" strokeWidth={2.25} aria-hidden />
      )}
      {state === 'wrong' && (
        <X className="h-5 w-5 shrink-0 text-fail" strokeWidth={2.25} aria-hidden />
      )}
      {state === 'correctUnselected' && (
        <Check className="h-5 w-5 shrink-0 text-pass" strokeWidth={2.25} aria-hidden />
      )}
    </label>
  );
}
