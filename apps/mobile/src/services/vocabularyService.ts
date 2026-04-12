import { getDatabase } from './database';
import type { VocabularyItem } from '@telc/types';
import type { SM2Result } from '@telc/core';

export async function seedVocabularyIfEmpty(
  level: string,
  items: VocabularyItem[]
): Promise<void> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM vocabulary WHERE level = ?;',
    level
  );

  if (row && row.count > 0) return;

  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT INTO vocabulary
           (level, german, english, article, plural, example_sentence, topic,
            audio_file, ease_factor, interval_days, repetitions,
            next_review_date, last_reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        item.level,
        item.german,
        item.english,
        item.article ?? null,
        item.plural ?? null,
        item.exampleSentence ?? null,
        item.topic,
        item.audioFile ?? null,
        item.easeFactor,
        item.intervalDays,
        item.repetitions,
        item.nextReviewDate ?? null,
        item.lastReviewedAt ?? null
      );
    }
  });
}

export async function recordVocabReview(
  id: number,
  quality: number,
  result: SM2Result
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE vocabulary
     SET ease_factor       = ?,
         interval_days     = ?,
         repetitions       = ?,
         next_review_date  = ?,
         last_reviewed_at  = datetime('now')
     WHERE id = ?;`,
    result.easeFactor,
    result.intervalDays,
    result.repetitions,
    result.nextReviewDate,
    id
  );
}

export interface VocabularyStats {
  total: number;
  reviewed: number;
  dueToday: number;
  mastered: number;
}

export async function getVocabularyStats(level: string): Promise<VocabularyStats> {
  const db = await getDatabase();

  const total = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM vocabulary WHERE level = ?;',
    level
  );

  const reviewed = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM vocabulary WHERE level = ? AND repetitions > 0;',
    level
  );

  const dueToday = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) as n FROM vocabulary
     WHERE level = ?
       AND (next_review_date IS NULL OR next_review_date <= date('now'));`,
    level
  );

  const mastered = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM vocabulary WHERE level = ? AND interval_days >= 21;',
    level
  );

  return {
    total: total?.n ?? 0,
    reviewed: reviewed?.n ?? 0,
    dueToday: dueToday?.n ?? 0,
    mastered: mastered?.n ?? 0,
  };
}
