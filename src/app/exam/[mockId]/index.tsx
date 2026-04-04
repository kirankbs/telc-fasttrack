import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loadMockExam } from '../../../services/contentLoader';
import { getDatabase } from '../../../services/database';
import { useExam, type ExamMode } from '../../../context/ExamContext';
import type { MockExam } from '../../../types/exam';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  LEVEL_CONFIG,
  MIN_TOUCH_TARGET,
} from '../../../utils/theme';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PastAttempt {
  id: number;
  completed_at: string;
  total_score: number;
  total_max: number;
  passed: number;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parses "A1_mock_01" into { level: "A1", mockNumber: 1 }.
 * Returns null if the format doesn't match.
 */
function parseMockId(
  mockId: string
): { level: string; mockNumber: number } | null {
  const match = mockId.match(/^([A-C][12])_mock_(\d{2})$/);
  if (!match) return null;
  return { level: match[1], mockNumber: parseInt(match[2], 10) };
}

function totalExamMinutes(exam: MockExam): number {
  return (
    exam.sections.listening.totalTimeMinutes +
    exam.sections.reading.totalTimeMinutes +
    exam.sections.writing.totalTimeMinutes +
    exam.sections.speaking.totalTimeMinutes
  );
}

function countSectionQuestions(
  section:
    | MockExam['sections']['listening']
    | MockExam['sections']['reading']
): number {
  return section.parts.reduce((sum, part) => sum + part.questions.length, 0);
}

function totalSectionPoints(exam: MockExam): number {
  // Listening + reading: 1 pt per question
  // Writing: sum of scoringCriteria maxPoints per task
  // Speaking: 8 pts per part (convention from scoringEngine)
  const listeningPts = countSectionQuestions(exam.sections.listening);
  const readingPts = countSectionQuestions(exam.sections.reading);
  const writingPts = exam.sections.writing.tasks.reduce(
    (sum, t) =>
      sum + t.scoringCriteria.reduce((s, c) => s + c.maxPoints, 0),
    0
  );
  const speakingPts = exam.sections.speaking.parts.length * 8;
  return listeningPts + readingPts + writingPts + speakingPts;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionRowProps {
  icon: IconName;
  name: string;
  minutes: number;
  maxPts: number;
}

function SectionRow({ icon, name, minutes, maxPts }: SectionRowProps) {
  return (
    <View style={styles.sectionRow}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <Text style={styles.sectionName}>{name}</Text>
      <View style={styles.sectionMeta}>
        <Text style={styles.sectionMetaText}>{minutes} min</Text>
        <Text style={styles.sectionDot}>·</Text>
        <Text style={styles.sectionMetaText}>{maxPts} Pkt.</Text>
      </View>
    </View>
  );
}

interface ModeCardProps {
  selected: boolean;
  title: string;
  subtitle: string;
  icon: IconName;
  onPress: () => void;
}

function ModeCard({ selected, title, subtitle, icon, onPress }: ModeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.modeCard, selected && styles.modeCardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={selected ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.modeTitle,
          selected && { color: colors.primary },
        ]}
      >
        {title}
      </Text>
      <Text style={styles.modeSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

interface AttemptRowProps {
  attempt: PastAttempt;
}

function AttemptRow({ attempt }: AttemptRowProps) {
  const pct =
    attempt.total_max > 0
      ? Math.round((attempt.total_score / attempt.total_max) * 100)
      : 0;
  const passed = attempt.passed === 1;
  const dateStr = format(new Date(attempt.completed_at), 'dd. MMM yyyy');

  return (
    <View style={styles.attemptRow}>
      <Text style={styles.attemptDate}>{dateStr}</Text>
      <Text style={styles.attemptPct}>{pct}%</Text>
      <View
        style={[
          styles.attemptBadge,
          { backgroundColor: passed ? colors.passLight : colors.failLight },
        ]}
      >
        <Text
          style={[
            styles.attemptBadgeText,
            { color: passed ? colors.pass : colors.fail },
          ]}
        >
          {passed ? 'Bestanden' : 'Nicht bestanden'}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ExamStartScreen() {
  const { mockId } = useLocalSearchParams<{ mockId: string }>();
  const insets = useSafeAreaInsets();
  const examCtx = useExam();

  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<ExamMode>('practice');
  const [pastAttempts, setPastAttempts] = useState<PastAttempt[]>([]);

  const parsed = parseMockId(mockId ?? '');

  useEffect(() => {
    if (!parsed) {
      setLoadError('Ungültige Mock-ID');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [loadedExam, db] = await Promise.all([
          loadMockExam(parsed!.level, parsed!.mockNumber),
          getDatabase(),
        ]);

        const attempts = await db.getAllAsync<PastAttempt>(
          `SELECT id, completed_at, total_score, total_max, passed
           FROM exam_attempts
           WHERE mock_id = ? AND completed_at IS NOT NULL
           ORDER BY completed_at DESC
           LIMIT 3;`,
          mockId
        );

        if (!cancelled) {
          setExam(loadedExam);
          setPastAttempts(attempts);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError('Prüfung konnte nicht geladen werden.');
          console.error('[ExamStart] Load error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // parsed.level/mockNumber are derived from mockId — only re-run if mockId changes
  }, [mockId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(async () => {
    if (!exam || !parsed) return;
    await examCtx.startExam(mockId!, parsed.level, exam, mode);
    // expo-router dynamic segment — cast intentional
    router.push(`/exam/${mockId}/listening` as any);
  }, [exam, examCtx, mockId, mode, parsed]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError || !exam || !parsed) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{loadError ?? 'Unbekannter Fehler'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const levelColor =
    LEVEL_CONFIG[parsed.level as keyof typeof LEVEL_CONFIG]?.color ??
    colors.primary;

  const listeningPts = countSectionQuestions(exam.sections.listening);
  const readingPts = countSectionQuestions(exam.sections.reading);
  const writingPts = exam.sections.writing.tasks.reduce(
    (sum, t) =>
      sum + t.scoringCriteria.reduce((s, c) => s + c.maxPoints, 0),
    0
  );
  const speakingPts = exam.sections.speaking.parts.length * 8;
  const totalMins = totalExamMinutes(exam);
  const totalPts = totalSectionPoints(exam);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.base,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exam.title}</Text>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelBadgeText}>{parsed.level}</Text>
        </View>
      </View>

      {/* Exam overview */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Prüfungsübersicht</Text>

        <SectionRow
          icon="headphones"
          name="Hören"
          minutes={exam.sections.listening.totalTimeMinutes}
          maxPts={listeningPts}
        />
        <View style={styles.divider} />
        <SectionRow
          icon="book-open-outline"
          name="Lesen"
          minutes={exam.sections.reading.totalTimeMinutes}
          maxPts={readingPts}
        />
        <View style={styles.divider} />
        <SectionRow
          icon="pencil-outline"
          name="Schreiben"
          minutes={exam.sections.writing.totalTimeMinutes}
          maxPts={writingPts}
        />
        <View style={styles.divider} />
        <SectionRow
          icon="microphone-outline"
          name="Sprechen"
          minutes={exam.sections.speaking.totalTimeMinutes}
          maxPts={speakingPts}
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Gesamt</Text>
          <Text style={styles.totalValue}>
            {totalMins} min · {totalPts} Pkt.
          </Text>
        </View>
      </View>

      {/* Mode selector */}
      <Text style={styles.sectionHeading}>Modus wählen</Text>
      <View style={styles.modeRow}>
        <ModeCard
          selected={mode === 'exam_sim'}
          title="Prüfungssimulation"
          subtitle="Zeitlimit, keine Hinweise"
          icon="timer-outline"
          onPress={() => setMode('exam_sim')}
        />
        <ModeCard
          selected={mode === 'practice'}
          title="Übungsmodus"
          subtitle="Ohne Zeitdruck, sofortiges Feedback"
          icon="book-open-outline"
          onPress={() => setMode('practice')}
        />
      </View>

      {/* Past attempts */}
      <Text style={styles.sectionHeading}>Frühere Versuche</Text>
      <View style={styles.card}>
        {pastAttempts.length === 0 ? (
          <Text style={styles.noAttemptsText}>Noch keine Versuche</Text>
        ) : (
          pastAttempts.map((a) => <AttemptRow key={a.id} attempt={a} />)
        )}
      </View>

      {/* Start CTA */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="play-circle-outline"
          size={22}
          color={colors.textOnPrimary}
        />
        <Text style={styles.startButtonText}>Prüfung starten</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  backButton: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  headerBack: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  levelBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  cardLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },

  // Section rows
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionMetaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionDot: {
    color: colors.textDisabled,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  // Section headings
  sectionHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },

  // Mode selector
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.xs,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  modeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  modeTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  modeSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },

  // Past attempts
  noAttemptsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  attemptDate: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  attemptPct: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'right',
  },
  attemptBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  attemptBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  // Start button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minHeight: MIN_TOUCH_TARGET + 8,
    marginTop: spacing.md,
    ...shadows.md,
  },
  startButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textOnPrimary,
  },
});
