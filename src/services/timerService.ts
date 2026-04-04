import { useState, useEffect, useRef, useCallback } from 'react';
import { colors } from '../utils/theme';

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
  warningThreshold: number; // show warning color when remainingSeconds falls below this
}

// All durations in seconds, matching official telc exam time allocations.
export const SECTION_DURATIONS = {
  A1: {
    listening: 20 * 60,
    reading: 25 * 60,
    writing: 20 * 60,
    speaking: 15 * 60,
  },
  A2: {
    listening: 20 * 60,
    reading: 50 * 60,
    writing: 0,
    speaking: 15 * 60,
  },
  B1: {
    listening: 30 * 60,
    reading: 90 * 60,
    writing: 30 * 60,
    speaking: 15 * 60,
  },
  B2: {
    listening: 20 * 60,
    reading: 90 * 60,
    writing: 30 * 60,
    speaking: 15 * 60,
  },
  C1: {
    listening: 40 * 60,
    reading: 90 * 60,
    writing: 70 * 60,
    speaking: 16 * 60,
  },
} as const;

// 5-minute warning window keeps it consistent with how proctors announce time.
const DEFAULT_WARNING_THRESHOLD = 5 * 60;

export function createTimerState(totalSeconds: number): TimerState {
  return {
    totalSeconds,
    remainingSeconds: totalSeconds,
    isRunning: false,
    isExpired: false,
    warningThreshold: DEFAULT_WARNING_THRESHOLD,
  };
}

export function tickTimer(state: TimerState): TimerState {
  if (!state.isRunning || state.isExpired) {
    return state;
  }

  const next = state.remainingSeconds - 1;

  if (next <= 0) {
    return {
      ...state,
      remainingSeconds: 0,
      isRunning: false,
      isExpired: true,
    };
  }

  return { ...state, remainingSeconds: next };
}

export function formatTime(seconds: number): string {
  const clampedSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clampedSeconds / 60);
  const secs = clampedSeconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function getTimerColor(
  state: TimerState,
  themeColors: typeof colors
): string {
  return state.remainingSeconds <= state.warningThreshold
    ? themeColors.timerWarning
    : themeColors.timerNormal;
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

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

  // Stable ref so the interval callback always sees the latest onExpire
  // without being included in the effect dependency array.
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Track whether the interval is currently active
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

  // Fire onExpire once when the timer hits zero
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
