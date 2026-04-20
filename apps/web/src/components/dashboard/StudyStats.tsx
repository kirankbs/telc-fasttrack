'use client';

import type { Level } from '@fastrack/types';
import { WeekGrid } from './WeekGrid';
import { LEVEL_SOLID_BG } from './levelClasses';

interface StudyStatsProps {
  activeLevel: Level;
  completedMocks: number;
  totalMocks: number;
  averageScore: number;
  /** Number of scored sections used to compute `averageScore`. */
  averageSampleSize: number;
  estimatedMinutes: number;
  /** 7-length array of Mon..Sun booleans for the current week. */
  studiedDays: readonly boolean[];
}

export function StudyStats({
  activeLevel,
  completedMocks,
  totalMocks,
  averageScore,
  averageSampleSize,
  estimatedMinutes,
  studiedDays,
}: StudyStatsProps) {
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;
  const timeDisplay = formatTime(hours, mins);
  const fillClass = LEVEL_SOLID_BG[activeLevel];

  const mockPct =
    totalMocks === 0 ? 0 : Math.min(100, (completedMocks / totalMocks) * 100);

  return (
    <div data-testid="study-stats" aria-label="Lernstatistik">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Card 1 — Übungstests */}
        <div
          data-testid="stat-mocks"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="text-[12px] font-medium text-text-secondary">
            Übungstests
          </div>
          <div className="mt-1 text-[28px] font-bold leading-tight text-text-primary">
            {completedMocks} / {totalMocks}
          </div>
          <div
            data-testid="stat-mocks-track"
            className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-container-hi"
          >
            <div
              data-testid="stat-mocks-fill"
              className={`h-full rounded-full transition-[width] ${fillClass}`}
              style={{ width: `${mockPct}%` }}
            />
          </div>
          <div className="mt-2 text-[12px] text-text-secondary">
            abgeschlossen
          </div>
        </div>

        {/* Card 2 — Durchschnitt */}
        <div
          data-testid="stat-average"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="text-[12px] font-medium text-text-secondary">
            Durchschnitt
          </div>
          {completedMocks < 2 ? (
            <div
              data-testid="stat-average-empty"
              className="mt-1 text-sm text-text-secondary"
            >
              Noch nicht genug Daten
            </div>
          ) : (
            <>
              <div
                data-testid="stat-average-value"
                className="mt-1 text-[28px] font-bold leading-tight text-text-primary"
              >
                {Math.round(averageScore * 100)}%
              </div>
              <div className="mt-2 text-[12px] text-text-secondary">
                aus {averageSampleSize}{' '}
                {averageSampleSize === 1 ? 'Prüfung' : 'Prüfungen'}
              </div>
            </>
          )}
        </div>

        {/* Card 3 — Lernzeit */}
        <div
          data-testid="stat-time"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-[12px] font-medium text-text-secondary">
              Lernzeit
            </div>
            <WeekGrid studiedDays={studiedDays} />
          </div>
          <div className="mt-1 text-[28px] font-bold leading-tight text-text-primary">
            {timeDisplay}
          </div>
          <div className="mt-2 text-[12px] text-text-secondary">
            diese Woche
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(hours: number, mins: number): string {
  if (hours === 0 && mins === 0) return '0h';
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
