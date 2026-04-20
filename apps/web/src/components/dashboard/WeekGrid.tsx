'use client';

/**
 * Calendar-grid replacement for the fire-emoji streak. Renders 7 tiny squares,
 * Monday-first, brand-tinted for days the user studied, muted for idle days.
 *
 * `studiedDays` is a 7-length array of booleans in Mon..Sun order.
 */

const DAY_LABELS: [string, string, string, string, string, string, string] = [
  'Mo',
  'Di',
  'Mi',
  'Do',
  'Fr',
  'Sa',
  'So',
];

export interface WeekGridProps {
  studiedDays: readonly boolean[];
}

export function WeekGrid({ studiedDays }: WeekGridProps) {
  // Defensive: always render exactly 7 squares.
  const days = Array.from({ length: 7 }, (_, i) => !!studiedDays[i]);

  return (
    <div
      data-testid="week-grid"
      role="img"
      aria-label="Lerntage diese Woche"
      className="flex items-center gap-1"
    >
      {days.map((studied, i) => (
        <span
          key={i}
          data-testid={`week-grid-day-${i}`}
          data-studied={studied}
          title={`${DAY_LABELS[i]}: ${studied ? 'geübt' : 'nicht geübt'}`}
          className={`h-2.5 w-2.5 rounded-[3px] ${
            studied ? 'bg-brand-200' : 'bg-surface-container-hi'
          }`}
        />
      ))}
    </div>
  );
}
