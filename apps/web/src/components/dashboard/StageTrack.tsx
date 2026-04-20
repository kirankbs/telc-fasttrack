'use client';

import type { ReadinessLevel } from '@fastrack/core';

/**
 * Stages are ordered; `active` corresponds to the current stage name. All
 * preceding stages render as filled, all following stages render empty.
 */
const STAGES: { id: ReadinessLevel; label: string }[] = [
  { id: 'building', label: 'Aufbau' },
  { id: 'developing', label: 'Entwicklung' },
  { id: 'almost', label: 'Fast bereit' },
  { id: 'ready', label: 'Prüfungsbereit' },
];

const STAGE_ORDER: ReadinessLevel[] = ['building', 'developing', 'almost', 'ready'];

interface StageTrackProps {
  active: ReadinessLevel;
  /** Tailwind class for the filled segment fill (e.g. `bg-level-a1-solid`). */
  fillClassName: string;
}

export function StageTrack({ active, fillClassName }: StageTrackProps) {
  const activeIdx = STAGE_ORDER.indexOf(active);

  return (
    <div
      data-testid="stage-track"
      className="flex w-full flex-row gap-2 md:flex-col md:gap-3"
      role="list"
      aria-label="Prüfungsbereitschaft Stufen"
    >
      <div className="flex w-full gap-2">
        {STAGES.map((stage, idx) => {
          const filled = idx <= activeIdx;
          const isActive = idx === activeIdx;
          return (
            <div
              key={stage.id}
              data-testid={`stage-segment-${stage.id}`}
              data-active={isActive}
              data-filled={filled}
              role="listitem"
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                filled ? fillClassName : 'bg-surface-container-hi'
              }`}
            />
          );
        })}
      </div>
      <div className="hidden w-full grid-cols-4 gap-2 md:grid">
        {STAGES.map((stage) => {
          const isActive = stage.id === active;
          return (
            <div
              key={`${stage.id}-label`}
              data-testid={`stage-label-${stage.id}`}
              className={`text-[11px] leading-tight ${
                isActive
                  ? 'font-semibold text-text-primary'
                  : 'text-text-tertiary'
              }`}
            >
              {stage.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
