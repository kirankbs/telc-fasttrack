'use client';

import { ChevronRight } from 'lucide-react';
import type { Level } from '@fastrack/types';
import { LEVEL_CONFIG } from '@fastrack/config';

export type MockCardState = 'not-started' | 'in-progress' | 'completed' | 'coming-soon';

interface MockCardProps {
  href: string;
  level: Level;
  mockNumber: number;
  title: string;
  state: MockCardState;
  /** 0..1 — drives the bottom progress bar in `in-progress` state. */
  progress?: number;
  /** 0..1 — shown as a score pill in `completed` state. */
  score?: number;
  /** Required for `completed` — whether the user passed both aggregates. */
  passed?: boolean;
  /** Count of completed sections vs. total, used for in-progress copy. */
  sectionsCompleted?: number;
  totalSections?: number;
  testId?: string;
}

/**
 * Single mock-exam card. Four visual states, distinguished without relying on
 * color alone (left accent, progress bar, score pill, desaturation). See
 * `.planning/design-system/screens.md` §Screen 2.
 */
export function MockCard({
  href,
  level,
  mockNumber,
  title,
  state,
  progress = 0,
  score,
  passed,
  sectionsCompleted = 0,
  totalSections = 4,
  testId,
}: MockCardProps) {
  const cfg = LEVEL_CONFIG[level];
  const isInteractive = state !== 'coming-soon';

  // Card surface changes with state: completed recedes into surface-container,
  // coming-soon goes near-empty, in-progress gets a left accent bar.
  const baseWrap =
    'group relative block overflow-hidden rounded-xl border border-border p-5 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';
  const stateWrap: Record<MockCardState, string> = {
    'not-started': 'bg-white hover:shadow-md',
    'in-progress': 'bg-white hover:shadow-md',
    completed: 'bg-surface-container hover:shadow-md',
    'coming-soon': 'bg-white cursor-default',
  };

  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const scorePct = score !== undefined ? Math.round(score * 100) : null;

  const Tag: 'a' | 'div' = isInteractive ? 'a' : 'div';

  return (
    <Tag
      {...(isInteractive ? { href } : {})}
      data-testid={testId}
      data-state={state}
      className={`${baseWrap} ${stateWrap[state]}`}
      aria-disabled={!isInteractive || undefined}
    >
      {/* Left accent bar for in-progress — 2px, level color, full height. */}
      {state === 'in-progress' && (
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-[2px]"
          style={{ backgroundColor: cfg.color }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            data-testid="mock-card-level-badge"
            className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white ${
              state === 'coming-soon' ? 'opacity-50' : ''
            }`}
            style={{ backgroundColor: cfg.color }}
          >
            {level}
          </span>
          <h3
            className={`mt-2 text-[17px] font-semibold ${
              state === 'coming-soon' ? 'text-text-tertiary' : 'text-text-primary'
            }`}
          >
            Übungstest {mockNumber}
          </h3>
          <p
            className={`mt-1 line-clamp-2 text-sm ${
              state === 'coming-soon' ? 'text-text-tertiary' : 'text-text-secondary'
            }`}
          >
            {title}
          </p>
        </div>

        {/* Score pill (completed) lives in the top-right slot. */}
        {state === 'completed' && scorePct !== null && (
          <span
            data-testid="mock-card-score"
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              passed
                ? 'bg-pass-surface text-pass'
                : 'bg-fail-surface text-fail'
            }`}
          >
            {scorePct}%
          </span>
        )}

        {/* Chevron only on hover for the not-started / in-progress states. */}
        {isInteractive && (
          <ChevronRight
            aria-hidden
            strokeWidth={1.75}
            className="mt-1 h-5 w-5 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </div>

      {/* Footer line. */}
      <div
        data-testid="mock-card-footer"
        className={`mt-4 text-xs ${
          state === 'coming-soon' ? 'text-text-tertiary' : 'text-text-secondary'
        }`}
      >
        {state === 'not-started' && 'Noch nicht begonnen'}
        {state === 'in-progress' &&
          `${sectionsCompleted} von ${totalSections} Abschnitten`}
        {state === 'completed' && (
          <span className="text-text-tertiary">Vollständig</span>
        )}
        {state === 'coming-soon' && 'Bald verfügbar'}
      </div>

      {/* 3px bottom progress track for in-progress. */}
      {state === 'in-progress' && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-surface-container" aria-hidden>
          <div
            data-testid="mock-card-progress"
            className="h-full transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%`, backgroundColor: cfg.color }}
          />
        </div>
      )}
    </Tag>
  );
}
