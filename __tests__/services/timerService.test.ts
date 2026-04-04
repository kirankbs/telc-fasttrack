import {
  createTimerState,
  tickTimer,
  formatTime,
  getTimerColor,
  SECTION_DURATIONS,
  TimerState,
} from '../../src/services/timerService';
import { colors } from '../../src/utils/theme';

// ---------------------------------------------------------------------------
// createTimerState
// ---------------------------------------------------------------------------

describe('createTimerState', () => {
  it('sets totalSeconds and remainingSeconds to the same value', () => {
    const state = createTimerState(600);
    expect(state.totalSeconds).toBe(600);
    expect(state.remainingSeconds).toBe(600);
  });

  it('starts paused and not expired', () => {
    const state = createTimerState(600);
    expect(state.isRunning).toBe(false);
    expect(state.isExpired).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// tickTimer
// ---------------------------------------------------------------------------

describe('tickTimer', () => {
  function runningState(remaining: number): TimerState {
    return {
      totalSeconds: 1200,
      remainingSeconds: remaining,
      isRunning: true,
      isExpired: false,
      warningThreshold: 300,
    };
  }

  it('decrements remainingSeconds by 1', () => {
    const next = tickTimer(runningState(60));
    expect(next.remainingSeconds).toBe(59);
    expect(next.isRunning).toBe(true);
    expect(next.isExpired).toBe(false);
  });

  it('expires when remainingSeconds reaches 0', () => {
    const next = tickTimer(runningState(1));
    expect(next.remainingSeconds).toBe(0);
    expect(next.isRunning).toBe(false);
    expect(next.isExpired).toBe(true);
  });

  it('does nothing when already expired', () => {
    const expired: TimerState = { ...runningState(0), isRunning: false, isExpired: true };
    const next = tickTimer(expired);
    expect(next.remainingSeconds).toBe(0);
    expect(next.isExpired).toBe(true);
  });

  it('does nothing when paused', () => {
    const paused: TimerState = { ...runningState(100), isRunning: false };
    const next = tickTimer(paused);
    expect(next.remainingSeconds).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------

describe('formatTime', () => {
  it('formats whole minutes', () => {
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(1200)).toBe('20:00');
  });

  it('pads seconds to two digits', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(9)).toBe('0:09');
  });

  it('handles zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('clamps negative values to 0:00', () => {
    expect(formatTime(-5)).toBe('0:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(59.9)).toBe('0:59');
  });
});

// ---------------------------------------------------------------------------
// getTimerColor
// ---------------------------------------------------------------------------

describe('getTimerColor', () => {
  function makeState(remaining: number, threshold = 300): TimerState {
    return {
      totalSeconds: 1200,
      remainingSeconds: remaining,
      isRunning: true,
      isExpired: false,
      warningThreshold: threshold,
    };
  }

  it('returns timerNormal when above threshold', () => {
    expect(getTimerColor(makeState(301), colors)).toBe(colors.timerNormal);
  });

  it('returns timerWarning at exactly the threshold', () => {
    expect(getTimerColor(makeState(300), colors)).toBe(colors.timerWarning);
  });

  it('returns timerWarning below threshold', () => {
    expect(getTimerColor(makeState(45), colors)).toBe(colors.timerWarning);
  });
});

// ---------------------------------------------------------------------------
// SECTION_DURATIONS — spot-check A1
// ---------------------------------------------------------------------------

describe('SECTION_DURATIONS', () => {
  it('A1 listening is 20 minutes', () => {
    expect(SECTION_DURATIONS.A1.listening).toBe(20 * 60);
  });

  it('A1 reading is 25 minutes', () => {
    expect(SECTION_DURATIONS.A1.reading).toBe(25 * 60);
  });

  it('A1 writing is 20 minutes', () => {
    expect(SECTION_DURATIONS.A1.writing).toBe(20 * 60);
  });

  it('A1 speaking is 15 minutes', () => {
    expect(SECTION_DURATIONS.A1.speaking).toBe(15 * 60);
  });

  it('C1 writing is 70 minutes', () => {
    expect(SECTION_DURATIONS.C1.writing).toBe(70 * 60);
  });
});
