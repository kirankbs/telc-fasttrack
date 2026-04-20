// Re-export pure timer logic from @fastrack/core.
// The React hook (useExamTimer) stays here since it depends on React state.
import { SECTION_DURATIONS, createTimerState, tickTimer, formatTime } from '@fastrack/core';
import type { TimerState } from '@fastrack/core';
import { colors } from '../utils/theme';

export { SECTION_DURATIONS, createTimerState, tickTimer, formatTime };
export type { TimerState };

export function getTimerColor(
  state: TimerState,
  themeColors: typeof colors = colors
): string {
  return state.remainingSeconds <= state.warningThreshold
    ? themeColors.timerWarning
    : themeColors.timerNormal;
}

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseExamTimerResult {
  state: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useExamTimer(
  totalSeconds: number,
  onExpire?: () => void
): UseExamTimerResult {
  const [state, setState] = useState<TimerState>(() =>
    createTimerState(totalSeconds)
  );

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTick();
    };
  }, [clearTick]);

  useEffect(() => {
    if (state.isExpired && onExpireRef.current !== undefined) {
      onExpireRef.current();
    }
  }, [state.isExpired]);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.isExpired || prev.isRunning) return prev;
      return { ...prev, isRunning: true };
    });

    if (intervalRef.current !== null) return;

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const next = tickTimer(prev);
        if (next.isExpired) {
          clearTick();
        }
        return next;
      });
    }, 1000);
  }, [clearTick]);

  const pause = useCallback(() => {
    clearTick();
    setState((prev) => {
      if (!prev.isRunning) return prev;
      return { ...prev, isRunning: false };
    });
  }, [clearTick]);

  const reset = useCallback(() => {
    clearTick();
    setState(createTimerState(totalSeconds));
  }, [clearTick, totalSeconds]);

  return { state, start, pause, reset };
}
