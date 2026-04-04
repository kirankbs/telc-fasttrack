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
import type {
  ReadingPart,
  ReadingQuestion,
  ReadingText,
  Level,
} from '../../../types/exam';

// ---------------------------------------------------------------------------
// Timer bar (shared pattern with listening)
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
// Reading text card
// ---------------------------------------------------------------------------

interface ReadingTextCardProps {
  text: ReadingText;
}

function ReadingTextCard({ text }: ReadingTextCardProps) {
  const typeLabel: Record<ReadingText['type'], string> = {
    email: 'E-Mail',
    ad: 'Anzeige',
    notice: 'Aushang',
    article: 'Artikel',
    letter: 'Brief',
  };

  return (
    <View style={styles.textCard}>
      <View style={styles.textCardHeader}>
        <Text style={styles.textCardType}>{typeLabel[text.type]}</Text>
        {text.source !== undefined && (
          <Text style={styles.textCardSource}>{text.source}</Text>
        )}
      </View>
      <Text style={styles.textCardContent}>{text.content}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// True/False question
// ---------------------------------------------------------------------------

interface TrueFalseQProps {
  question: ReadingQuestion;
  selectedAnswer: string | undefined;
  mode: 'exam_sim' | 'practice';
  onSelect: (answer: string) => void;
}

function TrueFalseQ({ question, selectedAnswer, mode, onSelect }: TrueFalseQProps) {
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
// Matching question — dropdown-style selection per situation
// ---------------------------------------------------------------------------

interface MatchingQProps {
  question: ReadingQuestion;
  selectedAnswer: string | undefined;
  allQuestions: ReadingQuestion[];
  onSelect: (answer: string) => void;
}

function MatchingQ({ question, selectedAnswer, allQuestions, onSelect }: MatchingQProps) {
  // Build the pool of matchable sources from the first question that has them.
  const sources = allQuestions.find((q) => (q.matchingSources?.length ?? 0) > 0)
    ?.matchingSources ?? [];

  const [expanded, setExpanded] = useState(false);

  const selectedLabel =
    sources.find((s) => s.id === selectedAnswer)?.label ?? 'Auswahl...';

  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionText}>{question.questionText}</Text>

      {/* Dropdown trigger */}
      <TouchableOpacity
        style={styles.matchingDropdown}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        accessibilityRole="combobox"
        accessibilityState={{ expanded }}
      >
        <Text
          style={[
            styles.matchingDropdownText,
            selectedAnswer === undefined && styles.matchingDropdownPlaceholder,
          ]}
        >
          {selectedLabel}
        </Text>
        <Text style={styles.matchingDropdownChevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Options list */}
      {expanded && (
        <View style={styles.matchingOptions}>
          {sources.map((src) => {
            const isSelected = selectedAnswer === src.id;
            return (
              <TouchableOpacity
                key={src.id}
                style={[
                  styles.matchingOption,
                  isSelected && styles.matchingOptionSelected,
                ]}
                onPress={() => {
                  onSelect(src.id);
                  setExpanded(false);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.matchingOptionId,
                    isSelected && styles.matchingOptionTextSelected,
                  ]}
                >
                  {src.id.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.matchingOptionLabel,
                    isSelected && styles.matchingOptionTextSelected,
                  ]}
                >
                  {src.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Part renderers
// ---------------------------------------------------------------------------

interface PartContentProps {
  part: ReadingPart;
  answers: Record<string, string>;
  mode: 'exam_sim' | 'practice';
  onAnswer: (questionId: string, answer: string) => void;
}

function PartContent({ part, answers, mode, onAnswer }: PartContentProps) {
  // Determine layout based on question types in this part
  const hasMatching = part.questions.some((q) => q.type === 'matching');

  // Build text lookup
  const textMap = new Map<string, ReadingText>(part.texts.map((t) => [t.id, t]));

  if (hasMatching) {
    // Part 2 layout: show instructions, then matching questions
    return (
      <View style={styles.partContent}>
        {part.questions.map((q) => (
          <MatchingQ
            key={q.id}
            question={q}
            selectedAnswer={answers[q.id]}
            allQuestions={part.questions}
            onSelect={(answer) => onAnswer(q.id, answer)}
          />
        ))}
      </View>
    );
  }

  // Parts 1 and 3: text(s) followed by T/F questions.
  // When a question has relatedTextId, render the text before its question block.
  const renderedTextIds = new Set<string>();

  return (
    <View style={styles.partContent}>
      {part.questions.map((q) => {
        const elements: React.ReactNode[] = [];

        if (q.relatedTextId !== undefined) {
          const text = textMap.get(q.relatedTextId);
          if (text !== undefined && !renderedTextIds.has(text.id)) {
            renderedTextIds.add(text.id);
            elements.push(<ReadingTextCard key={`text-${text.id}`} text={text} />);
          }
        }

        elements.push(
          <TrueFalseQ
            key={q.id}
            question={q}
            selectedAnswer={answers[q.id]}
            mode={mode}
            onSelect={(answer) => onAnswer(q.id, answer)}
          />
        );

        return elements;
      })}

      {/* Texts that have no relatedTextId linkage — show at top of part */}
      {part.texts
        .filter((t) => !renderedTextIds.has(t.id))
        .map((t) => (
          <ReadingTextCard key={t.id} text={t} />
        ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ReadingScreen() {
  const { mockId } = useLocalSearchParams<{ mockId: string }>();
  const insets = useSafeAreaInsets();
  const { session, setAnswer, completeSection } = useExam();

  const [activePartIndex, setActivePartIndex] = useState(0);

  const exam = session?.exam ?? null;
  const mode = session?.mode ?? 'exam_sim';
  const answers = session?.answers ?? {};

  const level = (session?.level ?? mockId?.split('_')[0] ?? 'A1') as Level;
  const sectionDuration = SECTION_DURATIONS[level]?.reading ?? SECTION_DURATIONS.A1.reading;

  const handleExpire = useCallback(() => {
    router.replace(`/exam/${mockId}/writing` as any);
  }, [mockId]);

  const { state: timerState, start: startTimer } = useExamTimer(
    sectionDuration,
    mode === 'exam_sim' ? handleExpire : undefined
  );

  React.useEffect(() => {
    if (mode === 'exam_sim') {
      startTimer();
    }
  }, [mode, startTimer]);

  const parts: ReadingPart[] = exam?.sections.reading.parts ?? [];
  const activePart = parts[activePartIndex];

  function scoreReading(): { earned: number; max: number } {
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
      const score = scoreReading();
      completeSection('reading', score);
      router.replace(`/exam/${mockId}/writing` as any);
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
      {mode === 'exam_sim' && (
        <TimerBar
          totalSeconds={sectionDuration}
          remainingSeconds={timerState.remainingSeconds}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lesen</Text>
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

        <PartContent
          part={activePart}
          answers={answers}
          mode={mode}
          onAnswer={setAnswer}
        />
      </ScrollView>

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
  partContent: {
    gap: spacing.base,
  },
  textCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.sm,
    ...shadows.sm,
  },
  textCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textCardType: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textCardSource: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  textCardContent: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
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
  matchingDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    backgroundColor: colors.surfaceContainer,
  },
  matchingDropdownText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  matchingDropdownPlaceholder: {
    color: colors.textDisabled,
  },
  matchingDropdownChevron: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  matchingOptions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  matchingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  matchingOptionSelected: {
    backgroundColor: colors.primarySurface,
  },
  matchingOptionId: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    width: 24,
  },
  matchingOptionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  matchingOptionTextSelected: {
    color: colors.primaryLight,
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
