import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useExam } from '../../../context/ExamContext';
import {
  useExamTimer,
  formatTime,
  SECTION_DURATIONS,
} from '../../../services/timerService';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  MIN_TOUCH_TARGET,
} from '../../../utils/theme';
import type { ListeningPart, ListeningQuestion, Level } from '../../../types/exam';

// ---------------------------------------------------------------------------
// Timer bar
// ---------------------------------------------------------------------------

interface TimerBarProps {
  totalSeconds: number;
  remainingSeconds: number;
}

function TimerBar({ totalSeconds, remainingSeconds }: TimerBarProps) {
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isWarning = remainingSeconds <= 5 * 60;

  return (
    <View style={styles.timerBarTrack}>
      <View
        style={[
          styles.timerBarFill,
          {
            width: `${Math.round(progress * 100)}%` as `${number}%`,
            backgroundColor: isWarning ? colors.timerWarning : colors.primaryLight,
          },
        ]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Audio player card
// ---------------------------------------------------------------------------

interface AudioCardProps {
  audioFile: string;
  playCount: number;
}

function AudioCard({ audioFile, playCount }: AudioCardProps) {
  const [playsRemaining, setPlaysRemaining] = useState(playCount);
  const [audioError, setAudioError] = useState(false);

  // useAudioPlayer must be called unconditionally — hook rules require it.
  // Missing/stub audio files are caught when play() is attempted, not on init.
  const player = useAudioPlayer(audioFile);

  const handlePlay = useCallback(() => {
    if (playsRemaining <= 0) return;
    try {
      player.play();
      setPlaysRemaining((n) => Math.max(0, n - 1));
    } catch {
      setAudioError(true);
    }
  }, [player, playsRemaining]);

  if (audioError) {
    return (
      <View style={[styles.audioCard, styles.audioCardUnavailable]}>
        <MaterialCommunityIcons
          name="music-off"
          size={20}
          color={colors.textDisabled}
        />
        <Text style={styles.audioUnavailableText}>Audio nicht verfügbar</Text>
      </View>
    );
  }

  const isPlaying = player.playing;
  const canPlay = playsRemaining > 0;

  const statusText = isPlaying
    ? 'Wird abgespielt...'
    : playsRemaining === 0
    ? 'Fertig'
    : playsRemaining === 1
    ? 'Noch 1× abspielen'
    : `Noch ${playsRemaining}× abspielen`;

  return (
    <View style={styles.audioCard}>
      <TouchableOpacity
        onPress={handlePlay}
        disabled={!canPlay || isPlaying}
        style={styles.audioPlayButton}
        accessibilityLabel={isPlaying ? 'Audio läuft' : 'Audio abspielen'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialCommunityIcons
          name={isPlaying ? 'pause-circle' : 'play-circle'}
          size={44}
          color={canPlay ? colors.primaryLight : colors.textDisabled}
        />
      </TouchableOpacity>
      <Text style={styles.audioStatusText}>{statusText}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Question renderers
// ---------------------------------------------------------------------------

interface MCQQuestionProps {
  question: ListeningQuestion;
  selectedAnswer: string | undefined;
  mode: 'exam_sim' | 'practice';
  onSelect: (answer: string) => void;
}

function MCQQuestion({ question, selectedAnswer, mode, onSelect }: MCQQuestionProps) {
  const optionLabels = ['a', 'b', 'c'];

  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionText}>{question.questionText}</Text>
      {(question.options ?? []).map((opt, idx) => {
        const label = optionLabels[idx] ?? String(idx);
        const isSelected = selectedAnswer === label;

        let bg: string = colors.surface;
        if (isSelected) {
          if (mode === 'practice') {
            bg =
              label === question.correctAnswer
                ? colors.successLight
                : colors.errorLight;
          } else {
            bg = colors.primarySurface;
          }
        }

        const borderColor: string =
          isSelected && mode === 'practice'
            ? label === question.correctAnswer
              ? colors.success
              : colors.error
            : isSelected
            ? colors.primaryLight
            : colors.border;

        return (
          <TouchableOpacity
            key={label}
            style={[
              styles.optionButton,
              { backgroundColor: bg, borderColor },
            ]}
            onPress={() => onSelect(label)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.optionLabelBadge}>
              <Text style={styles.optionLabelText}>{label.toUpperCase()}</Text>
            </View>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface TrueFalseQuestionProps {
  question: ListeningQuestion;
  selectedAnswer: string | undefined;
  mode: 'exam_sim' | 'practice';
  onSelect: (answer: string) => void;
}

function TrueFalseQuestion({
  question,
  selectedAnswer,
  mode,
  onSelect,
}: TrueFalseQuestionProps) {
  function buttonStyle(value: string) {
    const isSelected = selectedAnswer === value;

    let bg: string = colors.surface;
    if (isSelected) {
      if (mode === 'practice') {
        bg =
          value === question.correctAnswer ? colors.successLight : colors.errorLight;
      } else {
        bg = colors.primarySurface;
      }
    }

    const borderColor: string =
      isSelected && mode === 'practice'
        ? value === question.correctAnswer
          ? colors.success
          : colors.error
        : isSelected
        ? colors.primaryLight
        : colors.border;

    return [styles.tfButton, { backgroundColor: bg, borderColor }];
  }

  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionText}>{question.questionText}</Text>
      <View style={styles.tfRow}>
        <TouchableOpacity
          style={buttonStyle('richtig')}
          onPress={() => onSelect('richtig')}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedAnswer === 'richtig' }}
        >
          <Text style={styles.tfButtonText}>Richtig</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={buttonStyle('falsch')}
          onPress={() => onSelect('falsch')}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedAnswer === 'falsch' }}
        >
          <Text style={styles.tfButtonText}>Falsch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Part tab selector
// ---------------------------------------------------------------------------

interface PartTabsProps {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

function PartTabs({ count, activeIndex, onSelect }: PartTabsProps) {
  return (
    <View style={styles.partTabs}>
      {Array.from({ length: count }, (_, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.partTab, activeIndex === i && styles.partTabActive]}
          onPress={() => onSelect(i)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeIndex === i }}
        >
          <Text
            style={[
              styles.partTabText,
              activeIndex === i && styles.partTabTextActive,
            ]}
          >
            Teil {i + 1}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ListeningScreen() {
  const { mockId } = useLocalSearchParams<{ mockId: string }>();
  const insets = useSafeAreaInsets();
  const { session, setAnswer, completeSection } = useExam();

  const [activePartIndex, setActivePartIndex] = useState(0);

  if (!mockId) {
    router.replace('/(tabs)/exam' as any);
    return null;
  }

  const exam = session?.exam ?? null;
  const mode = session?.mode ?? 'exam_sim';
  const answers = session?.answers ?? {};

  // Derive level from session or mockId (e.g. "A1_mock_01" → "A1")
  const level = (session?.level ?? mockId?.split('_')[0] ?? 'A1') as Level;

  const sectionDuration = SECTION_DURATIONS[level]?.listening ?? SECTION_DURATIONS.A1.listening;

  const handleExpire = useCallback(() => {
    // Auto-advance on timer expiry in exam_sim mode
    router.replace(`/exam/${mockId}/reading` as any);
  }, [mockId]);

  const { state: timerState, start: startTimer } = useExamTimer(
    sectionDuration,
    mode === 'exam_sim' ? handleExpire : undefined
  );

  // Start timer on mount for exam_sim
  React.useEffect(() => {
    if (mode === 'exam_sim') {
      startTimer();
    }
  }, [mode, startTimer]);

  const listeningSection = exam?.sections.listening;
  const parts: ListeningPart[] = listeningSection?.parts ?? [];
  const activePart = parts[activePartIndex];

  function scoreListening(): { earned: number; max: number } {
    let earned = 0;
    let max = 0;
    for (const part of parts) {
      for (const q of part.questions) {
        max += 1;
        if (answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()) {
          earned += 1;
        }
      }
    }
    return { earned, max };
  }

  function handleNext() {
    if (activePartIndex < parts.length - 1) {
      setActivePartIndex(activePartIndex + 1);
    } else {
      const score = scoreListening();
      completeSection('listening', score);
      router.replace(`/exam/${mockId}/reading` as any);
    }
  }

  if (!exam || !activePart) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Lade Prüfung...</Text>
      </View>
    );
  }

  const isLastPart = activePartIndex === parts.length - 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Timer bar — exam_sim only */}
      {mode === 'exam_sim' && (
        <TimerBar
          totalSeconds={sectionDuration}
          remainingSeconds={timerState.remainingSeconds}
        />
      )}

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hören</Text>
        {mode === 'exam_sim' && (
          <Text
            style={[
              styles.timerText,
              timerState.remainingSeconds <= 5 * 60 && styles.timerTextWarning,
            ]}
          >
            {formatTime(timerState.remainingSeconds)}
          </Text>
        )}
      </View>

      {/* Part tabs */}
      <PartTabs
        count={parts.length}
        activeIndex={activePartIndex}
        onSelect={setActivePartIndex}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions */}
        <View style={styles.instructionsBlock}>
          <Text style={styles.instructions}>{activePart.instructions}</Text>
          <Text style={styles.instructionsTranslation}>
            {activePart.instructionsTranslation}
          </Text>
        </View>

        {/* Audio player */}
        <AudioCard
          audioFile={activePart.audioFile}
          playCount={activePart.playCount}
        />

        {/* Questions */}
        {activePart.questions.map((q) => {
          if (q.type === 'mcq') {
            return (
              <MCQQuestion
                key={q.id}
                question={q}
                selectedAnswer={answers[q.id]}
                mode={mode}
                onSelect={(answer) => setAnswer(q.id, answer)}
              />
            );
          }
          if (q.type === 'true_false') {
            return (
              <TrueFalseQuestion
                key={q.id}
                question={q}
                selectedAnswer={answers[q.id]}
                mode={mode}
                onSelect={(answer) => setAnswer(q.id, answer)}
              />
            );
          }
          return null;
        })}
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>
            {isLastPart ? 'Abschnitt beenden' : 'Weiter →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  timerBarTrack: {
    height: 4,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  timerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.timerNormal,
  },
  timerTextWarning: {
    color: colors.timerWarning,
  },
  partTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.base,
  },
  partTab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  partTabActive: {
    borderBottomColor: colors.primaryLight,
  },
  partTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  partTabTextActive: {
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    gap: spacing.base,
  },
  instructionsBlock: {
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  instructions: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.info,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  instructionsTranslation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  audioCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.md,
  },
  audioCardUnavailable: {
    backgroundColor: colors.surfaceContainer,
  },
  audioPlayButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioStatusText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  audioUnavailableText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
  },
  questionBlock: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    gap: spacing.sm,
    ...shadows.sm,
  },
  questionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  optionLabelBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLabelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  tfRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tfButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tfButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  nextButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnPrimary,
  },
});
