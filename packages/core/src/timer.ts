export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
  warningThreshold: number;
}

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
    reading: 75 * 60,
    sprachbausteine: 15 * 60,
    writing: 30 * 60,
    speaking: 15 * 60,
  },
  B2: {
    listening: 20 * 60,
    reading: 70 * 60,
    sprachbausteine: 20 * 60,
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
