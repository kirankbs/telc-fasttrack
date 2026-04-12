import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  MIN_TOUCH_TARGET,
} from '../../utils/theme';
import type { GrammarTopic, GrammarExercise } from '../../types/exam';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const A1_GRAMMAR: GrammarTopic[] = require('../../data/grammar/A1_grammar.json');

const TOTAL_TOPICS = A1_GRAMMAR.length;

// Derive MCQ options for exercises that don't embed them — build from adjacent
// correct answers in the same topic so distractors are always present.
function getMcqOptions(exercise: GrammarExercise, topic: GrammarTopic): string[] {
  const correct = exercise.correctAnswer;
  // Gather candidates from other exercises in this topic
  const pool = (topic.exercises ?? [])
    .filter((e) => e.type === 'mcq' && e.correctAnswer !== correct)
    .map((e) => e.correctAnswer)
    .slice(0, 2);

  // Pad with generic distractors if needed so we always have 3 options
  const generics = ['keine davon', 'weiß nicht', 'andere Form'];
  while (pool.length < 2) {
    pool.push(generics[pool.length]);
  }

  const options = [correct, pool[0], pool[1]];
  // Deterministic shuffle based on correctAnswer string to keep order stable
  return options.sort((a, b) => {
    const ha = simpleHash(a + topic.id);
    const hb = simpleHash(b + topic.id);
    return ha - hb;
  });
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  }
  return h;
}

function normaliseAnswer(s: string): string {
  return s.trim().toLowerCase();
}

