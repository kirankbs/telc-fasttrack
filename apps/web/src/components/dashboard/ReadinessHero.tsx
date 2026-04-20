'use client';

import Link from 'next/link';
import type { ReadinessLevel } from '@fastrack/core';
import type { Level } from '@fastrack/types';
import { StageTrack } from './StageTrack';
import { LEVEL_SOLID_BG } from './levelClasses';

/**
 * Named-stage copy only — per brand rules, no percentage appears on the
 * dashboard readiness display. See `.planning/design-system/screens.md`.
 */
const STAGE_NAMES: Record<ReadinessLevel, string> = {
  building: 'Building foundation',
  developing: 'Developing skills',
  almost: 'Nearly ready',
  ready: 'Exam ready',
};

const STAGE_NUDGE: Record<ReadinessLevel, string> = {
  building:
    'Starte deinen ersten Übungstest, um ein Gefühl für die Prüfung zu bekommen.',
  developing:
    'Mach weiter — ein paar Übungstests mehr bringen dich auf die nächste Stufe.',
  almost:
    'Du bist nah dran. Arbeite gezielt an schwächeren Sektionen, um die Mindestpunktzahl in beiden Teilen zu erreichen.',
  ready:
    'Du bist bereit für die Prüfung. Wiederhole Schwachstellen, bleib in Form.',
};

export interface ReadinessHeroProps {
  activeLevel: Level;
  readiness: ReadinessLevel;
  completedMocks: number;
  totalMocks: number;
  continueHref: string;
  /**
   * Mock number (1-based) to display in the CTA. Source depends on state:
   *   - in-progress: next incomplete session's mockNumber
   *   - not-all-done: first not-yet-started mockNumber
   *   - none-started/all-done: 1
   */
  ctaMockNumber: number;
  /** True if the user has started at least one mock but not finished it. */
  hasInProgress: boolean;
}

export function ReadinessHero({
  activeLevel,
  readiness,
  completedMocks,
  totalMocks,
  continueHref,
  ctaMockNumber,
  hasInProgress,
}: ReadinessHeroProps) {
  const stageName = STAGE_NAMES[readiness];
  const nudge = STAGE_NUDGE[readiness];
  const accentClass = LEVEL_SOLID_BG[activeLevel];

  const ctaLabel = buildCtaLabel({
    completedMocks,
    totalMocks,
    ctaMockNumber,
    hasInProgress,
  });

  return (
    <section
      data-testid="readiness-hero"
      aria-labelledby="readiness-hero-stage"
      className="relative overflow-hidden rounded-xl border border-border bg-surface p-7 md:p-8"
    >
      {/* 4px vertical accent bar in active level color */}
      <div
        aria-hidden
        data-testid="readiness-hero-accent"
        className={`absolute top-0 bottom-0 left-0 w-1 ${accentClass}`}
      />

      <div className="grid gap-6 md:grid-cols-5 md:gap-8">
        {/* Left column — label, stage, nudge, CTA */}
        <div className="md:col-span-3">
          <p
            data-testid="readiness-caption"
            className="text-[12px] font-medium uppercase tracking-wider text-text-secondary"
          >
            Prüfungsbereitschaft
          </p>
          <h2
            id="readiness-hero-stage"
            data-testid="readiness-stage-name"
            className="mt-2 font-display text-[30px] leading-tight text-text-primary md:text-[34px]"
          >
            {stageName}
          </h2>
          <p
            data-testid="readiness-nudge"
            className="mt-3 max-w-[44ch] text-sm text-text-secondary"
          >
            {nudge}
          </p>
          <Link
            href={continueHref}
            data-testid="readiness-cta"
            className="mt-6 inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-brand-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {ctaLabel}
          </Link>
        </div>

        {/* Right column — horizontal stage track with labels */}
        <div className="flex items-center md:col-span-2">
          <StageTrack active={readiness} fillClassName={accentClass} />
        </div>
      </div>
    </section>
  );
}

function buildCtaLabel({
  completedMocks,
  totalMocks,
  ctaMockNumber,
  hasInProgress,
}: {
  completedMocks: number;
  totalMocks: number;
  ctaMockNumber: number;
  hasInProgress: boolean;
}): string {
  if (completedMocks === 0 && !hasInProgress) {
    return 'Start your first exam';
  }
  if (completedMocks >= totalMocks) {
    // Everything done — loop to review
    return `Wiederholen: Übungstest ${ctaMockNumber}`;
  }
  if (hasInProgress) {
    return `Continue: Übungstest ${ctaMockNumber}`;
  }
  return `Next: Übungstest ${ctaMockNumber}`;
}
