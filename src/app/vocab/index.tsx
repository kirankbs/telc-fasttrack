import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getVocabularyStats, seedVocabularyIfEmpty, VocabularyStats } from '../../services/vocabularyService';
import { colors, spacing, typography, borderRadius, shadows, MIN_TOUCH_TARGET } from '../../utils/theme';
import type { VocabularyItem } from '../../types/exam';

// Loaded once — vocab JSON is small enough to keep in module scope
// eslint-disable-next-line @typescript-eslint/no-var-requires
const A1_VOCAB: VocabularyItem[] = require('../../data/vocabulary/A1_vocabulary.json');

const LEVEL = 'A1';

interface TopicRow {
  topic: string;
  count: number;
}

function buildTopicBreakdown(items: VocabularyItem[]): TopicRow[] {
  const map: Record<string, number> = {};
  for (const item of items) {
    map[item.topic] = (map[item.topic] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => a.topic.localeCompare(b.topic, 'de'));
}

const TOPIC_BREAKDOWN = buildTopicBreakdown(A1_VOCAB);

export default function VocabIndexScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      await seedVocabularyIfEmpty(LEVEL, A1_VOCAB);
      const s = await getVocabularyStats(LEVEL);
      setStats(s);
    } catch (err) {
      console.error('[VocabIndex] load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dueToday = stats?.dueToday ?? 0;

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
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.title}>Vokabeln</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>A1</Text>
          </View>
        </View>
      </View>

      {/* Stats card */}
      {stats && (
        <View style={styles.statsCard}>
          <StatItem label="Gesamt" value={stats.total} />
          <View style={styles.statDivider} />
          <StatItem label="Gelernt" value={stats.reviewed} />
          <View style={styles.statDivider} />
          <StatItem label="Beherrscht" value={stats.mastered} />
          <View style={styles.statDivider} />
          <StatItem label="Heute fällig" value={stats.dueToday} accent />
        </View>
      )}

      {/* CTA */}
      {dueToday > 0 ? (
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          // expo-router typed routes — cast to any to support dynamic string param
          onPress={() => router.push('/vocab/session?level=A1' as any)}
        >
          <MaterialCommunityIcons name="cards" size={22} color={colors.white} />
          <Text style={styles.ctaText}>{dueToday} Karten heute fällig</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.allDoneCard}>
          <MaterialCommunityIcons name="check-circle" size={28} color={colors.success} />
          <Text style={styles.allDoneText}>
            Alle Karten erledigt! Nächste Wiederholung morgen.
          </Text>
        </View>
      )}

      {/* Topic breakdown */}
      <Text style={styles.sectionLabel}>Themengebiete</Text>
      <View style={styles.topicList}>
        {TOPIC_BREAKDOWN.map((row) => (
          <TopicRow key={row.topic} topic={row.topic} count={row.count} />
        ))}
      </View>
    </ScrollView>
  );
}

function StatItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TopicRow({ topic, count }: { topic: string; count: number }) {
  return (
    <View style={styles.topicRow}>
      <Text style={styles.topicName}>{topic}</Text>
      <Text style={styles.topicCount}>{count} Wörter</Text>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  backButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  levelBadge: {
    backgroundColor: colors.levelA1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  levelBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statValueAccent: {
    color: colors.primaryLight,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_TARGET,
    ...shadows.md,
  },
  ctaText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  allDoneCard: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  allDoneText: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  topicList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  topicName: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  topicCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
