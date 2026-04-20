'use client';

import { useEffect, useState } from 'react';
import type { Level } from '@fastrack/types';
import { MockCard, type MockCardState } from './MockCard';
import {
  getSession,
  hasAnySection,
  isSessionComplete,
  type ExamSessionState,
} from '@/lib/examSession';

interface MockEntry {
  id: string;
  mockNumber: number;
  title: string;
  hasContent: boolean;
}

interface MockCardListProps {
  level: Level;
  mocks: MockEntry[];
  totalSections: number;
}

/**
 * Reads `sessionStorage` for each mock and derives the card's visual state.
 * Kept client-only because session data is per-device and not available at
 * render time on the server.
 */
export function MockCardList({ level, mocks, totalSections }: MockCardListProps) {
  const [sessions, setSessions] = useState<Record<string, ExamSessionState | null>>({});

  useEffect(() => {
    const next: Record<string, ExamSessionState | null> = {};
    for (const m of mocks) {
      next[m.id] = m.hasContent ? getSession(m.id) : null;
    }
    setSessions(next);
  }, [mocks]);

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="mock-card-grid"
    >
      {mocks.map((mock) => {
        const session = sessions[mock.id] ?? null;

        let state: MockCardState = 'not-started';
        let progress = 0;
        let score: number | undefined;
        let passed: boolean | undefined;
        let completedSections = 0;

        if (!mock.hasContent) {
          state = 'coming-soon';
        } else if (session) {
          const sectionValues = Object.values(session.sections);
          completedSections = sectionValues.length;
          if (isSessionComplete(session)) {
            state = 'completed';
            const written = [
              session.sections.listening,
              session.sections.reading,
              session.sections.sprachbausteine,
              session.sections.writing,
            ].filter(Boolean);
            const oral = session.sections.speaking;
            const aggregate = (subset: typeof written) => {
              const earned = subset.reduce((n, s) => n + (s?.score.earned ?? 0), 0);
              const max = subset.reduce((n, s) => n + (s?.score.max ?? 0), 0);
              return max > 0 ? earned / max : 0;
            };
            const writtenPct = aggregate(written);
            const oralPct = oral ? oral.score.percentage : 0;
            const overallEarned = [...written, oral].reduce(
              (n, s) => n + (s?.score.earned ?? 0),
              0,
            );
            const overallMax = [...written, oral].reduce(
              (n, s) => n + (s?.score.max ?? 0),
              0,
            );
            score = overallMax > 0 ? overallEarned / overallMax : 0;
            passed = writtenPct >= 0.6 && oralPct >= 0.6;
          } else if (hasAnySection(session)) {
            state = 'in-progress';
            progress = totalSections > 0 ? completedSections / totalSections : 0;
          }
        }

        return (
          <MockCard
            key={mock.id}
            href={`/exam/${mock.id}`}
            level={level}
            mockNumber={mock.mockNumber}
            title={mock.title}
            state={state}
            progress={progress}
            score={score}
            passed={passed}
            sectionsCompleted={completedSections}
            totalSections={totalSections}
            testId={`mock-card-${mock.id}`}
          />
        );
      })}
    </div>
  );
}
