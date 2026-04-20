'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Level } from '@fastrack/types';
import { LEVEL_CONFIG } from '@fastrack/config';
import { ExamTimer } from './ExamTimer';

interface ExamRunnerHeaderProps {
  sectionName: string;
  partLabel?: string;
  totalSeconds: number;
  isRunning: boolean;
  onExpire?: () => void;
  exitHref: string;
  level: Level;
  /** 0..1 — fills the 3px accent bar below the header. */
  progress?: number;
}

/**
 * Unified top chrome for the five *Exam runners. Single 3-column flex row
 * (X + label | section | timer) over a 3px progress bar in the active
 * level color. See `.planning/design-system/screens.md` §Screen 4.
 */
export function ExamRunnerHeader({
  sectionName,
  partLabel,
  totalSeconds,
  isRunning,
  onExpire,
  exitHref,
  level,
  progress = 0,
}: ExamRunnerHeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const levelCfg = LEVEL_CONFIG[level];
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div className="-mx-4 mb-6 border-b border-border bg-white sm:mx-0 sm:rounded-t-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          data-testid="exam-exit-btn"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span>Prüfung beenden</span>
        </button>

        <div
          className="min-w-0 flex-1 truncate text-center text-sm font-medium text-text-primary"
          data-testid="exam-header-title"
        >
          {sectionName}
          {partLabel ? <span className="text-text-secondary"> — {partLabel}</span> : null}
        </div>

        <ExamTimer
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          onExpire={onExpire}
        />
      </div>

      {/* 3px progress bar — fills in level color, no label. */}
      <div
        className="h-[3px] w-full rounded-full bg-surface-container"
        aria-hidden
      >
        <div
          data-testid="exam-progress-bar"
          className="h-full rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%`, backgroundColor: levelCfg.color }}
        />
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="exam-exit-dialog"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-base font-semibold text-text-primary">
              Prüfung wirklich beenden?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Dein Fortschritt in diesem Abschnitt geht verloren.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:border-border-hover"
              >
                Weitermachen
              </button>
              <a
                href={exitHref}
                data-testid="exam-exit-confirm"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Beenden
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
