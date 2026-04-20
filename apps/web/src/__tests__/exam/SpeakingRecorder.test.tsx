import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpeakingRecorder } from '../../components/exam/SpeakingRecorder';

// ---------- MediaRecorder / getUserMedia mocks ----------

type RecorderEvent = 'dataavailable' | 'stop' | 'error';

class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  static instances: MockMediaRecorder[] = [];

  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  mimeType: string;
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;

  constructor(_stream: MediaStream, opts?: { mimeType?: string }) {
    this.mimeType = opts?.mimeType ?? 'audio/webm';
    MockMediaRecorder.instances.push(this);
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    // Simulate chunk delivery + stop event like a real browser.
    this.ondataavailable?.({ data: new Blob(['x'], { type: this.mimeType }) });
    this.onstop?.();
  }

  // Convenience for tests to trigger errors.
  emit(event: RecorderEvent, payload?: unknown) {
    if (event === 'dataavailable') this.ondataavailable?.(payload as { data: Blob });
    if (event === 'stop') this.onstop?.();
    if (event === 'error') this.onerror?.(payload);
  }
}

function buildStream(): MediaStream {
  return {
    getTracks: () => [{ stop: vi.fn() } as unknown as MediaStreamTrack],
  } as unknown as MediaStream;
}

const getUserMedia = vi.fn();

beforeEach(() => {
  MockMediaRecorder.instances = [];
  MockMediaRecorder.isTypeSupported = vi.fn(() => true);
  getUserMedia.mockReset();
  getUserMedia.mockResolvedValue(buildStream());

  vi.stubGlobal('MediaRecorder', MockMediaRecorder as unknown as typeof MediaRecorder);

  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });

  // jsdom lacks URL.createObjectURL/revokeObjectURL
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function lastRecorder(): MockMediaRecorder {
  const r = MockMediaRecorder.instances.at(-1);
  if (!r) throw new Error('expected a MediaRecorder instance');
  return r;
}

describe('SpeakingRecorder', () => {
  it('renders idle state with record button', () => {
    render(<SpeakingRecorder />);
    const btn = screen.getByTestId('speaking-recorder-btn');
    expect(btn).toBeTruthy();
    expect(btn).toHaveAttribute('aria-label', 'Aufnahme starten');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('speaking-recorder-audio')).toBeNull();
  });

  it('requests mic permission on first click and enters recording state', async () => {
    render(<SpeakingRecorder />);

    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-btn'));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });

    const btn = screen.getByTestId('speaking-recorder-btn');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAttribute('aria-label', 'Aufnahme stoppen');
    expect(screen.getByTestId('speaking-recorder-timer')).toBeTruthy();
  });

  it('advances the timer while recording', async () => {
    vi.useFakeTimers();
    try {
      render(<SpeakingRecorder />);

      await act(async () => {
        // userEvent doesn't play nicely with fake timers, so click directly.
        screen.getByTestId('speaking-recorder-btn').click();
        // flush the getUserMedia promise microtask
        await Promise.resolve();
        await Promise.resolve();
      });

      // Advance 2 seconds of real time; component polls every 250ms.
      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      expect(screen.getByTestId('speaking-recorder-timer').textContent).toMatch(
        /00:0[12] \/ 03:00/,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('produces playback UI after stop', async () => {
    render(<SpeakingRecorder />);

    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-btn'));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-btn'));
      await Promise.resolve();
      await Promise.resolve();
    });

    const audio = screen.getByTestId('speaking-recorder-audio') as HTMLAudioElement;
    expect(audio).toBeTruthy();
    expect(audio.src).toBe('blob:mock-url');
    expect(screen.getByTestId('speaking-recorder-retry')).toBeTruthy();
  });

  it('retry resets back to idle/ready state', async () => {
    render(<SpeakingRecorder />);

    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-btn'));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-btn'));
      await Promise.resolve();
      await Promise.resolve();
    });

    // On playback now — click retry
    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-retry'));
    });

    expect(screen.queryByTestId('speaking-recorder-audio')).toBeNull();
    const btn = screen.getByTestId('speaking-recorder-btn');
    expect(btn).toHaveAttribute('aria-label', 'Aufnahme starten');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows helpful error when permission is denied', async () => {
    const denial = new Error('denied') as Error & { name: string };
    denial.name = 'NotAllowedError';
    getUserMedia.mockRejectedValueOnce(denial);

    render(<SpeakingRecorder />);

    await act(async () => {
      await userEvent.click(screen.getByTestId('speaking-recorder-btn'));
      await Promise.resolve();
      await Promise.resolve();
    });

    const alert = screen.getByTestId('speaking-recorder-error');
    expect(alert.textContent).toMatch(/Mikrofonzugriff/);
    // back to non-recording button
    const btn = screen.getByTestId('speaking-recorder-btn');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('auto-stops when max duration is reached', async () => {
    vi.useFakeTimers();
    try {
      render(<SpeakingRecorder maxDurationSeconds={2} />);

      await act(async () => {
        screen.getByTestId('speaking-recorder-btn').click();
        await Promise.resolve();
        await Promise.resolve();
      });

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      expect(lastRecorder().state).toBe('inactive');
      expect(screen.getByTestId('speaking-recorder-audio')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows unsupported message when MediaRecorder is missing', () => {
    delete (globalThis as { MediaRecorder?: unknown }).MediaRecorder;

    render(<SpeakingRecorder />);
    expect(screen.getByRole('alert').textContent).toMatch(/keine Audioaufnahmen/);
    expect(screen.queryByTestId('speaking-recorder-btn')).toBeNull();
  });

  it('renders idle state with a custom label for screen readers', () => {
    render(<SpeakingRecorder label="Aufgabe 2" />);
    expect(screen.getByTestId('speaking-recorder')).toHaveAttribute(
      'aria-label',
      'Aufnahme Aufgabe 2',
    );
  });
});
