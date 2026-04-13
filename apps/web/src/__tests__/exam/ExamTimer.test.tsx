import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ExamTimer } from '../../components/exam/ExamTimer';

describe('ExamTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders time in MM:SS format', () => {
    render(<ExamTimer totalSeconds={600} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('10:00');
  });

  it('shows "Time up" in expired state when totalSeconds is 0', () => {
    render(<ExamTimer totalSeconds={0} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('Time up');
  });

  it('does not tick when isRunning is false', () => {
    render(<ExamTimer totalSeconds={120} isRunning={false} />);
    act(() => { vi.advanceTimersByTime(3000); });
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('2:00');
  });

  it('counts down when isRunning is true', () => {
    render(<ExamTimer totalSeconds={10} isRunning={true} />);
    act(() => { vi.advanceTimersByTime(3000); });
    const el = screen.getByTestId('exam-timer');
    expect(el.textContent).toContain('0:07');
  });

  it('applies warning styling when remaining <= 300s', () => {
    render(<ExamTimer totalSeconds={299} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.className).toMatch(/bg-warning-light/);
    expect(el.className).toMatch(/text-warning/);
  });

  it('does not apply warning styling when remaining > 300s', () => {
    render(<ExamTimer totalSeconds={301} isRunning={false} />);
    const el = screen.getByTestId('exam-timer');
    expect(el.className).not.toMatch(/bg-warning-light/);
  });

  it('calls onExpire exactly once when timer reaches 0', () => {
    const onExpire = vi.fn();
    render(<ExamTimer totalSeconds={2} isRunning={true} onExpire={onExpire} />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('useRef prevents stale closure — onExpire updated mid-run fires the latest callback', () => {
    const firstCb = vi.fn();
    const secondCb = vi.fn();

    const { rerender } = render(
      <ExamTimer totalSeconds={3} isRunning={true} onExpire={firstCb} />,
    );

    act(() => { vi.advanceTimersByTime(1000); });

    // Replace the callback — stale closure would fire firstCb, ref fires secondCb
    rerender(<ExamTimer totalSeconds={3} isRunning={true} onExpire={secondCb} />);

    act(() => { vi.advanceTimersByTime(3000); });

    expect(firstCb).not.toHaveBeenCalled();
    expect(secondCb).toHaveBeenCalledTimes(1);
  });
});
