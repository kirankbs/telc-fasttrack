import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioPlayer } from '../../components/exam/AudioPlayer';

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  preload = '';
  currentTime = 0;
  duration = 60;
  onended: (() => void) | null = null;

  private listeners: Record<string, Array<{ fn: EventListener; once: boolean }>> = {};

  load() {
    // Simulate successful load
    setTimeout(() => {
      this.fireEvent('canplaythrough');
    }, 0);
  }

  play() {
    return Promise.resolve();
  }

  pause() {}

  addEventListener(event: string, fn: EventListener, opts?: { once?: boolean }) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push({ fn, once: opts?.once ?? false });
  }

  removeEventListener(event: string, fn: EventListener) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((l) => l.fn !== fn);
    }
  }

  fireEvent(event: string) {
    const handlers = this.listeners[event] ?? [];
    for (const h of handlers) {
      (h.fn as () => void)();
    }
    // Remove once listeners
    this.listeners[event] = handlers.filter((h) => !h.once);
  }
}

let mockAudioInstance: MockAudio;

beforeEach(() => {
  mockAudioInstance = new MockAudio();
  vi.stubGlobal(
    'Audio',
    vi.fn(() => mockAudioInstance),
  );

  // Mock requestAnimationFrame / cancelAnimationFrame
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AudioPlayer', () => {
  it('renders in idle state with play button and replay count', async () => {
    await act(async () => {
      render(<AudioPlayer audioFile="test.mp3" playCount={2} />);
    });
    // Wait for audio to load
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.getByTestId('audio-player')).toBeTruthy();
    expect(screen.getByTestId('audio-play-btn')).toBeTruthy();
    expect(screen.getByTestId('audio-replay-count')).toHaveTextContent('Abspielen 1/2');
  });

  it('shows disabled state when no audio source exists', async () => {
    await act(async () => {
      render(<AudioPlayer playCount={2} />);
    });

    expect(screen.getByTestId('audio-play-btn')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Kein Audio verfügbar');
  });

  it('shows "fertig" when all plays are exhausted', async () => {
    await act(async () => {
      render(<AudioPlayer audioFile="test.mp3" playCount={1} />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Click play
    await userEvent.click(screen.getByTestId('audio-play-btn'));

    // Simulate playback end
    await act(async () => {
      mockAudioInstance.onended?.();
    });

    expect(screen.getByTestId('audio-replay-count')).toHaveTextContent(
      'Abspielen 1/1 — fertig',
    );
    expect(screen.getByTestId('audio-play-btn')).toBeDisabled();
  });

  it('defaults playCount of 0 to 1', async () => {
    await act(async () => {
      render(<AudioPlayer audioFile="test.mp3" playCount={0} />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.getByTestId('audio-replay-count')).toHaveTextContent('Abspielen 1/1');
  });

  it('calls onPlayComplete when all plays finish', async () => {
    const onComplete = vi.fn();
    await act(async () => {
      render(
        <AudioPlayer audioFile="test.mp3" playCount={1} onPlayComplete={onComplete} />,
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    await userEvent.click(screen.getByTestId('audio-play-btn'));

    await act(async () => {
      mockAudioInstance.onended?.();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label on play button', async () => {
    await act(async () => {
      render(<AudioPlayer audioFile="test.mp3" playCount={2} />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(screen.getByTestId('audio-play-btn')).toHaveAttribute(
      'aria-label',
      'Audio abspielen',
    );
  });

  it('has aria-label "Audio nicht verfügbar" when disabled', async () => {
    await act(async () => {
      render(<AudioPlayer playCount={2} />);
    });

    expect(screen.getByTestId('audio-play-btn')).toHaveAttribute(
      'aria-label',
      'Audio nicht verfügbar',
    );
  });

  it('renders progress bar with role="progressbar"', async () => {
    await act(async () => {
      render(<AudioPlayer audioFile="test.mp3" playCount={2} />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
});

describe('AudioPlayer TTS fallback', () => {
  const mockSpeak = vi.fn();
  const mockCancel = vi.fn();
  const mockPause = vi.fn();

  beforeEach(() => {
    // Make Audio fail to trigger TTS fallback
    vi.stubGlobal(
      'Audio',
      vi.fn(() => {
        const audio = new MockAudio();
        // Override load to fire error
        audio.load = () => {
          setTimeout(() => audio.fireEvent('error'), 0);
        };
        return audio;
      }),
    );

    vi.stubGlobal('speechSynthesis', {
      speak: mockSpeak,
      cancel: mockCancel,
      pause: mockPause,
      resume: vi.fn(),
      getVoices: () => [{ lang: 'de-DE', name: 'German' }],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    vi.stubGlobal('SpeechSynthesisUtterance', vi.fn().mockImplementation((text: string) => ({
      text,
      lang: '',
      rate: 1,
      onend: null,
    })));
  });

  it('falls back to TTS when MP3 fails to load', async () => {
    await act(async () => {
      render(
        <AudioPlayer
          audioFile="missing.mp3"
          playCount={2}
          transcript="Hallo, wie geht es Ihnen?"
        />,
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Should show TTS indicator
    expect(screen.getByTestId('audio-player')).toBeTruthy();
    expect(screen.getByTestId('audio-play-btn')).not.toBeDisabled();
  });

  it('uses transcript text when provided', async () => {
    // No audioFile at all — direct TTS mode
    vi.stubGlobal('Audio', vi.fn(() => {
      const audio = new MockAudio();
      audio.load = () => { setTimeout(() => audio.fireEvent('error'), 0); };
      return audio;
    }));

    await act(async () => {
      render(
        <AudioPlayer playCount={2} transcript="Guten Tag" />,
      );
    });

    await userEvent.click(screen.getByTestId('audio-play-btn'));

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });
});
