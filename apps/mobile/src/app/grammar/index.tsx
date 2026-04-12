import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  MIN_TOUCH_TARGET,
  LEVEL_CONFIG,
} from '../../utils/theme';
import type { GrammarTopic } from '../../types/exam';

// Static JSON — synchronous require, no loading state needed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const A1_GRAMMAR: GrammarTopic[] = require('../../data/grammar/A1_grammar.json');

const LEVEL = 'A1';
const TOPICS = [...A1_GRAMMAR].sort((a, b) => a.orderIndex - b.orderIndex);

export default function GrammarHubScreen() {
  const insets = useSafeAreaInsets();

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
        <View style={styles.headerTitleGroup}>
          <Text style={styles.title}>Grammatik</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{LEVEL}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {TOPICS.length} Themen · {LEVEL_CONFIG[LEVEL].label}
      </Text>

      {/* Topic list */}
      <View style={styles.topicList}>
        {TOPICS.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </View>
    </ScrollView>
  );
}

function TopicCard({ topic }: { topic: GrammarTopic }) {
  const exCount = topic.exercises?.length ?? 0;
  const exLabel = topic.examples.length;

  function handlePress() {
    // expo-router typed routes — cast to any for dynamic string
    router.push(`/grammar/${topic.orderIndex}` as any);
  }

  return (
    <TouchableOpacity
      style={styles.topicCard}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View style={styles.topicIndexBox}>
        <Text style={styles.topicIndex}>{topic.orderIndex}</Text>
      </View>
      <View style={styles.topicCardText}>
        <Text style={styles.topicName}>{topic.topic}</Text>
        <Text style={styles.topicMeta}>
          {exLabel} Beispiele · {exCount} Übungen
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  topicList: {
    gap: spacing.sm,
  },
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    ...shadows.sm,
  },
  topicIndexBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicIndex: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryLight,
  },
  topicCardText: {
    flex: 1,
    gap: 2,
  },
  topicName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  topicMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
