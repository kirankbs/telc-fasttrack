'use client';

import { useState, useMemo } from 'react';
import type { Level } from '@fastrack/types';
import { LEVEL_CONFIG } from '@fastrack/config';
import { getReadinessLevel } from '@fastrack/core';
import { getMocksForLevel } from '@fastrack/content';
import { SECTION_DURATIONS } from '@fastrack/core';
import {
  getSession,
  hasAnySection,
  isSessionComplete,
} from '@/lib/examSession';
import type { ExamSessionState } from '@/lib/examSession';
import { ReadinessGauge } from './ReadinessGauge';
import { QuickActions } from './QuickActions';
import { RecentResults } from './RecentResults';
import { StudyStats } from './StudyStats';

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const SECTION_KEYS = ['listening', 'reading', 'writing', 'speaking'] as const;

function computeDashboardData(level: Level) {
  const mocks = getMocksForLevel(level);
  const sessions: ExamSessionState[] = [];

  for (const mock of mocks) {
    const session = getSession(mock.id);
    if (session && hasAnySection(session)) {
      sessions.push(session);
    }
  }

  const completedMocks = sessions.filter((s) => isSessionComplete(s)).length;

  let totalSectionsCompleted = 0;
  let totalScore = 0;
  let scoredSections = 0;
  let estimatedMinutes = 0;

  const durations = SECTION_DURATIONS[level];

  for (const session of sessions) {
    for (const key of SECTION_KEYS) {
      const section = session.sections[key];
      if (section != null) {
        totalSectionsCompleted++;
        totalScore += section.score.percentage;
        scoredSections++;
        estimatedMinutes += Math.round(durations[key] / 60);
      }
    }
  }

  const averageScore = scoredSections > 0 ? totalScore / scoredSections : 0;
  const readiness = getReadinessLevel(averageScore);

  // "Weiter lernen" — find the most recently started incomplete mock
  let continueHref = '/exam';
  const incompleteSessions = sessions
    .filter((s) => !isSessionComplete(s))
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

  if (incompleteSessions.length > 0) {
    continueHref = `/exam/${incompleteSessions[0].mockId}`;
  }

  // Sort recent results by startedAt descending
  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  return {
    sessions: sortedSessions,
    completedMocks,
    totalMocks: mocks.length,
    totalSectionsCompleted,
    averageScore,
    estimatedMinutes,
    readiness,
    continueHref,
  };
}

export function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1');

  const data = useMemo(
    () => computeDashboardData(selectedLevel),
    [selectedLevel],
  );

  return (
    <div data-testid="dashboard" className="space-y-6">
      {/* Level tabs */}
      <div data-testid="level-tabs" className="flex gap-2">
        {LEVELS.map((level) => {
          const cfg = LEVEL_CONFIG[level];
          const isActive = level === selectedLevel;
          return (
            <button
              key={level}
              data-testid={`level-tab-${level}`}
              onClick={() => setSelectedLevel(level)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-white'
                  : 'border border-border bg-white text-text-secondary hover:bg-surface-container'
              }`}
              style={isActive ? { backgroundColor: cfg.color } : undefined}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Top row: readiness + stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReadinessGauge level={data.readiness} percentage={data.averageScore} />
        <div className="flex flex-col justify-center rounded-xl border border-border bg-white p-6">
          <div className="text-sm text-text-secondary">Übungstests</div>
          <div
            data-testid="completed-mocks"
            className="mt-1 text-3xl font-bold text-text-primary"
          >
            {data.completedMocks} / {data.totalMocks}
          </div>
          <div className="mt-1 text-sm text-text-secondary">
            Übungstests abgeschlossen
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <QuickActions continueHref={data.continueHref} />

      {/* Study stats */}
      <StudyStats
        completedMocks={data.completedMocks}
        totalMocks={data.totalMocks}
        sectionsCompleted={data.totalSectionsCompleted}
        averageScore={data.averageScore}
        estimatedMinutes={data.estimatedMinutes}
      />

      {/* Recent results */}
      <RecentResults sessions={data.sessions} />
    </div>
  );
}
