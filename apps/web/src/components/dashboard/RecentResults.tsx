'use client';

import Link from 'next/link';
import type { ExamSessionState } from '@/lib/examSession';

const SECTION_KEYS = ['listening', 'reading', 'writing', 'speaking'] as const;

interface RecentResultsProps {
  sessions: ExamSessionState[];
}

export function RecentResults({ sessions }: RecentResultsProps) {
  if (sessions.length === 0) {
    return (
      <div
        data-testid="recent-results-empty"
        className="rounded-xl border border-border bg-white p-8 text-center"
      >
        <p className="text-text-secondary">
          Noch keine Ergebnisse — starte deinen ersten Übungstest!
        </p>
        <Link
          href="/exam"
          data-testid="start-first-exam"
          className="mt-4 inline-block rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-light"
        >
          Übungstest starten
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="recent-results" className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary">
        Letzte Ergebnisse
      </h3>
      <div className="space-y-2">
        {sessions.map((session) => {
          const completedCount = SECTION_KEYS.filter(
            (k) => session.sections[k] != null,
          ).length;

          const scores = SECTION_KEYS.map((k) => session.sections[k]?.score)
            .filter((s): s is NonNullable<typeof s> => s != null);

          const avgPct =
            scores.length > 0
              ? scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length
              : 0;

          const allPassed = completedCount === 4 && scores.every((s) => s.passed);

          return (
            <Link
              key={session.mockId}
              href={`/exam/${session.mockId}/results`}
              data-testid={`result-row-${session.mockId}`}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-5 py-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <div className="font-medium text-text-primary">
                  {session.mockId.replace(/_/g, ' ').replace('mock ', 'Übungstest ')}
                </div>
                <div className="mt-0.5 text-sm text-text-secondary">
                  {completedCount}/4 Sektionen
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary">
                  {Math.round(avgPct * 100)}%
                </span>
                {completedCount === 4 && (
                  <span
                    data-testid={`result-badge-${session.mockId}`}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                      allPassed ? 'bg-pass' : 'bg-fail'
                    }`}
                  >
                    {allPassed ? 'Bestanden' : 'Nicht bestanden'}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
