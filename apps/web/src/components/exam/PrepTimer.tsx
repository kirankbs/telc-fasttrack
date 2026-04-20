'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatTime } from '@telc/core';

interface PrepTimerProps {
  totalSeconds: number;
}

/**
 * Countdown for the B1/B2 speaking Vorbereitungszeit (20 min).
 * Starts paused so the user can begin when ready.
 */
export function PrepTimer({ totalSeconds }: PrepTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning, clear]);

  const reset = () => {
    clear();
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  const expired = remaining === 0;
  const warning = !expired && remaining <= 60;

  return (
    <div
      data-testid="prep-timer"
      className="rounded-xl border border-border bg-white p-4 flex items-center justify-between gap-3"
    >
      <div>
        <p className="text-sm font-semibold text-text-primary">Vorbereitungszeit</p>
        <p className="text-xs text-text-secondary">
          Zeit für Notizen vor dem Sprechen. Die Aufnahme läuft getrennt.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          data-testid="prep-timer-clock"
          aria-live="polite"
          className={`rounded-lg px-3 py-1.5 text-sm font-mono font-semibold tabular-nums ${
            expired
              ? 'bg-fail-light text-fail'
              : warning
                ? 'bg-warning-light text-warning'
                : 'bg-surface-container text-text-primary'
          }`}
        >
          {expired ? 'Zeit vorbei' : formatTime(remaining)}
        </span>
        <button
          data-testid="prep-timer-toggle"
          type="button"
          onClick={() => setIsRunning((v) => !v)}
          disabled={expired}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary disabled:opacity-40 hover:border-border-hover"
        >
          {isRunning ? 'Pause' : remaining === totalSeconds ? 'Start' : 'Weiter'}
        </button>
        <button
          data-testid="prep-timer-reset"
          type="button"
          onClick={reset}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-hover"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
