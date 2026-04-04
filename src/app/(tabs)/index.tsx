import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getUserSettings,
  getTodayStreak,
  getRecentAttempts,
} from '../../services/database';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  LEVEL_CONFIG,
} from '../../utils/theme';

interface DashboardData {
  level: string;
  dailyGoalMinutes: number;
  todayMinutes: number;
  streakDays: number;
  mocksCompleted: number;
  vocabReviewed: number;
  studyTimeHours: number;
  lastMockId: string | null;
}

const STREAK_DAYS_PLACEHOLDER = 0;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      try {
        const [settings, streak, recentAttempts] = await Promise.all([
          getUserSettings(),
          getTodayStreak(),
          getRecentAttempts('A1', 10),
        ]);

        const level = settings?.selected_level ?? 'A1';
        const dailyGoalMinutes = settings?.daily_study_minutes ?? 30;
        const todayMinutes = streak?.study_minutes ?? 0;
        const mocksCompleted = recentAttempts.filter((a) => a.passed !== null)
          .length;
        const lastMockId =
          recentAttempts.length > 0 ? recentAttempts[0].mock_id : null;

        setData({
          level,
          dailyGoalMinutes,
          todayMinutes,
          streakDays: STREAK_DAYS_PLACEHOLDER,
          mocksCompleted,
          vocabReviewed: 0,
          studyTimeHours: Math.round(todayMinutes / 60),
          lastMockId,
        });

        const pct = Math.min(
          100,
          Math.round((todayMinutes / dailyGoalMinutes) * 100)
        );
        Animated.timing(progressWidth, { toValue: pct, duration: 800, useNativeDriver: false }).start();
      } catch (err) {
        console.error('[Home] Load error:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator
          testID="activity-indicator"
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  const level = data?.level ?? 'A1';
  const levelKey = level as keyof typeof LEVEL_CONFIG;
  const levelColor =
    levelKey in LEVEL_CONFIG ? LEVEL_CONFIG[levelKey].color : colors.levelA1;
  const todayMinutes = data?.todayMinutes ?? 0;
  const dailyGoalMinutes = data?.dailyGoalMinutes ?? 30;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.base, paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Telc FastTrack</Text>
          <Text style={styles.appSubtitle}>German exam prep</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelBadgeText}>{level}</Text>
        </View>
      </View>

      {/* Streak / today summary card */}
      <View style={[styles.card, styles.streakCard]}>
        <View style={styles.streakRow}>
          <MaterialCommunityIcons
            name="fire"
            size={28}
            color={colors.streakFire}
          />
          <View style={styles.streakTextGroup}>
            <Text style={styles.streakCount}>{data?.streakDays ?? 0}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakTextGroup}>
            <Text style={styles.streakCount}>{todayMinutes}</Text>
            <Text style={styles.streakLabel}>min today</Text>
          </View>
        </View>
      </View>

      {/* Daily goal */}
      <View style={styles.card}>
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>
          <Text style={styles.goalSubtext}>
            {todayMinutes}/{dailyGoalMinutes} min
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: levelColor }, { width: progressWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}
          />
        </View>
      </View>

      {/* Continue studying */}
      <TouchableOpacity
        style={[styles.card, styles.continueCard]}
        activeOpacity={0.85}
        onPress={() => {
          if (data?.lastMockId) {
            // expo-router cast to any is intentional — dynamic route segment
            router.push(`/exam/${data.lastMockId}` as any);
          } else {
            router.push('/exam/A1_mock_01' as any);
          }
        }}
      >
        <View style={styles.continueContent}>
          <MaterialCommunityIcons
            name="play-circle"
            size={36}
            color={colors.primary}
          />
          <View style={styles.continueText}>
            <Text style={styles.continueTitle}>
              {data?.lastMockId ? 'Continue studying' : 'Start first exam'}
            </Text>
            <Text style={styles.continueSubtitle}>
              {data?.lastMockId
                ? `Last: ${data.lastMockId.replace('_', ' ')}`
                : 'Übungstest 1 · A1'}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Stat cards */}
      <Text style={styles.sectionTitle}>Progress overview</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="file-document-multiple"
          value={String(data?.mocksCompleted ?? 0)}
          label="Mocks done"
        />
        <StatCard
          icon="cards"
          value={String(data?.vocabReviewed ?? 0)}
          label="Vocab reviewed"
        />
        <StatCard
          icon="clock-outline"
          value={`${data?.studyTimeHours ?? 0}h`}
          label="Study time"
        />
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsGrid}>
        <QuickActionButton
          icon="pencil-box-multiple"
          label="Take Exam"
          color={colors.primary}
          onPress={() => router.push('/(tabs)/exam' as any)}
        />
        <QuickActionButton
          icon="cards-outline"
          label="Practice Vocab"
          color={colors.levelB1}
          onPress={() => router.push('/(tabs)/practice' as any)}
        />
        <QuickActionButton
          icon="book-alphabet"
          label="Grammar Review"
          color={colors.levelA2}
          onPress={() => router.push('/(tabs)/practice' as any)}
        />
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View style={[styles.card, styles.statCard]}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}

function QuickActionButton({ icon, label, color, onPress }: QuickActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { borderLeftColor: color }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.actionLabel}>{label}</Text>
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  levelBadgeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.md,
  },
  streakCard: {
    backgroundColor: colors.streakBackground,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  streakTextGroup: {
    alignItems: 'center',
  },
  streakCount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.streakText,
  },
  streakLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.streakText,
  },
  streakDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  continueText: {
    flex: 1,
  },
  continueTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  continueSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsGrid: {
    gap: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderLeftWidth: 4,
    minHeight: 44,
    ...shadows.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});
