'use client';

import type { ReadinessLevel } from '@telc/core';

const READINESS_LABELS: Record<ReadinessLevel, string> = {
  building: 'Aufbau',
  developing: 'Entwicklung',
  almost: 'Fast bereit',
  ready: 'Prüfungsbereit',
};

const READINESS_CSS: Record<ReadinessLevel, string> = {
  building: 'text-readiness-building',
  developing: 'text-readiness-developing',
  almost: 'text-readiness-almost',
  ready: 'text-readiness-ready',
};

const READINESS_BG: Record<ReadinessLevel, string> = {
  building: 'bg-readiness-building',
  developing: 'bg-readiness-developing',
  almost: 'bg-readiness-almost',
  ready: 'bg-readiness-ready',
};

interface ReadinessGaugeProps {
  level: ReadinessLevel;
  percentage: number;
}

export function ReadinessGauge({ level, percentage }: ReadinessGaugeProps) {
  const pct = Math.round(percentage * 100);
  const label = READINESS_LABELS[level];
  const colorClass = READINESS_CSS[level];
  const bgClass = READINESS_BG[level];

  return (
    <div
      data-testid="readiness-gauge"
      className="rounded-xl border border-border bg-white p-6"
    >
      <h3 className="mb-4 text-sm font-medium text-text-secondary">
        Prüfungsbereitschaft
      </h3>
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-container-high"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage)}`}
              strokeLinecap="round"
              className={colorClass}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              data-testid="readiness-percentage"
              className={`text-xl font-bold ${colorClass}`}
            >
              {pct}%
            </span>
          </div>
        </div>
        <div>
          <div
            data-testid="readiness-label"
            className={`text-lg font-semibold ${colorClass}`}
          >
            {label}
          </div>
          <div className="mt-1 text-sm text-text-secondary">
            {pct === 0
              ? 'Starte deinen ersten Übungstest'
              : pct >= 75
                ? 'Du bist bereit für die Prüfung!'
                : `Noch ${75 - pct}% bis Prüfungsbereit`}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-1">
        {(['building', 'developing', 'almost', 'ready'] as ReadinessLevel[]).map(
          (step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${
                READINESS_ORDER.indexOf(step) <= READINESS_ORDER.indexOf(level)
                  ? bgClass
                  : 'bg-surface-container-high'
              }`}
            />
          ),
        )}
      </div>
    </div>
  );
}

const READINESS_ORDER: ReadinessLevel[] = [
  'building',
  'developing',
  'almost',
  'ready',
];
