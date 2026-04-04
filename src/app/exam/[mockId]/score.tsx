import React, { useEffect, useRef, useState } from 'react';
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
import { useExam } from '../../../context/ExamContext';
import type { ExamScore, SectionScore } from '../../../services/scoringEngine';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  MIN_TOUCH_TARGET,
} from '../../../utils/theme';

type SectionKey = 'listening' | 'reading' | 'writing' | 'speaking';

interface SectionMeta {
  key: SectionKey;
  label: string;
  score: SectionScore;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionTableRowProps {
  label: string;
  score: SectionScore;
}

function SectionTableRow({ label, score }: SectionTableRowProps) {
  const pct = Math.round(score.percentage * 100);
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{label}</Text>
      <Text style={styles.tableCellCenter}>
        {score.earned}/{score.max}
      </Text>
      <Text style={styles.tableCellCenter}>{pct}%</Text>
      <View style={styles.tableCellStatus}>
        <MaterialCommunityIcons
          name={score.passed ? 'check-circle' : 'close-circle'}
          size={18}
          color={score.passed ? colors.pass : colors.fail}
        />
      </View>
    </View>
  );
}

interface PartitionRowProps {
  label: string;
  score: SectionScore;
}

function PartitionRow({ label, score }: PartitionRowProps) {
  const pct = Math.round(score.percentage * 100);
  const passed = score.passed;
  return (
    <View
      style={[
        styles.partitionRow,
        { backgroundColor: passed ? colors.passLight : colors.failLight },
      ]}
    >
      <Text style={styles.partitionLabel}>{label}</Text>
      <Text
        style={[
          styles.partitionValue,
          { color: passed ? colors.pass : colors.fail },
        ]}
      >
        {score.earned}/{score.max} ({pct}%)
      </Text>
      <Text
        style={[
          styles.partitionStatus,
          { color: passed ? colors.pass : colors.fail },
        ]}
      >
        {passed ? 'Bestanden' : 'Nicht bestanden'}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ScoreScreen() {
  const { mockId } = useLocalSearchParams<{ mockId: string }>();
  const insets = useSafeAreaInsets();
  const { session, endExam, resetExam, startExam } = useExam();

  const [examScore, setExamScore] = useState<ExamScore | null>(null);
  const [loading, setLoading] = useState(true);

  // endExam persists to DB and must only run once per mount.
  const endCalledRef = useRef(false);

  useEffect(() => {
    if (endCalledRef.current) return;
    endCalledRef.current = true;

    endExam()
      .then((score) => {
        setExamScore(score);
      })
      .catch((err) => {
        console.error('[ScoreScreen] endExam failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
    // endExam is stable (useCallback with no deps), session is read via ref inside it.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    if (!session) {
      router.back();
      return;
    }
    const { mockId: sid, level, exam, mode } = session;
    resetExam();
    // Re-start immediately then navigate to the start screen so the user can
    // confirm mode before proceeding — avoids double-starting a DB row.
    // expo-router dynamic segment — cast intentional
    router.replace(`/exam/${sid}` as any);
  };

  const handleToOverview = () => {
    resetExam();
    // expo-router dynamic segment — cast intentional
    router.replace('/(tabs)/exam' as any);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!examScore) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Ergebnis konnte nicht geladen werden.</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleToOverview}
        >
          <Text style={styles.secondaryButtonText}>Zur Übersicht</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const overallPct = Math.round(examScore.overall.percentage * 100);

  const sections: SectionMeta[] = [
    { key: 'listening', label: 'Hören', score: examScore.listening },
    { key: 'reading', label: 'Lesen', score: examScore.reading },
    { key: 'writing', label: 'Schreiben', score: examScore.writing },
    { key: 'speaking', label: 'Sprechen', score: examScore.speaking },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.base,
          paddingBottom: insets.bottom + spacing['2xl'],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Pass / Fail hero */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: examScore.passed
              ? colors.passLight
              : colors.failLight,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={examScore.passed ? 'check-circle' : 'close-circle'}
          size={56}
          color={examScore.passed ? colors.pass : colors.fail}
        />
        <Text
          style={[
            styles.heroVerdict,
            { color: examScore.passed ? colors.pass : colors.fail },
          ]}
        >
          {examScore.passed ? 'BESTANDEN' : 'NICHT BESTANDEN'}
        </Text>
        <Text style={styles.heroPct}>{overallPct}%</Text>
      </View>

      {/* Section breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Ergebnis nach Abschnitt</Text>

        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableHeaderCell}>Abschnitt</Text>
          <Text style={styles.tableHeaderCellCenter}>Punkte</Text>
          <Text style={styles.tableHeaderCellCenter}>%</Text>
          <View style={styles.tableCellStatus} />
        </View>

        {sections.map((s) => (
          <SectionTableRow key={s.key} label={s.label} score={s.score} />
        ))}
      </View>

      {/* Partition summary */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Partitionen</Text>
        <PartitionRow label="Schriftlich" score={examScore.written} />
        <View style={styles.partitionDivider} />
        <PartitionRow label="Mündlich" score={examScore.oral} />
      </View>

      {/* Rule reminder when failed */}
      {!examScore.passed && (
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color={colors.info}
          />
          <Text style={styles.infoText}>
            Für das Bestehen sind 60% in beiden Teilen (schriftlich und
            mündlich) erforderlich.
          </Text>
        </View>
      )}

      {/* Actions */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleRetry}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="refresh"
          size={20}
          color={colors.textOnPrimary}
        />
        <Text style={styles.primaryButtonText}>Erneut versuchen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleToOverview}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>Zur Übersicht</Text>
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

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },

  // Hero
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  heroVerdict: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  heroPct: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
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

  // Table
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
  },
  tableHeaderCell: {
    flex: 2,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  tableHeaderCellCenter: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tableCell: {
    flex: 2,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  tableCellCenter: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tableCellStatus: {
    width: 28,
    alignItems: 'center',
  },

  // Partitions
  partitionRow: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  partitionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  partitionValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  partitionStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  partitionDivider: {
    height: spacing.xs,
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info,
    lineHeight:
      typography.fontSize.sm * typography.lineHeight.normal,
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minHeight: MIN_TOUCH_TARGET + 8,
    ...shadows.md,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textOnPrimary,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET + 8,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
