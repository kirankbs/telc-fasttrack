'use client';

import type { LucideIcon } from 'lucide-react';

interface SectionIntroProps {
  title: string;
  Icon: LucideIcon;
  totalSeconds: number;
  description: string;
  extraInfo?: string;
  onStart: () => void;
}

export function SectionIntro({
  title,
  Icon,
  totalSeconds,
  description,
  extraInfo,
  onStart,
}: SectionIntroProps) {
  const minutes = Math.round(totalSeconds / 60);

  return (
    <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
      <div className="flex justify-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container"
          aria-hidden
        >
          <Icon className="h-7 w-7 text-text-secondary" strokeWidth={1.75} />
        </span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6 text-left space-y-3">
        <p className="text-sm text-text-secondary">
          Sie haben{' '}
          <span className="font-semibold text-text-primary">{minutes} Minuten</span>.
          Starten Sie den Abschnitt, wenn Sie bereit sind.
        </p>
        {extraInfo && (
          <p className="text-sm text-text-secondary">{extraInfo}</p>
        )}
      </div>
      <button
        data-testid="section-start-btn"
        onClick={onStart}
        className="block h-[52px] w-full rounded-xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Abschnitt starten
      </button>
    </div>
  );
}
