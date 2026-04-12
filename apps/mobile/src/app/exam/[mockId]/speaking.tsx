import React, { useState } from 'react';
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
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  MIN_TOUCH_TARGET,
} from '../../../utils/theme';
import type { SpeakingPart, SpeakingPartType, Level } from '../../../types/exam';

// ---------------------------------------------------------------------------
// Part type badge labels
// ---------------------------------------------------------------------------

const PART_TYPE_LABELS: Record<SpeakingPartType, string> = {
  introduce: 'Sich vorstellen',
  picture_cards: 'Bild und Wortkarte',
  und_du: '"Und du?"',
  conversation: 'Alltagsgespräch',
  planning: 'Gemeinsam planen',
  presentation: 'Präsentation',
  discussion: 'Diskussion',
};

// ---------------------------------------------------------------------------
// Score stepper (same pattern as writing)
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
// Collapsible sample response
// ---------------------------------------------------------------------------

interface CollapsibleSampleProps {
  sampleResponse: string;
}

function CollapsibleSample({ sampleResponse }: CollapsibleSampleProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.collapsible}>
      <TouchableOpacity
        style={styles.collapsibleToggle}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.collapsibleToggleText}>
          {expanded ? 'Beispielantwort ausblenden' : 'Beispielantwort anzeigen'}
        </Text>
        <Text style={styles.collapsibleChevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.collapsibleContent}>
          <Text style={styles.collapsibleText}>{sampleResponse}</Text>
        </View>
      )}
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
// Single part content
// ---------------------------------------------------------------------------

interface PartContentProps {
  part: SpeakingPart;
}

function PartContent({ part }: PartContentProps) {
  const typeLabel = PART_TYPE_LABELS[part.type] ?? part.type;

  return (
    <View style={styles.partContent}>
      {/* Part type badge */}
      <View style={styles.partTypeBadge}>
        <Text style={styles.partTypeBadgeText}>{typeLabel}</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsBlock}>
        <Text style={styles.instructions}>{part.instructions}</Text>
        <Text style={styles.instructionsTranslation}>
          {part.instructionsTranslation}
        </Text>
      </View>

      {/* Prompt card */}
      <View style={styles.promptCard}>
        <Text style={styles.promptText}>{part.prompt}</Text>
      </View>

      {/* Bildkarte placeholder — actual images not yet available */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>Bildkarte</Text>
      </View>

      {/* Key phrases */}
      {part.keyPhrases.length > 0 && (
        <View style={styles.keyPhrasesBlock}>
          <Text style={styles.keyPhrasesTitle}>Nützliche Phrasen</Text>
          {part.keyPhrases.map((phrase, idx) => (
            <Text key={idx} style={styles.keyPhraseItem}>
              {'• '}
              {phrase}
            </Text>
          ))}
        </View>
      )}

      {/* Evaluation tips */}
      {part.evaluationTips.length > 0 && (
        <View style={styles.evalTipsBlock}>
          {part.evaluationTips.map((tip, idx) => (
            <Text key={idx} style={styles.evalTipItem}>
              {'· '}
              {tip}
            </Text>
          ))}
        </View>
      )}

      {/* Collapsible sample response */}
      <CollapsibleSample sampleResponse={part.sampleResponse} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SpeakingScreen() {
  const { mockId } = useLocalSearchParams<{ mockId: string }>();
  const insets = useSafeAreaInsets();
  const { session, setAnswer, completeSection } = useExam();

  const [activePartIndex, setActivePartIndex] = useState(0);
  const [manualScore, setManualScore] = useState(0);

  if (!mockId) {
    router.replace('/(tabs)/exam' as any);
    return null;
  }

  const exam = session?.exam ?? null;
  const mode = session?.mode ?? 'exam_sim';

  const level = (session?.level ?? mockId?.split('_')[0] ?? 'A1') as Level;

  // Speaking max is 24 pts (A1: 3 parts × 8 pts each, as per scoringEngine)
  const speakingSection = exam?.sections.speaking;
  const parts: SpeakingPart[] = speakingSection?.parts ?? [];
  const speakingMax = parts.length * 8;

  const totalTimeMinutes = speakingSection?.totalTimeMinutes ?? 15;

  function handleManualScoreChange(score: number) {
    setManualScore(score);
    // Per scoringEngine: each speaking part key is `speaking_part_N` with `points`.
    // We store total across all parts as a single entry under part 1 for simplicity,
    // consistent with how endExam() distributes per-part scoring.
    // The individual part keys get set proportionally by the user's single stepper entry.
    setAnswer('speaking_part_1', String(score));
  }

  function handleFinish() {
    completeSection('speaking', { earned: manualScore, max: speakingMax });
    router.replace(`/exam/${mockId}/score` as any);
  }

  if (!exam || parts.length === 0) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Lade Prüfung...</Text>
      </View>
    );
  }

  const activePart = parts[activePartIndex];
  const isLastPart = activePartIndex === parts.length - 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sprechen</Text>
        <Text style={styles.totalTimeText}>{totalTimeMinutes} Minuten</Text>
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
        <PartContent part={activePart} />

        {/* Self-assessment — shown on last part */}
        {isLastPart && (
          <View style={styles.selfAssessCard}>
            <Text style={styles.selfAssessTitle}>
              Sprechen wird manuell bewertet
            </Text>
            <Text style={styles.selfAssessSubtitle}>
              Schätzen Sie Ihre Gesamtleistung ein und geben Sie Ihre Punktzahl
              ein (0–{speakingMax > 0 ? speakingMax : 24}).
            </Text>
            <Stepper
              value={manualScore}
              min={0}
              max={speakingMax > 0 ? speakingMax : 24}
              onChange={handleManualScoreChange}
            />
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {isLastPart ? (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinish}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.finishButtonText}>Prüfung abschließen</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setActivePartIndex((i) => i + 1)}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>Weiter →</Text>
          </TouchableOpacity>
        )}
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
  totalTimeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
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
  partContent: {
    gap: spacing.base,
  },
  partTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  partTypeBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryLight,
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
  promptCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
  },
  promptText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  imagePlaceholder: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
    fontWeight: typography.fontWeight.medium,
  },
  keyPhrasesBlock: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  keyPhrasesTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  keyPhraseItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  evalTipsBlock: {
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  evalTipItem: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },
  collapsible: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  collapsibleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  collapsibleToggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primaryLight,
  },
  collapsibleChevron: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  collapsibleContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  collapsibleText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
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
  finishButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  finishButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnSuccess,
  },
});
