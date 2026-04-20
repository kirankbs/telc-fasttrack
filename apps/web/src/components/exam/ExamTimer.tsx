'use client';

import { useEffect, useRef, useState } from 'react';
import { formatTime } from '@fastrack/core';

interface ExamTimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onExpire?: () => void;
}

export function ExamTimer({ totalSeconds, isRunning, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const isExpired = remaining <= 0;
  const isWarning = !isExpired && remaining <= 5 * 60;

  // Capture latest onExpire without re-triggering the interval effect
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Guard so onExpire fires at most once per timer session
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

  return (
    <div
      data-testid="exam-timer"
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold tabular-nums ${
        isExpired
          ? 'bg-error-light text-error'
          : isWarning
            ? 'bg-warning-light text-warning'
            : 'bg-surface-container text-timer-normal'
      }`}
    >
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {isExpired ? 'Time up' : formatTime(remaining)}
    </div>
  );
}
