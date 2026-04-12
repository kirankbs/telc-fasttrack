import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { getVocabularyDueToday } from '../../services/database';
import { recordVocabReview, seedVocabularyIfEmpty } from '../../services/vocabularyService';
import { calculateNextReview } from '../../services/spacedRepetition';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  MIN_TOUCH_TARGET,
} from '../../utils/theme';
import type { VocabularyItem } from '../../types/exam';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const A1_VOCAB: VocabularyItem[] = require('../../data/vocabulary/A1_vocabulary.json');

// The DB query returns a slimmed row — map it back to a shape usable in the session.
// We merge DB-row fields with the JSON for fields not stored in DB (exampleSentence,
// plural, easeFactor, intervalDays, repetitions).
interface SessionCard {
  id: number;
  german: string;
  english: string;
  article: string | null;
  plural?: string;
  exampleSentence?: string;
  topic: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

type Phase = 'loading' | 'empty' | 'front' | 'back' | 'done';

interface SessionStats {
  totalSeen: number;
  sumQuality: number;
}

const FLIP_DURATION = 300;

function buildSessionCard(
  row: { id: number; german: string; english: string; article: string | null; topic: string },
  vocabLookup: Map<number, VocabularyItem>
): SessionCard {
  const full = vocabLookup.get(row.id);
  return {
    id: row.id,
    german: row.german,
    english: row.english,
    article: row.article,
    plural: full?.plural,
    exampleSentence: full?.exampleSentence,
    topic: row.topic,
    easeFactor: full?.easeFactor ?? 2.5,
    intervalDays: full?.intervalDays ?? 0,
    repetitions: full?.repetitions ?? 0,
  };
}

export default function VocabSessionScreen() {
  const insets = useSafeAreaInsets();
  const { level = 'A1' } = useLocalSearchParams<{ level?: string }>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [queue, setQueue] = useState<SessionCard[]>([]);
  const [cursor, setCursor] = useState(0);
  const [stats, setStats] = useState<SessionStats>({ totalSeen: 0, sumQuality: 0 });

  // Progress bar — standard RN Animated (0 → 1 maps to 0% → 100% width)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Lookup map: id → full VocabularyItem (for fields not in DB row)
  const vocabLookupRef = useRef<Map<number, VocabularyItem>>(
    new Map(A1_VOCAB.map((v) => [v.id, v]))
  );

  const loadQueue = useCallback(async () => {
    setPhase('loading');
    try {
      await seedVocabularyIfEmpty(level, A1_VOCAB);
      const rows = await getVocabularyDueToday(level, 20);
      if (rows.length === 0) {
        setPhase('empty');
        return;
      }
      const cards = rows.map((r) => buildSessionCard(r, vocabLookupRef.current));
      setQueue(cards);
      setCursor(0);
      setStats({ totalSeen: 0, sumQuality: 0 });
      progressAnim.setValue(0);
      setPhase('front');
    } catch (err) {
      console.error('[VocabSession] load error:', err);
      setPhase('empty');
    }
  }, [level, progressAnim]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Auto-speak German word on front side for first-time cards (repetitions === 0)
  useEffect(() => {
    if (phase !== 'front') return;
    const card = queue[cursor];
    if (!card) return;
    if (card.repetitions === 0) {
      Speech.speak(card.german, { language: 'de-DE', rate: 0.8 });
    }
  }, [phase, cursor, queue]);

  function handleShowAnswer() {
    setPhase('back');
  }

  function handleSpeak() {
    const card = queue[cursor];
    if (!card) return;
    Speech.speak(card.german, { language: 'de-DE', rate: 0.8 });
  }

  async function handleRating(quality: number) {
    const card = queue[cursor];
    if (!card) return;

    const result = calculateNextReview(
      quality,
      card.easeFactor,
      card.intervalDays,
      card.repetitions
    );

    try {
      await recordVocabReview(card.id, quality, result);
    } catch (err) {
      console.error('[VocabSession] recordVocabReview error:', err);
    }

    const newStats: SessionStats = {
      totalSeen: stats.totalSeen + 1,
      sumQuality: stats.sumQuality + quality,
    };
    setStats(newStats);

    let nextQueue = queue;

    // Failed recall (quality < 3) — re-append to end of queue for another shot
    if (quality < 3) {
      nextQueue = [...queue, { ...card, repetitions: result.repetitions }];
    }

    const nextCursor = cursor + 1;

    if (nextCursor >= nextQueue.length) {
      setQueue(nextQueue);
      setCursor(nextCursor);
      setPhase('done');
      Animated.timing(progressAnim, { toValue: 1, duration: FLIP_DURATION, useNativeDriver: false }).start();
      return;
    }

    const newProgress = nextCursor / nextQueue.length;
    Animated.timing(progressAnim, { toValue: newProgress, duration: FLIP_DURATION, useNativeDriver: false }).start();

    setQueue(nextQueue);
    setCursor(nextCursor);
    setPhase('front');
  }

  // ---------- render helpers ----------

  if (phase === 'loading') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (phase === 'empty') {
    return (
      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <MaterialCommunityIcons name="check-all" size={48} color={colors.success} />
        <Text style={styles.emptyTitle}>Nichts zu wiederholen</Text>
        <Text style={styles.emptySubtitle}>Alle Karten für heute erledigt.</Text>
        <TouchableOpacity
          style={styles.backButtonLarge}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.backButtonLargeText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'done') {
    const avgQuality = stats.totalSeen > 0 ? stats.sumQuality / stats.totalSeen : 0;
    const avgLabel = avgQuality >= 4.5 ? 'Leicht' : avgQuality >= 3.5 ? 'Gut' : avgQuality >= 2.5 ? 'Schwer' : 'Nochmal';
    return (
      <View
        style={[
          styles.center,
          styles.doneContainer,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <MaterialCommunityIcons name="check-circle-outline" size={56} color={colors.success} />
        <Text style={styles.doneTitle}>Sitzung abgeschlossen!</Text>
        <View style={styles.doneSummaryCard}>
          <Text style={styles.doneSummaryLine}>
            {stats.totalSeen} Karten wiederholt
          </Text>
          <Text style={styles.doneSummaryLine}>Durchschnitt: {avgLabel}</Text>
        </View>
        <View style={styles.doneActions}>
          <TouchableOpacity
            style={[styles.doneButton, styles.doneButtonOutline]}
            activeOpacity={0.85}
            onPress={loadQueue}
          >
            <Text style={styles.doneButtonOutlineText}>Weiter üben</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneButton, styles.doneButtonFilled]}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonFilledText}>Zum Hauptmenü</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const card = queue[cursor];
  const totalCards = queue.length;
  const cardNumber = cursor + 1;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.base },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.counterText}>Karte {cardNumber} von {totalCards}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.exitButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
          <Text style={styles.exitText}>Beenden</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressPercent}>
        {Math.round((cursor / totalCards) * 100)}%
      </Text>

      {/* Card container — front/back toggled by phase */}
      <View style={styles.cardContainer}>
        {phase === 'front' ? (
          <View style={[styles.card, styles.cardAbsolute]}>
            <View style={styles.topicBadge}>
              <Text style={styles.topicBadgeText}>{card.topic}</Text>
            </View>
            <Text style={styles.germanWord}>{card.german}</Text>
            {card.plural ? (
              <Text style={styles.pluralText}>({card.plural})</Text>
            ) : null}
            <TouchableOpacity
              style={styles.speakButton}
              onPress={handleSpeak}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name="volume-high" size={20} color={colors.primaryLight} />
              <Text style={styles.speakButtonText}>Aussprechen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, styles.cardAbsolute]}>
            <Text style={styles.germanWordSmall}>{card.german}</Text>
            <Text style={styles.englishWord}>{card.english}</Text>
            {card.exampleSentence ? (
              <Text style={styles.exampleSentence}>{card.exampleSentence}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Action area */}
      {phase === 'front' ? (
        <TouchableOpacity
          style={styles.showAnswerButton}
          activeOpacity={0.85}
          onPress={handleShowAnswer}
        >
          <Text style={styles.showAnswerText}>Antwort anzeigen</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingPrompt}>Wie gut wusstest du das?</Text>
          <View style={styles.ratingRow}>
            <RatingButton label="Nochmal" bg={colors.error} textColor={colors.textOnError} onPress={() => handleRating(1)} />
            <RatingButton label="Schwer" bg={colors.warning} textColor={colors.textPrimary} onPress={() => handleRating(3)} />
            <RatingButton label="Gut" bg={colors.primaryLight} textColor={colors.textOnPrimary} onPress={() => handleRating(4)} />
            <RatingButton label="Leicht" bg={colors.success} textColor={colors.textOnSuccess} onPress={() => handleRating(5)} />
          </View>
        </View>
      )}
    </View>
  );
}

