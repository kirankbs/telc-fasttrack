import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getRecentAttempts } from '../../services/database';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  LEVEL_CONFIG,
} from '../../utils/theme';

interface AttemptRecord {
  mock_id: string;
  total_score: number;
  total_max: number;
  passed: number;
  completed_at: string;
}

type MockStatus = 'not_started' | 'in_progress' | 'completed';

interface MockCardData {
  mockId: string;
  number: number;
  title: string;
  status: MockStatus;
  bestScore: number | null;
  bestMax: number | null;
  passed: boolean | null;
  isAvailable: boolean;
}

// Only mock_01 has content; the rest are stubs until built.
const AVAILABLE_MOCKS = new Set(['A1_mock_01']);

function buildMockList(attempts: AttemptRecord[]): MockCardData[] {
  const completedByMock = new Map<string, AttemptRecord>();
  for (const a of attempts) {
    const existing = completedByMock.get(a.mock_id);
    if (!existing || a.total_score > existing.total_score) {
      completedByMock.set(a.mock_id, a);
    }
  }

  return Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const mockId = `A1_mock_${String(n).padStart(2, '0')}`;
    const best = completedByMock.get(mockId) ?? null;
    const isAvailable = AVAILABLE_MOCKS.has(mockId);

    let status: MockStatus = 'not_started';
    if (best) {
      status = 'completed';
    }

    return {
      mockId,
      number: n,
      title: `Übungstest ${n}`,
      status,
      bestScore: best ? best.total_score : null,
      bestMax: best ? best.total_max : null,
      passed: best ? best.passed === 1 : null,
      isAvailable,
    };
  });
}

export default function ExamScreen() {
  const insets = useSafeAreaInsets();
  const [mocks, setMocks] = useState<MockCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const attempts = await getRecentAttempts('A1', 100);
        setMocks(buildMockList(attempts));
      } catch (err) {
        console.error('[Exam] Load error:', err);
        setMocks(buildMockList([]));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
      <Text style={styles.screenTitle}>Practice Exams</Text>
      <Text style={styles.screenSubtitle}>
        Full telc A1 mock exams with timed sections
      </Text>

      {/* Level section header */}
      <View
        style={[
          styles.levelHeader,
          { backgroundColor: LEVEL_CONFIG.A1.color },
        ]}
      >
        <View style={styles.levelHeaderLeft}>
          <Text style={styles.levelCode}>A1</Text>
          <Text style={styles.levelName}>{LEVEL_CONFIG.A1.label}</Text>
        </View>
        <View style={styles.modesChip}>
          <Text style={styles.modesChipText}>2 modes</Text>
        </View>
      </View>

      <View style={styles.modeInfoRow}>
        <ModeInfo
          icon="timer-outline"
          label="Full Exam"
          description="Timed, like the real test"
        />
        <ModeInfo
          icon="book-open-outline"
          label="Practice"
          description="No time pressure"
        />
      </View>

      {/* Mock list */}
      {mocks.map((mock) => (
        <MockCard
          key={mock.mockId}
          mock={mock}
          onPress={() => {
            if (!mock.isAvailable) return;
            // expo-router dynamic route — cast intentional
            router.push(`/exam/${mock.mockId}` as any);
          }}
        />
      ))}
    </ScrollView>
  );
}

interface ModeInfoProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  description: string;
}

function ModeInfo({ icon, label, description }: ModeInfoProps) {
  return (
    <View style={styles.modeInfoCard}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      <View>
        <Text style={styles.modeInfoLabel}>{label}</Text>
        <Text style={styles.modeInfoDesc}>{description}</Text>
      </View>
    </View>
  );
}

interface MockCardProps {
  mock: MockCardData;
  onPress: () => void;
}

function MockCard({ mock, onPress }: MockCardProps) {
  const locked = !mock.isAvailable;

  const statusColor =
    mock.status === 'completed'
      ? mock.passed
        ? colors.pass
        : colors.fail
      : colors.textDisabled;

  const statusLabel =
    mock.status === 'completed'
      ? mock.passed
        ? 'Passed'
        : 'Failed'
      : mock.status === 'in_progress'
      ? 'In progress'
      : locked
      ? 'Coming soon'
      : 'Not started';

  const scoreText =
    mock.bestScore !== null && mock.bestMax !== null
      ? `${Math.round((mock.bestScore / mock.bestMax) * 100)}%`
      : null;

  return (
    <TouchableOpacity
      style={[styles.mockCard, locked && styles.mockCardLocked]}
      activeOpacity={locked ? 1 : 0.85}
      onPress={onPress}
      disabled={locked}
    >
      <View style={styles.mockCardLeft}>
        <View
          style={[
            styles.mockNumberBadge,
            {
              backgroundColor: locked
                ? colors.surfaceContainerHigh
                : colors.primarySurface,
            },
          ]}
        >
          {locked ? (
            <MaterialCommunityIcons
              name="lock-outline"
              size={18}
              color={colors.textDisabled}
            />
          ) : (
            <Text
              style={[
                styles.mockNumberText,
                { color: colors.primary },
              ]}
            >
              {mock.number}
            </Text>
          )}
        </View>
        <View style={styles.mockCardText}>
          <Text
            style={[
              styles.mockTitle,
              locked && { color: colors.textDisabled },
            ]}
          >
            {mock.title}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: locked ? colors.textDisabled : statusColor },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: locked ? colors.textDisabled : statusColor },
              ]}
            >
              {statusLabel}
            </Text>
            {scoreText && (
              <Text style={styles.scoreText}> · Best: {scoreText}</Text>
            )}
          </View>
        </View>
      </View>
      {!locked && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  levelHeader: {
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  levelHeaderLeft: {
    gap: 2,
  },
  levelCode: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  levelName: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  modesChip: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  modesChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: LEVEL_CONFIG.A1.color,
  },
  modeInfoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modeInfoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  modeInfoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  modeInfoDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  mockCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    ...shadows.sm,
  },
  mockCardLocked: {
    opacity: 0.6,
  },
  mockCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  mockNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockNumberText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  mockCardText: {
    flex: 1,
    gap: 4,
  },
  mockTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  scoreText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});
