'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlayerOptions {
  audioFile?: string;
  audioTranscript?: string;
  playCount: number;
}

interface UseAudioPlayerReturn {
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
  currentPlay: number;
  totalPlays: number;
  progress: number;
  isFinished: boolean;
  isFallback: boolean;
  error: string | null;
}

type PlaybackMode = 'mp3' | 'tts' | 'none';

export function useAudioPlayer({
  audioFile,
  audioTranscript,
  playCount,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const effectivePlays = playCount > 0 ? playCount : 1;

  const [currentPlay, setCurrentPlay] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PlaybackMode>('none');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animFrameRef = useRef<number>(0);
  const playGuardRef = useRef(false);
  const currentPlayRef = useRef(1);

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    currentPlayRef.current = currentPlay;
  }, [currentPlay]);

  // Determine playback mode on mount
  useEffect(() => {
    if (!audioFile && !audioTranscript) {
      setMode('none');
      setError('Kein Audio verfügbar');
      return;
    }

    if (audioFile) {
      const audio = new Audio(`/api/audio/${audioFile}`);
      audioRef.current = audio;

      const handleCanPlay = () => {
        setMode('mp3');
      };

      const handleError = () => {
        audioRef.current = null;
        if (audioTranscript) {
          setMode('tts');
        } else {
          setMode('none');
          setError('Audiodatei nicht verfügbar');
        }
      };

      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      audio.preload = 'auto';
      audio.load();

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }

    // No audioFile but transcript exists
    setMode('tts');
  }, [audioFile, audioTranscript]);

  // Check for German TTS voice availability
  useEffect(() => {
    if (mode !== 'tts') return;
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Keine deutsche Stimme verfügbar — bitte installieren Sie ein deutsches Sprachpaket');
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const hasGerman = voices.some((v) => v.lang.startsWith('de'));
      if (voices.length > 0 && !hasGerman) {
        setError('Keine deutsche Stimme verfügbar — bitte installieren Sie ein deutsches Sprachpaket');
      }
    };

    checkVoices();
    window.speechSynthesis.addEventListener('voiceschanged', checkVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', checkVoices);
    };
  }, [mode]);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const handlePlayEnd = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    cancelAnimationFrame(animFrameRef.current);

    const next = currentPlayRef.current + 1;
    if (next <= effectivePlays) {
      setCurrentPlay(next);
      // Auto-replay after short delay
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            animFrameRef.current = requestAnimationFrame(updateProgress);
          }).catch(() => {});
        } else if (mode === 'tts' && utteranceRef.current) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utteranceRef.current);
          setIsPlaying(true);
        }
      }, 500);
    } else {
      setIsFinished(true);
    }
  }, [effectivePlays, mode, updateProgress]);

  const play = useCallback(() => {
    if (isFinished || playGuardRef.current || error) return;
    playGuardRef.current = true;
    setTimeout(() => { playGuardRef.current = false; }, 300);

    if (mode === 'mp3' && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }).catch(() => {});

      audioRef.current.onended = handlePlayEnd;
    } else if (mode === 'tts' && audioTranscript) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(audioTranscript);
      utt.lang = 'de-DE';
      utt.rate = 0.9;
      utt.onend = handlePlayEnd;
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
      setIsPlaying(true);
    }
  }, [isFinished, error, mode, audioTranscript, handlePlayEnd, updateProgress]);

  const pause = useCallback(() => {
    if (mode === 'mp3' && audioRef.current) {
      audioRef.current.pause();
      cancelAnimationFrame(animFrameRef.current);
    } else if (mode === 'tts') {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    play,
    pause,
    isPlaying,
    currentPlay,
    totalPlays: effectivePlays,
    progress,
    isFinished,
    isFallback: mode === 'tts',
    error,
  };
}
