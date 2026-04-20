'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type RecorderState =
  | 'idle'
  | 'requesting-permission'
  | 'ready'
  | 'recording'
  | 'playback'
  | 'unsupported'
  | 'denied'
  | 'error';

interface SpeakingRecorderProps {
  /** Label used in accessible announcements, e.g. "Aufgabe 1". */
  label?: string;
  /** Maximum recording duration in seconds. Defaults to 180 (3 min). */
  maxDurationSeconds?: number;
}

const DEFAULT_MAX_SECONDS = 180;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported?.(type)) return type;
    } catch {
      // some polyfills/browsers may throw — ignore
    }
  }
  return undefined;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function SpeakingRecorder({
  label,
  maxDurationSeconds = DEFAULT_MAX_SECONDS,
}: SpeakingRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startMsRef = useRef<number>(0);

  // Detect unsupported environment once on mount.
  useEffect(() => {
    const hasMediaRecorder = typeof window !== 'undefined' && 'MediaRecorder' in window;
    const hasGetUserMedia =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';
    if (!hasMediaRecorder || !hasGetUserMedia) {
      setState('unsupported');
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Cleanup on unmount: stop tracks, clear timers, revoke blob URL.
  useEffect(() => {
    return () => {
      stopTimer();
      releaseStream();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = useCallback(() => {
    stopTimer();
    releaseStream();
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];
    if (blob.size === 0) {
      setState('ready');
      return;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setState('playback');
  }, [releaseStream, stopTimer]);

  const startRecording = useCallback(async () => {
    if (state === 'unsupported') return;
    setErrorMessage(null);
    setState('requesting-permission');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = handleStop;
      recorder.onerror = () => {
        setErrorMessage('Aufnahme-Fehler. Bitte erneut versuchen.');
        stopTimer();
        releaseStream();
        setState('error');
      };

      recorder.start();
      startMsRef.current = Date.now();
      setElapsed(0);
      setState('recording');

      tickRef.current = setInterval(() => {
        const next = Math.floor((Date.now() - startMsRef.current) / 1000);
        setElapsed(next);
        if (next >= maxDurationSeconds) {
          // Auto-stop when limit is reached.
          try {
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          } catch {
            // ignore — onstop will clean up
          }
        }
      }, 250);
    } catch (err: unknown) {
      const name =
        err instanceof Error && 'name' in err ? (err as DOMException).name : undefined;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setErrorMessage(
          'Mikrofonzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.',
        );
        setState('denied');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setErrorMessage(
          'Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an und versuchen Sie es erneut.',
        );
        setState('error');
      } else {
        setErrorMessage('Aufnahme konnte nicht gestartet werden.');
        setState('error');
      }
      releaseStream();
    }
  }, [handleStop, maxDurationSeconds, releaseStream, state, stopTimer]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      try {
        recorder.stop();
      } catch {
        // fall back to manual cleanup
        handleStop();
      }
    } else {
      handleStop();
    }
  }, [handleStop]);

  const retry = useCallback(() => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl(null);
    setElapsed(0);
    setErrorMessage(null);
    setState('idle');
  }, [blobUrl]);

  if (state === 'unsupported') {
    return (
      <div
        data-testid="speaking-recorder"
        className="rounded-lg border border-border bg-surface-container p-4"
      >
        <p role="alert" className="text-sm text-text-secondary">
          Ihr Browser unterstützt keine Audioaufnahmen. Bitte nutzen Sie einen aktuellen
          Chrome, Firefox oder Safari Browser.
        </p>
      </div>
    );
  }

  const isRecording = state === 'recording';
  const isRequesting = state === 'requesting-permission';
  const hasPlayback = state === 'playback' && blobUrl;
  const remaining = Math.max(0, maxDurationSeconds - elapsed);
  const maxClock = formatClock(maxDurationSeconds);

  const buttonLabel = isRecording
    ? 'Aufnahme stoppen'
    : isRequesting
      ? 'Mikrofon wird angefragt…'
      : hasPlayback
        ? 'Neue Aufnahme'
        : 'Aufnahme starten';

  const primaryAction = isRecording
    ? stopRecording
    : hasPlayback
      ? retry
      : startRecording;

  const ariaLive =
    state === 'recording'
      ? `Aufnahme läuft. ${formatClock(elapsed)} von ${maxClock}.`
      : state === 'playback'
        ? 'Aufnahme beendet. Wiedergabe verfügbar.'
        : state === 'denied'
          ? (errorMessage ?? 'Mikrofonzugriff verweigert.')
          : state === 'error'
            ? (errorMessage ?? 'Aufnahme-Fehler.')
            : state === 'requesting-permission'
              ? 'Mikrofonzugriff wird angefragt.'
              : '';

  return (
    <div
      data-testid="speaking-recorder"
      className="rounded-lg border border-border bg-surface-container p-4 space-y-3"
      aria-label={label ? `Aufnahme ${label}` : 'Aufnahme'}
    >
      <span className="sr-only" role="status" aria-live="polite">
        {ariaLive}
      </span>

      {errorMessage && (state === 'denied' || state === 'error') && (
        <div
          role="alert"
          data-testid="speaking-recorder-error"
          className="rounded-md bg-fail-light px-3 py-2 text-sm text-fail"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          data-testid="speaking-recorder-btn"
          type="button"
          onClick={primaryAction}
          disabled={isRequesting}
          aria-pressed={isRecording}
          aria-label={buttonLabel}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${
            isRecording
              ? 'bg-fail text-white hover:opacity-90'
              : isRequesting
                ? 'bg-surface-disabled text-text-disabled cursor-not-allowed'
                : 'bg-brand-primary text-white hover:opacity-90'
          }`}
        >
          {isRecording ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">{buttonLabel}</span>
            {(isRecording || hasPlayback) && (
              <span
                data-testid="speaking-recorder-timer"
                className="text-xs font-mono tabular-nums text-text-secondary"
              >
                {formatClock(elapsed)} / {maxClock}
              </span>
            )}
          </div>

          {isRecording && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={maxDurationSeconds}
                aria-valuenow={elapsed}
                className="h-full rounded-full bg-fail transition-[width] duration-200"
                style={{
                  width: `${Math.min(100, (elapsed / maxDurationSeconds) * 100)}%`,
                }}
              />
            </div>
          )}

          {isRecording && remaining <= 10 && (
            <p className="mt-1 text-xs text-fail">
              Noch {remaining} Sekunden — Aufnahme stoppt automatisch.
            </p>
          )}
        </div>
      </div>

      {hasPlayback && blobUrl && (
        <div className="space-y-2">
          <audio
            data-testid="speaking-recorder-audio"
            src={blobUrl}
            controls
            className="w-full"
          />
          <div className="flex gap-2">
            <button
              data-testid="speaking-recorder-retry"
              type="button"
              onClick={retry}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-hover"
            >
              Neu aufnehmen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
