'use client';

import Link from 'next/link';
import type { Level } from '@fastrack/types';
import type { ExamSessionState } from '@/lib/examSession';
import { LEVEL_SOLID_BG } from './levelClasses';

const WRITTEN_KEYS = ['listening', 'reading', 'writing', 'sprachbausteine'] as const;

interface RecentResultsProps {
  sessions: ExamSessionState[];
  activeLevel: Level;
}

export function RecentResults({ sessions, activeLevel }: RecentResultsProps) {
  if (sessions.length === 0) {
    return (
      <section
        data-testid="recent-results-empty"
        className="rounded-xl border border-border bg-surface p-6 text-left"
      >
        <p className="text-sm text-text-secondary">
          Noch keine Ergebnisse — starte deinen ersten Übungstest!
        </p>
        <Link
          href="/exam"
          data-testid="recent-results-empty-cta"
          className="mt-4 inline-flex h-10 min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Übungstest starten
        </Link>
      </section>
    );
  }

  const pillBg = LEVEL_SOLID_BG[activeLevel];

  return (
    <section data-testid="recent-results" aria-labelledby="recent-results-heading">
      <h3
        id="recent-results-heading"
        className="mb-3 text-sm font-medium text-text-primary"
      >
        Zuletzt geübt
      </h3>
      <div className="space-y-2">
        {sessions.map((session) => {
          const writtenScores = WRITTEN_KEYS
            .map((k) => session.sections[k]?.score)
            .filter((s): s is NonNullable<typeof s> => s != null);

          const oralScore = session.sections.speaking?.score;

          const writtenPct = writtenScores.length
            ? writtenScores.reduce((sum, s) => sum + s.percentage, 0) /
              writtenScores.length
            : null;
          const writtenPassed = writtenScores.length
            ? writtenScores.every((s) => s.passed)
            : null;

          const oralPct = oralScore?.percentage ?? null;
          const oralPassed = oralScore?.passed ?? null;

          const mockNumber = session.mockId.split('_mock_')[1] ?? '?';

          return (
            <Link
              key={session.mockId}
              href={`/exam/${session.mockId}/results`}
              data-testid={`result-row-${session.mockId}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-5 py-4 transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${pillBg}`}
                >
                  {session.level}
                </span>
                <span className="truncate text-sm font-medium text-text-primary">
                  Übungstest {Number(mockNumber) || mockNumber}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-[12px] text-text-secondary">
                <ScoreDot
                  testId={`result-${session.mockId}-written`}
                  label="Schriftlich"
                  pct={writtenPct}
                  passed={writtenPassed}
                />
                <span aria-hidden className="text-text-tertiary">
                  •
                </span>
                <ScoreDot
                  testId={`result-${session.mockId}-oral`}
                  label="Mündlich"
                  pct={oralPct}
                  passed={oralPassed}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ScoreDot({
  testId,
  label,
  pct,
  passed,
}: {
  testId: string;
  label: string;
  pct: number | null;
  passed: boolean | null;
}) {
  if (pct == null) {
    return (
      <span data-testid={testId} className="inline-flex items-center gap-1.5">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-surface-container-hi"
        />
        <span>{label} —</span>
      </span>
    );
  }

  const dotClass = passed ? 'bg-pass' : 'bg-fail';
  return (
    <span data-testid={testId} className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`inline-block h-2 w-2 rounded-full ${dotClass}`}
      />
      <span>
        {label} {Math.round(pct * 100)}%
      </span>
    </span>
  );
}
