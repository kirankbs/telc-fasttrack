import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getUserSettings,
  updateSelectedLevel,
  getDatabase,
} from '../../services/database';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  LEVEL_CONFIG,
  MIN_TOUCH_TARGET,
} from '../../utils/theme';

type Level = keyof typeof LEVEL_CONFIG;

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const GOAL_OPTIONS = [15, 30, 45, 60];

// App version sourced from package.json major/minor — update when bumping.
const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1');
  const [dailyGoal, setDailyGoal] = useState(30);

  useEffect(() => {
    async function load() {
      try {
        const settings = await getUserSettings();
        if (settings) {
          setSelectedLevel((settings.selected_level as Level) ?? 'A1');
          setDailyGoal(settings.daily_study_minutes ?? 30);
        }
      } catch (err) {
        console.error('[Settings] Load error:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSelectLevel(level: Level) {
    if (level !== 'A1') {
      Alert.alert(
        'Level locked',
        'Complete A1 content first to unlock higher levels.'
      );
      return;
    }
    if (level === selectedLevel) return;

    setSaving(true);
    try {
      await updateSelectedLevel(level);
      setSelectedLevel(level);
    } catch (err) {
      console.error('[Settings] Level update error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectGoal(minutes: number) {
    if (minutes === dailyGoal) return;
    setSaving(true);
    try {
      const db = await getDatabase();
      await db.runAsync(
        "UPDATE user_settings SET daily_study_minutes = ?, updated_at = datetime('now') WHERE id = 1;",
        minutes
      );
      setDailyGoal(minutes);
    } catch (err) {
      console.error('[Settings] Goal update error:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleResetProgress() {
    Alert.alert(
      'Reset all progress?',
      'This deletes all exam attempts, vocabulary history, and streaks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              await db.execAsync(`
                DELETE FROM exam_attempts;
                DELETE FROM question_responses;
                DELETE FROM study_sessions;
                DELETE FROM streaks;
                UPDATE vocabulary SET
                  ease_factor = 2.5,
                  interval_days = 0,
                  repetitions = 0,
                  next_review_date = NULL,
                  last_reviewed_at = NULL;
              `);
              Alert.alert('Done', 'All progress has been cleared.');
            } catch (err) {
              console.error('[Settings] Reset error:', err);
              Alert.alert('Error', 'Could not reset progress. Try again.');
            }
          },
        },
      ]
    );
  }

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
      <Text style={styles.screenTitle}>Settings</Text>
      {saving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.savingText}>Saving…</Text>
        </View>
      )}

      {/* Level selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Current level</Text>
        <View style={styles.levelGrid}>
          {LEVELS.map((level) => {
            const config = LEVEL_CONFIG[level];
            const isSelected = selectedLevel === level;
            const isUnlocked = level === 'A1';

            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelOption,
                  isSelected && {
                    borderColor: config.color,
                    backgroundColor: config.color + '18',
                  },
                  !isUnlocked && styles.levelOptionLocked,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectLevel(level)}
              >
                <Text
                  style={[
                    styles.levelCode,
                    isSelected && { color: config.color },
                    !isUnlocked && { color: colors.textDisabled },
                  ]}
                >
                  {level}
                </Text>
                {!isUnlocked && (
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={12}
                    color={colors.textDisabled}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.sectionHint}>
          A2–C1 unlock after A1 is complete.
        </Text>
      </View>

      {/* Daily study goal */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Daily study goal</Text>
        <View style={styles.goalRow}>
          {GOAL_OPTIONS.map((minutes) => {
            const isSelected = dailyGoal === minutes;
            return (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.goalOption,
                  isSelected && styles.goalOptionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectGoal(minutes)}
              >
                <Text
                  style={[
                    styles.goalOptionText,
                    isSelected && styles.goalOptionTextSelected,
                  ]}
                >
                  {minutes}m
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* App info */}
      <View style={[styles.section, styles.infoSection]}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>{APP_VERSION}</Text>
        </View>
        <View style={[styles.infoRow, styles.infoRowLast]}>
          <Text style={styles.infoLabel}>Content</Text>
          <Text style={styles.infoValue}>A1 — 1 mock exam</Text>
        </View>
      </View>

      {/* Danger zone */}
      <TouchableOpacity
        style={styles.resetButton}
        activeOpacity={0.85}
        onPress={handleResetProgress}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={20}
          color={colors.error}
        />
        <Text style={styles.resetButtonText}>Reset all progress</Text>
      </TouchableOpacity>
    </ScrollView>
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
  screenTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    ...shadows.sm,
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  levelOption: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  levelOptionLocked: {
    opacity: 0.45,
  },
  levelCode: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  goalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  goalOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  goalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  goalOptionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  goalOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  infoSection: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    minHeight: MIN_TOUCH_TARGET,
    marginTop: spacing.sm,
  },
  resetButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
});
