import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import type { WritingTask, FormField, Level } from '../../../types/exam';

// ---------------------------------------------------------------------------
// Score stepper
// ---------------------------------------------------------------------------

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function Stepper({ value, min, max, onChange }: StepperProps) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepperButton, value <= min && styles.stepperButtonDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        activeOpacity={0.8}
        accessibilityLabel="Punkt entfernen"
      >
        <Text style={styles.stepperButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepperButton, value >= max && styles.stepperButtonDisabled]}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        activeOpacity={0.8}
        accessibilityLabel="Punkt hinzufügen"
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Form fill task
// ---------------------------------------------------------------------------

interface FormFillTaskProps {
  task: WritingTask;
  answers: Record<string, string>;
  mode: 'exam_sim' | 'practice';
  onAnswer: (key: string, value: string) => void;
}

function FormFillTask({ task, answers, mode, onAnswer }: FormFillTaskProps) {
  const fields: FormField[] = task.formFields ?? [];

  return (
    <View style={styles.taskSection}>
      <Text style={styles.taskInstructions}>{task.instructions}</Text>
      <Text style={styles.taskInstructionsTranslation}>
        {task.instructionsTranslation}
      </Text>

      {fields.map((field, idx) => {
        const key = `writing_task${task.taskNumber}_field_${idx}`;
        const value = answers[key] ?? '';

        return (
          <View key={key} style={styles.formFieldBlock}>
            <Text style={styles.formFieldLabel}>{field.label}</Text>
            <TextInput
              style={styles.formFieldInput}
              value={value}
              onChangeText={(text) => onAnswer(key, text)}
              placeholder={field.hint ?? ''}
              placeholderTextColor={colors.textDisabled}
              accessibilityLabel={field.label}
            />
            {mode === 'practice' && value.length > 0 && (
              <Text style={styles.formFieldCorrect}>
                Korrekt: {field.correctAnswer}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Short message task
// ---------------------------------------------------------------------------

interface ShortMessageTaskProps {
  task: WritingTask;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
}

function ShortMessageTask({ task, answers, onAnswer }: ShortMessageTaskProps) {
  const key = 'writing_task2';
  const text = answers[key] ?? '';
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const min = task.wordCountMin ?? 30;
  const max = task.wordCountMax ?? 40;

  let wordCountColor: string = colors.textSecondary;
  if (wordCount >= min && wordCount <= max) {
    wordCountColor = colors.success;
  } else if (wordCount > 0 && (wordCount < min || wordCount > 50)) {
    wordCountColor = colors.warning;
  }

  return (
    <View style={styles.taskSection}>
      <Text style={styles.taskInstructions}>{task.prompt}</Text>
      {task.promptTranslation !== undefined && (
        <Text style={styles.taskInstructionsTranslation}>
          {task.promptTranslation}
        </Text>
      )}

      {(task.requiredPoints ?? []).length > 0 && (
        <View style={styles.requiredPointsBlock}>
          <Text style={styles.requiredPointsTitle}>Schreiben Sie über:</Text>
          {(task.requiredPoints ?? []).map((point, idx) => (
            <Text key={idx} style={styles.requiredPointItem}>
              {'✓ '}
              {point}
            </Text>
          ))}
        </View>
      )}

      <TextInput
        style={styles.messageInput}
        value={text}
        onChangeText={(t) => onAnswer(key, t)}
        multiline
        placeholder="Schreiben Sie hier Ihre Antwort..."
        placeholderTextColor={colors.textDisabled}
        textAlignVertical="top"
        accessibilityLabel="Schreibaufgabe Textfeld"
      />

      <Text style={[styles.wordCount, { color: wordCountColor }]}>
        {wordCount} {wordCount === 1 ? 'Wort' : 'Wörter'}
        {wordCount > 0 && ` · Ziel: ${min}–${max}`}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Self-assessment card (writing)
// ---------------------------------------------------------------------------

interface SelfAssessWritingProps {
  manualScore: number;
  maxScore: number;
  onChange: (score: number) => void;
}

function SelfAssessWriting({
  manualScore,
  maxScore,
  onChange,
}: SelfAssessWritingProps) {
  return (
    <View style={styles.selfAssessCard}>
      <Text style={styles.selfAssessTitle}>Schreiben wird manuell bewertet</Text>
      <Text style={styles.selfAssessSubtitle}>
        Vergleichen Sie Ihre Antwort mit dem Musterlösungstext und geben Sie Ihre
        geschätzte Punktzahl ein (0–{maxScore}).
      </Text>
      <Stepper
        value={manualScore}
        min={0}
        max={maxScore}
        onChange={onChange}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function WritingScreen() {
  const { mockId } = useLocalSearchParams<{ mockId: string }>();
  const insets = useSafeAreaInsets();
  const { session, setAnswer, completeSection } = useExam();

  if (!mockId) {
    router.replace('/(tabs)/exam' as any);
    return null;
  }

  const exam = session?.exam ?? null;
  const mode = session?.mode ?? 'exam_sim';
  const answers = session?.answers ?? {};

  const level = (session?.level ?? mockId?.split('_')[0] ?? 'A1') as Level;
  const sectionDuration = SECTION_DURATIONS[level]?.writing ?? SECTION_DURATIONS.A1.writing;

  const { state: timerState } = useExamTimer(sectionDuration);

  // Writing max score is the sum of all task maxPoints across all tasks
  const tasks: WritingTask[] = exam?.sections.writing.tasks ?? [];
  const totalMax = tasks.reduce(
    (sum, t) => sum + t.scoringCriteria.reduce((s, c) => s + c.maxPoints, 0),
    0
  );

  const [manualScore, setManualScore] = useState(0);

  function handleManualScoreChange(score: number) {
    setManualScore(score);
    // Store using the key pattern the scoringEngine expects for writing tasks.
    // We store the total as writing_task_1 since for A1 there's effectively
    // one scoring entry. The endExam() in ExamContext reads `points` from this.
    setAnswer('writing_task_1', String(score));
  }

  function handleFinish() {
    completeSection('writing', { earned: manualScore, max: totalMax });
    router.replace(`/exam/${mockId}/speaking` as any);
  }

  if (!exam) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Lade Prüfung...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }}>
        {/* Section header — no progress bar; show remaining time as text only */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Schreiben</Text>
          {mode === 'exam_sim' && (
            <Text
              style={[
                styles.timerText,
                timerState.remainingSeconds <= 5 * 60 && styles.timerTextWarning,
              ]}
            >
              Noch {formatTime(timerState.remainingSeconds)}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {tasks.map((task) => {
          if (task.type === 'form_fill') {
            return (
              <FormFillTask
                key={task.taskNumber}
                task={task}
                answers={answers}
                mode={mode}
                onAnswer={setAnswer}
              />
            );
          }

          if (task.type === 'short_message') {
            return (
              <ShortMessageTask
                key={task.taskNumber}
                task={task}
                answers={answers}
                onAnswer={setAnswer}
              />
            );
          }

          return null;
        })}

        <SelfAssessWriting
          manualScore={manualScore}
          maxScore={totalMax > 0 ? totalMax : 12}
          onChange={handleManualScoreChange}
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
          onPress={handleFinish}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>Abschnitt beenden</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    gap: spacing.xl,
  },
  taskSection: {
    gap: spacing.md,
  },
  taskInstructions: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  taskInstructionsTranslation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  formFieldBlock: {
    gap: spacing.xs,
  },
  formFieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  formFieldInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: MIN_TOUCH_TARGET,
  },
  formFieldCorrect: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  requiredPointsBlock: {
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  requiredPointsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  requiredPointItem: {
    fontSize: typography.fontSize.sm,
    color: colors.primaryLight,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  messageInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 120,
  },
  wordCount: {
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
  },
  selfAssessCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  selfAssessTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  selfAssessSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    alignSelf: 'flex-start',
  },
  stepperButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  stepperButtonDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.border,
  },
  stepperButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryLight,
    lineHeight: typography.fontSize.xl * 1.2,
  },
  stepperValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center',
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
