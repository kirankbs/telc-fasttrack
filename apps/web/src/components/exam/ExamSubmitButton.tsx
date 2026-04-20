'use client';

import type { ButtonHTMLAttributes } from 'react';

interface ExamSubmitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  label?: string;
}

export function ExamSubmitButton({
  label = 'Antworten abgeben',
  disabled,
  ...rest
}: ExamSubmitButtonProps) {
  return (
    <button
      type="button"
      data-testid="submit-btn"
      disabled={disabled}
      className="block h-[52px] w-full rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-text-tertiary"
      {...rest}
    >
      {label}
    </button>
  );
}
