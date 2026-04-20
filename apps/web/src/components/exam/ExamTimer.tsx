'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '@fastrack/core';

interface ExamTimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onExpire?: () => void;
}

/**
 * Exam-wide countdown timer.
 *
 * Ethics gate — the timer never turns red. The expired state uses the same
 * amber warning palette as the <5-min state. A red timer at 0:00 triggers
 * panic; we surface the state change through text only (`Zeit abgelaufen`).
 * See `.planning/design-system/tokens.md` §Timer for the rationale.
 */
export function ExamTimer({ totalSeconds, isRunning, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const isExpired = remaining <= 0;
  const isWarning = remaining <= 5 * 60;

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const expiredFiredRef = useRef(false);

  useEffect(() => {
    setRemaining(totalSeconds);
    expiredFiredRef.current = false;
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning || isExpired) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(id);
          if (!expiredFiredRef.current) {
            expiredFiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, isExpired]);

  // Warning and expired share the same amber treatment — no red, ever.
  const toneClass = isWarning
    ? 'bg-warning-surface text-warning'
    : 'bg-surface-container text-text-secondary';

  return (
    <div
      data-testid="exam-timer"
      role="timer"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-mono font-semibold tabular-nums ${toneClass}`}
    >
      <Clock className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{isExpired ? 'Zeit abgelaufen' : formatTime(remaining)}</span>
    </div>
  );
}
