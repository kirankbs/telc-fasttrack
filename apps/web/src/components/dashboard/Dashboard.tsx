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
import { ReadinessHero } from './ReadinessHero';
import { RecentResults } from './RecentResults';
import { StudyStats } from './StudyStats';
import { LEVEL_SOLID_BG, LEVEL_TEXT } from './levelClasses';

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const ALL_SECTION_KEYS = [
  'listening',
  'reading',
  'sprachbausteine',
  'writing',
  'speaking',
] as const;

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

  let totalScore = 0;
  let scoredSections = 0;
  let estimatedMinutes = 0;

  const durations = SECTION_DURATIONS[level] as Partial<
    Record<(typeof ALL_SECTION_KEYS)[number], number>
  >;

  for (const session of sessions) {
    for (const key of ALL_SECTION_KEYS) {
      const section = session.sections[key];
      if (section != null) {
        totalScore += section.score.percentage;
        scoredSections++;
        const dur = durations[key];
        if (typeof dur === 'number') {
          estimatedMinutes += Math.round(dur / 60);
        }
      }
    }
  }

  const averageScore = scoredSections > 0 ? totalScore / scoredSections : 0;
  const readiness = getReadinessLevel(averageScore);

  // In-progress session = started but not all 4 required sections complete.
  const incompleteSessions = sessions
    .filter((s) => !isSessionComplete(s))
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

  const hasInProgress = incompleteSessions.length > 0;

  // CTA mock number:
  //   1. In-progress → resume that one
  //   2. Otherwise → first mock number not yet started
  //   3. If all started → 1
  let ctaMockNumber = 1;
  let continueHref = '/exam';

  if (hasInProgress) {
    const s = incompleteSessions[0];
    ctaMockNumber = mocks.find((m) => m.id === s.mockId)?.mockNumber ?? 1;
    continueHref = `/exam/${s.mockId}`;
  } else {
    const startedIds = new Set(sessions.map((s) => s.mockId));
    const nextMock = mocks.find((m) => !startedIds.has(m.id));
    if (nextMock) {
      ctaMockNumber = nextMock.mockNumber;
      continueHref = `/exam/${nextMock.id}`;
    } else {
      // all started & complete — loop back to first for review
      ctaMockNumber = 1;
      continueHref = mocks[0] ? `/exam/${mocks[0].id}` : '/exam';
    }
  }

  // Week grid — Mon..Sun booleans for current week (local time).
  const studiedDays = computeStudiedDays(sessions);

  // Recent results sort
  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  return {
    sessions: sortedSessions,
    completedMocks,
    totalMocks: mocks.length,
    averageScore,
    averageSampleSize: sessions.length,
    estimatedMinutes,
    readiness,
    continueHref,
    ctaMockNumber,
    hasInProgress,
    studiedDays,
  };
}

/**
 * Derive Mon..Sun booleans for the user's current week from every section's
 * `submittedAt`. Falls back silently if dates are unparsable.
 */
function computeStudiedDays(sessions: ExamSessionState[]): boolean[] {
  const days = [false, false, false, false, false, false, false];
  const { monday, nextMonday } = getCurrentWeekBounds();

  for (const s of sessions) {
    for (const key of ALL_SECTION_KEYS) {
      const sec = s.sections[key];
      if (!sec?.submittedAt) continue;
      const t = new Date(sec.submittedAt).getTime();
      if (!Number.isFinite(t)) continue;
      if (t < monday.getTime() || t >= nextMonday.getTime()) continue;
      const dow = dayOfWeekMonFirst(new Date(t));
      days[dow] = true;
    }
  }
  return days;
}

function getCurrentWeekBounds(now: Date = new Date()): {
  monday: Date;
  nextMonday: Date;
} {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  const jsDow = monday.getDay(); // 0=Sun..6=Sat
  const delta = jsDow === 0 ? -6 : 1 - jsDow; // roll back to Monday
  monday.setDate(monday.getDate() + delta);
  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  return { monday, nextMonday };
}

function dayOfWeekMonFirst(d: Date): number {
  const js = d.getDay(); // 0=Sun
  return js === 0 ? 6 : js - 1;
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
      <div data-testid="level-tabs" className="flex flex-wrap gap-2">
        {LEVELS.map((level) => {
          const cfg = LEVEL_CONFIG[level];
          const isActive = level === selectedLevel;
          const activeBg = LEVEL_SOLID_BG[level];
          const inactiveText = LEVEL_TEXT[level];
          void cfg;
          return (
            <button
              key={level}
              type="button"
              data-testid={`level-tab-${level}`}
              data-active={isActive}
              aria-pressed={isActive}
              onClick={() => setSelectedLevel(level)}
              className={`inline-flex h-11 min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive
                  ? `${activeBg} text-white`
                  : `border border-border bg-surface ${inactiveText} hover:bg-surface-container`
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Hero row — replaces ReadinessGauge + mock counter + QuickActions CTA */}
      <ReadinessHero
        activeLevel={selectedLevel}
        readiness={data.readiness}
        completedMocks={data.completedMocks}
        totalMocks={data.totalMocks}
        continueHref={data.continueHref}
        ctaMockNumber={data.ctaMockNumber}
        hasInProgress={data.hasInProgress}
      />

      {/* Stats row — 3 cards */}
      <StudyStats
        activeLevel={selectedLevel}
        completedMocks={data.completedMocks}
        totalMocks={data.totalMocks}
        averageScore={data.averageScore}
        averageSampleSize={data.averageSampleSize}
        estimatedMinutes={data.estimatedMinutes}
        studiedDays={data.studiedDays}
      />

      {/* Recent results */}
      <RecentResults sessions={data.sessions} activeLevel={selectedLevel} />
    </div>
  );
}