function RatingButton({
  label,
  bg,
  textColor,
  onPress,
}: {
  label: string;
  bg: string;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.ratingButton, { backgroundColor: bg }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.ratingButtonText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
  },
  // top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  counterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  exitText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  // progress bar
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressPercent: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  // card container — fixed height so front/back overlay each other
  cardContainer: {
    height: 280,
    flex: 1,
    marginBottom: spacing.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    height: '100%',
    ...shadows.lg,
  },
  cardAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topicBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  topicBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  germanWord: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pluralText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    minHeight: MIN_TOUCH_TARGET,
    marginTop: spacing.sm,
  },
  speakButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.medium,
  },
  // back face
  germanWordSmall: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  englishWord: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  exampleSentence: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  // show answer button
  showAnswerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    ...shadows.md,
  },
  showAnswerText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnPrimary,
  },
  // rating section
  ratingSection: {
    gap: spacing.sm,
  },
  ratingPrompt: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  ratingButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  // empty state
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButtonLarge: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
  },
  backButtonLargeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnPrimary,
  },
  // done state
  doneContainer: {
    paddingHorizontal: spacing.xl,
  },
  doneTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  doneSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    ...shadows.md,
  },
  doneSummaryLine: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  doneActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginTop: spacing.md,
  },
  doneButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  doneButtonOutline: {
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  doneButtonFilled: {
    backgroundColor: colors.primaryLight,
  },
  doneButtonOutlineText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryLight,
  },
  doneButtonFilledText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textOnPrimary,
  },
});