export default function GrammarTopicScreen() {
  const insets = useSafeAreaInsets();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();

  const orderIndex = parseInt(topicId ?? '1', 10);
  const topic = A1_GRAMMAR.find((t) => t.orderIndex === orderIndex);

  const [currentExercise, setCurrentExercise] = useState(0);
  // userAnswer per exercise index
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // whether the user has tapped Überprüfen for this exercise
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!topic) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Thema nicht gefunden.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonStandalone}
        >
          <Text style={styles.backButtonStandaloneText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exercises = topic.exercises ?? [];
  const totalExercises = exercises.length;
  const allDone =
    totalExercises > 0 &&
    Object.keys(checked).length >= totalExercises &&
    exercises.every((_, i) => checked[i] === true);

  const correctCount = exercises.filter((ex, i) => {
    if (!checked[i]) return false;
    return normaliseAnswer(answers[i] ?? '') === normaliseAnswer(ex.correctAnswer);
  }).length;

  function handleCheck() {
    setChecked((prev) => ({ ...prev, [currentExercise]: true }));
  }

  function handleNext() {
    if (currentExercise < totalExercises - 1) {
      setCurrentExercise((n) => n + 1);
    }
  }

  function handlePrevTopic() {
    router.replace(`/grammar/${orderIndex - 1}` as any);
  }

  function handleNextTopic() {
    router.replace(`/grammar/${orderIndex + 1}` as any);
  }

  const currentAnswer = answers[currentExercise] ?? '';
  const isChecked = checked[currentExercise] === true;
  const currentEx = exercises[currentExercise];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.base,
            paddingBottom: insets.bottom + spacing['2xl'],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerCenter}>Grammatik</Text>
          {/* Prev / Next topic arrows */}
          <View style={styles.navArrows}>
            <TouchableOpacity
              onPress={handlePrevTopic}
              disabled={orderIndex <= 1}
              style={[
                styles.navArrow,
                orderIndex <= 1 && styles.navArrowDisabled,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={orderIndex <= 1 ? colors.textDisabled : colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.navCounter}>
              {orderIndex}/{TOTAL_TOPICS}
            </Text>
            <TouchableOpacity
              onPress={handleNextTopic}
              disabled={orderIndex >= TOTAL_TOPICS}
              style={[
                styles.navArrow,
                orderIndex >= TOTAL_TOPICS && styles.navArrowDisabled,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={
                  orderIndex >= TOTAL_TOPICS
                    ? colors.textDisabled
                    : colors.textPrimary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Topic title ── */}
        <Text style={styles.topicTitle}>{topic.topic}</Text>

        {/* ── Explanation card ── */}
        <View style={styles.explanationCard}>
          <Text style={styles.explanationText}>{topic.explanation}</Text>
        </View>

        {/* ── Examples ── */}
        <Text style={styles.sectionLabel}>Beispiele</Text>
        <View style={styles.examplesCard}>
          {topic.examples.map((ex, i) => (
            <View
              key={i}
              style={[
                styles.exampleRow,
                i < topic.examples.length - 1 && styles.exampleRowBorder,
              ]}
            >
              <Text style={styles.exampleBullet}>·</Text>
              <Text style={styles.exampleText}>{ex}</Text>
            </View>
          ))}
        </View>

        {/* ── Exercises ── */}
        {totalExercises > 0 && (
          <>
            <Text style={styles.sectionLabel}>Übungen</Text>

            {allDone ? (
              <CompletionCard
                correctCount={correctCount}
                totalExercises={totalExercises}
                orderIndex={orderIndex}
                totalTopics={TOTAL_TOPICS}
              />
            ) : (
              currentEx && (
                <ExerciseCard
                  exercise={currentEx}
                  topic={topic}
                  exerciseIndex={currentExercise}
                  totalExercises={totalExercises}
                  answer={currentAnswer}
                  isChecked={isChecked}
                  onAnswerChange={(val) =>
                    setAnswers((prev) => ({ ...prev, [currentExercise]: val }))
                  }
                  onCheck={handleCheck}
                  onNext={handleNext}
                  isLast={currentExercise === totalExercises - 1}
                />
              )
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// ExerciseCard — renders the correct input type per exercise.type
// ---------------------------------------------------------------------------

interface ExerciseCardProps {
  exercise: GrammarExercise;
  topic: GrammarTopic;
  exerciseIndex: number;
  totalExercises: number;
  answer: string;
  isChecked: boolean;
  onAnswerChange: (val: string) => void;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

function ExerciseCard({
  exercise,
  topic,
  exerciseIndex,
  totalExercises,
  answer,
  isChecked,
  onAnswerChange,
  onCheck,
  onNext,
  isLast,
}: ExerciseCardProps) {
  const isCorrect =
    isChecked &&
    normaliseAnswer(answer) === normaliseAnswer(exercise.correctAnswer);

  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseCounter}>
        Übung {exerciseIndex + 1} von {totalExercises}
      </Text>
      <Text style={styles.exercisePrompt}>{exercise.prompt}</Text>

      {exercise.type === 'fill_blank' && (
        <FillBlankInput
          answer={answer}
          isChecked={isChecked}
          isCorrect={isCorrect}
          onChange={onAnswerChange}
        />
      )}

      {exercise.type === 'mcq' && (
        <McqOptions
          options={getMcqOptions(exercise, topic)}
          selected={answer}
          isChecked={isChecked}
          correctAnswer={exercise.correctAnswer}
          onSelect={onAnswerChange}
        />
      )}

      {exercise.type === 'reorder' && (
        <FillBlankInput
          answer={answer}
          isChecked={isChecked}
          isCorrect={isCorrect}
          onChange={onAnswerChange}
          placeholder="Ihre Antwort..."
          multiline
        />
      )}

      {!isChecked && (
        <TouchableOpacity
          style={[
            styles.checkButton,
            answer.trim().length === 0 && styles.checkButtonDisabled,
          ]}
          onPress={onCheck}
          disabled={answer.trim().length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.checkButtonText}>Überprüfen</Text>
        </TouchableOpacity>
      )}

      {isChecked && (
        <FeedbackRow
          isCorrect={isCorrect}
          correctAnswer={exercise.correctAnswer}
          explanation={exercise.explanation}
        />
      )}

      {isChecked && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? 'Ergebnis anzeigen' : 'Weiter'}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FillBlankInput
// ---------------------------------------------------------------------------

function FillBlankInput({
  answer,
  isChecked,
  isCorrect,
  onChange,
  placeholder = 'Ihre Antwort...',
  multiline = false,
}: {
  answer: string;
  isChecked: boolean;
  isCorrect: boolean;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const borderColor = isChecked
    ? isCorrect
      ? colors.success
      : colors.error
    : colors.border;

  return (
    <TextInput
      style={[
        styles.textInput,
        { borderColor },
        multiline && styles.textInputMultiline,
      ]}
      value={answer}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textDisabled}
      editable={!isChecked}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

// ---------------------------------------------------------------------------
// McqOptions
// ---------------------------------------------------------------------------

interface McqOptionsProps {
  options: string[];
  selected: string;
  isChecked: boolean;
  correctAnswer: string;
  onSelect: (val: string) => void;
}

function McqOptions({
  options,
  selected,
  isChecked,
  correctAnswer,
  onSelect,
}: McqOptionsProps) {
  return (
    <View style={styles.mcqList}>
      {options.map((opt, i) => {
        const isSelected = selected === opt;
        const isCorrectOption =
          normaliseAnswer(opt) === normaliseAnswer(correctAnswer);

        // Use string type to avoid `as const` literal narrowing conflicts
        // with StyleSheet's dynamic style props
        let bg: string = colors.surface;
        let border: string = colors.border;
        let textColor: string = colors.textPrimary;

        if (isChecked) {
          if (isCorrectOption) {
            bg = colors.successLight;
            border = colors.success;
            textColor = colors.success;
          } else if (isSelected && !isCorrectOption) {
            bg = colors.errorLight;
            border = colors.error;
            textColor = colors.error;
          }
        } else if (isSelected) {
          border = colors.primaryLight;
          bg = colors.primarySurface;
        }

        const optionStyle: ViewStyle = { backgroundColor: bg, borderColor: border };
        const radioStyle: ViewStyle = isSelected
          ? { borderColor: border, backgroundColor: border }
          : { borderColor: border };
        const textStyle: TextStyle = { color: textColor };

        return (
          <TouchableOpacity
            key={i}
            style={[styles.mcqOption, optionStyle]}
            onPress={() => !isChecked && onSelect(opt)}
            activeOpacity={isChecked ? 1 : 0.8}
          >
            <View style={[styles.mcqRadio, radioStyle]} />
            <Text style={[styles.mcqOptionText, textStyle]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FeedbackRow
// ---------------------------------------------------------------------------

function FeedbackRow({
  isCorrect,
  correctAnswer,
  explanation,
}: {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}) {
  const feedbackBg: string = isCorrect ? colors.successLight : colors.errorLight;
  const feedbackColor: string = isCorrect ? colors.success : colors.error;
  const feedbackBgStyle: ViewStyle = { backgroundColor: feedbackBg };
  const feedbackTextStyle: TextStyle = { color: feedbackColor };

  return (
    <View style={[styles.feedbackRow, feedbackBgStyle]}>
      <MaterialCommunityIcons
        name={isCorrect ? 'check-circle' : 'close-circle'}
        size={20}
        color={feedbackColor}
      />
      <View style={styles.feedbackTextGroup}>
        <Text style={[styles.feedbackResult, feedbackTextStyle]}>
          {isCorrect ? `Richtig! ${correctAnswer}` : `Falsch. Richtig: ${correctAnswer}`}
        </Text>
        <Text style={styles.feedbackExplanation}>{explanation}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// CompletionCard — shown after all exercises are checked
// ---------------------------------------------------------------------------

interface CompletionCardProps {
  correctCount: number;
  totalExercises: number;
  orderIndex: number;
  totalTopics: number;
}

function CompletionCard({
  correctCount,
  totalExercises,
  orderIndex,
  totalTopics,
}: CompletionCardProps) {
  const pct = Math.round((correctCount / totalExercises) * 100);
  const hasNext = orderIndex < totalTopics;

  return (
    <View style={styles.completionCard}>
      <MaterialCommunityIcons
        name="check-decagram"
        size={36}
        color={colors.success}
      />
      <Text style={styles.completionTitle}>Alle Übungen abgeschlossen!</Text>
      <Text style={styles.completionScore}>
        {correctCount} von {totalExercises} richtig ({pct}%)
      </Text>

      <View style={styles.completionActions}>
        {hasNext && (
          <TouchableOpacity
            style={styles.completionNextButton}
            activeOpacity={0.85}
            // expo-router typed routes — cast to any for dynamic string
            onPress={() => router.replace(`/grammar/${orderIndex + 1}` as any)}
          >
            <Text style={styles.completionNextText}>Nächstes Thema</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.completionBackButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Text style={styles.completionBackText}>Zurück zur Übersicht</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  backButtonStandalone: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  backButtonStandaloneText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  backButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  navArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  navArrow: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.4,
  },
  navCounter: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    minWidth: 32,
    textAlign: 'center',
  },
  // Topic
  topicTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  // Explanation
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  explanationText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  // Section labels
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  // Examples
  examplesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  exampleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  exampleBullet: {
    fontSize: typography.fontSize.lg,
    color: colors.primaryLight,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    marginTop: 1,
  },
  exampleText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  // Exercise card
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    ...shadows.md,
  },
  exerciseCounter: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  exercisePrompt: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    fontWeight: typography.fontWeight.medium,
  },
  // TextInput
  textInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: MIN_TOUCH_TARGET,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  // MCQ
  mcqList: {
    gap: spacing.sm,
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    minHeight: MIN_TOUCH_TARGET,
  },
  mcqRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  mcqOptionText: {
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  // Check button
  checkButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
    ...shadows.sm,
  },
  checkButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  checkButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  // Feedback
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  feedbackTextGroup: {
    flex: 1,
    gap: 4,
  },
  feedbackResult: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  feedbackExplanation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // Next button
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    ...shadows.sm,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  // Completion
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.md,
  },
  completionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  completionScore: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  completionActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  completionNextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    ...shadows.sm,
  },
  completionNextText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  completionBackButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completionBackText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});
