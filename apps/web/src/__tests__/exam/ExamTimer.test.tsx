import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ExamTimer } from '../../components/exam/ExamTimer';

/**
 * Ethics gate: the timer must never render in red. Warning and expired both
 * render in amber (`bg-warning-surface` + `text-warning`). The assertions below
 * check both the className (Tailwind utility) and the serialized DOM against
 * forbidden tokens (red hex / rgb, error/fail class fragments).
 */
const FORBIDDEN_COLOR_PATTERNS = [
  /bg-error/i,
  /text-error/i,
  /bg-fail/i,
  /text-fail/i,
  /\bred\b/i,
  /#b91c1c/i,
  /#c62828/i,
  /rgb\(\s*1[7-9][0-9]\s*,\s*[0-3][0-9]?\s*,/i, // crude catch for red rgb()
];

function assertNoRed(el: HTMLElement) {
  for (const pattern of FORBIDDEN_COLOR_PATTERNS) {
    expect(el.className).not.toMatch(pattern);
  }
  const outer = el.outerHTML;
  expect(outer).not.toMatch(/bg-error/);
  expect(outer).not.toMatch(/text-error/);
  expect(outer).not.toMatch(/bg-fail/);
  expect(outer).not.toMatch(/text-fail/);
}

describe('ExamTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders time in M:SS / MM:SS format', () => {
    render(<ExamTimer totalSeconds={600} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('10:00');
  });

  it('applies default tone (surface-container + text-secondary) at 30:00', () => {
    render(<ExamTimer totalSeconds={30 * 60} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.className).toMatch(/bg-surface-container/);
    expect(el.className).toMatch(/text-text-secondary/);
    assertNoRed(el);
  });

  it('applies warning tone (amber, never red) at 4:59', () => {
    render(<ExamTimer totalSeconds={299} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.className).toMatch(/bg-warning-surface/);
    expect(el.className).toMatch(/text-warning/);
    assertNoRed(el);
  });

  it('expired state uses warning amber (NOT red) at 0:00', () => {
    render(<ExamTimer totalSeconds={0} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('Zeit abgelaufen');
    expect(el.className).toMatch(/bg-warning-surface/);
    expect(el.className).toMatch(/text-warning/);
    assertNoRed(el);
  });

  it('does not tick when isRunning is false', () => {
    render(<ExamTimer totalSeconds={120} isRunning={false} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('2:00');
  });

  it('counts down when isRunning is true', () => {
    render(<ExamTimer totalSeconds={10} isRunning={true} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('0:07');
  });

  it('calls onExpire exactly once when timer reaches 0', () => {
    const onExpire = vi.fn();
    render(<ExamTimer totalSeconds={2} isRunning={true} onExpire={onExpire} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('still amber (not red) after ticking down to 0 at runtime', () => {
    render(<ExamTimer totalSeconds={2} isRunning={true} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('Zeit abgelaufen');
    expect(el.className).toMatch(/bg-warning-surface/);
    assertNoRed(el);
  });

  it('useRef prevents stale closure — onExpire replaced mid-run fires latest', () => {
    const firstCb = vi.fn();
    const secondCb = vi.fn();

    const { rerender } = render(
      <ExamTimer totalSeconds={3} isRunning={true} onExpire={firstCb} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender(<ExamTimer totalSeconds={3} isRunning={true} onExpire={secondCb} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(firstCb).not.toHaveBeenCalled();
    expect(secondCb).toHaveBeenCalledTimes(1);
  });

  it('uses font-mono + tabular-nums for stable digit width', () => {
    render(<ExamTimer totalSeconds={600} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.className).toMatch(/font-mono/);
    expect(el.className).toMatch(/tabular-nums/);
  });
});
