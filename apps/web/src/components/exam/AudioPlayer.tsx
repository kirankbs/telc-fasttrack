'use client';

import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioFile?: string;
  playCount: number;
  transcript?: string;
  onPlayComplete?: () => void;
}

export function AudioPlayer({
  audioFile,
  playCount,
  transcript,
  onPlayComplete,
}: AudioPlayerProps) {
  const {
    play,
    pause,
    isPlaying,
    currentPlay,
    totalPlays,
    progress,
    isFinished,
    isFallback,
    error,
  } = useAudioPlayer({
    audioFile,
    audioTranscript: transcript,
    playCount,
  });

  const onCompleteRef = useRef(onPlayComplete);
  onCompleteRef.current = onPlayComplete;

  useEffect(() => {
    if (isFinished) {
      onCompleteRef.current?.();
    }
  }, [isFinished]);

  const hasError = !!error;
  const isDisabled = isFinished || hasError;

  const ariaLabel = hasError
    ? 'Audio nicht verfügbar'
    : isPlaying
      ? 'Audio pausieren'
      : 'Audio abspielen';

  return (
    <div
      data-testid="audio-player"
      className="rounded-lg border border-border bg-surface-container p-4"
    >
      {hasError && (
        <div
          role="alert"
          className="mb-3 rounded-md bg-fail-light px-3 py-2 text-sm text-fail"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          data-testid="audio-play-btn"
          onClick={isPlaying ? pause : play}
          disabled={isDisabled}
          aria-label={ariaLabel}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
            isDisabled
              ? 'bg-surface-disabled text-text-disabled cursor-not-allowed'
              : 'bg-brand-primary text-white hover:opacity-90'
          }`}
        >
          {isPlaying ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              Audio {isFallback && !hasError && '(TTS)'}
            </span>
            <span
              data-testid="audio-replay-count"
              aria-live="polite"
              className="text-xs text-text-secondary"
            >
              {isFinished
                ? `Abspielen ${totalPlays}/${totalPlays} — fertig`
                : `Abspielen ${currentPlay}/${totalPlays}`}
            </span>
          </div>

          {/* Progress bar for MP3 mode */}
          {!isFallback && !hasError && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-full rounded-full bg-brand-primary transition-[width] duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}

          {/* Animated indicator for TTS mode */}
          {isFallback && !hasError && isPlaying && (
            <div className="mt-2 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary"
                style={{ animationDelay: '300ms' }}
              />
              <span className="ml-1 text-xs text-text-secondary">Spricht...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
