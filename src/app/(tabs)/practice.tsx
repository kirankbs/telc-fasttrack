import React, { useEffect, useState } from 'react';
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
import { getVocabularyDueToday } from '../../services/database';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '../../utils/theme';

interface PracticeCardData {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
  accentColor: string;
  onPress: () => void;
}

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const [vocabDueCount, setVocabDueCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const due = await getVocabularyDueToday('A1', 100);
        setVocabDueCount(due.length);
      } catch (err) {
        console.error('[Practice] Load error:', err);
        setVocabDueCount(0);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function comingSoon(feature: string) {
    Alert.alert(feature, 'Coming soon in the next update.');
  }

  const sectionDrills: PracticeCardData[] = [
    {
      icon: 'headphones',
      title: 'Listening Practice',
      subtitle: 'Hören — audio comprehension drills',
      accentColor: colors.primaryLight,
      onPress: () => comingSoon('Listening Practice'),
    },
    {
      icon: 'text-box-outline',
      title: 'Reading Practice',
      subtitle: 'Lesen — texts and comprehension',
      accentColor: colors.levelB1,
      onPress: () => comingSoon('Reading Practice'),
    },
    {
      icon: 'pencil-outline',
      title: 'Writing Practice',
      subtitle: 'Schreiben — forms and short messages',
      accentColor: colors.levelB2,
      onPress: () => comingSoon('Writing Practice'),
    },
  ];

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
      <Text style={styles.screenTitle}>Practice</Text>
      <Text style={styles.screenSubtitle}>Build skills section by section</Text>

      {/* Vocabulary flashcards — shows real due count */}
      <TouchableOpacity
        style={[styles.featuredCard, { borderLeftColor: colors.levelA1 }]}
        activeOpacity={0.85}
        onPress={() => comingSoon('Vocabulary Flashcards')}
      >
        <View style={styles.featuredCardLeft}>
          <MaterialCommunityIcons name="cards" size={28} color={colors.levelA1} />
          <View style={styles.featuredCardText}>
            <Text style={styles.featuredCardTitle}>Vocabulary Flashcards</Text>
            <Text style={styles.featuredCardSubtitle}>
              {vocabDueCount !== null && vocabDueCount > 0
                ? `${vocabDueCount} words due today`
                : 'No words due — check back tomorrow'}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Grammar topics */}
      <TouchableOpacity
        style={[styles.featuredCard, { borderLeftColor: colors.levelA2 }]}
        activeOpacity={0.85}
        onPress={() => comingSoon('Grammar Topics')}
      >
        <View style={styles.featuredCardLeft}>
          <MaterialCommunityIcons
            name="book-alphabet"
            size={28}
            color={colors.levelA2}
          />
          <View style={styles.featuredCardText}>
            <Text style={styles.featuredCardTitle}>Grammar Topics</Text>
            <Text style={styles.featuredCardSubtitle}>12 topics for A1</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Section drills */}
      <Text style={styles.sectionLabel}>Section drills</Text>
      {sectionDrills.map((card) => (
        <SectionDrillCard key={card.title} card={card} />
      ))}
    </ScrollView>
  );
}

interface SectionDrillCardProps {
  card: PracticeCardData;
}

function SectionDrillCard({ card }: SectionDrillCardProps) {
  return (
    <TouchableOpacity
      style={styles.drillCard}
      activeOpacity={0.85}
      onPress={card.onPress}
    >
      <View
        style={[styles.drillIconBox, { backgroundColor: card.accentColor + '18' }]}
      >
        <MaterialCommunityIcons name={card.icon} size={22} color={card.accentColor} />
      </View>
      <View style={styles.drillCardText}>
        <Text style={styles.drillTitle}>{card.title}</Text>
        <Text style={styles.drillSubtitle}>{card.subtitle}</Text>
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
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    minHeight: 44,
    ...shadows.md,
  },
  featuredCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  featuredCardText: {
    flex: 1,
    gap: 2,
  },
  featuredCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  featuredCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  drillCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    ...shadows.sm,
  },
  drillIconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillCardText: {
    flex: 1,
    gap: 2,
  },
  drillTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  drillSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
