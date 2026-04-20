// SQLite database initialization and migrations
// Source: fastrack-deutsch-implementation-plan.md section 6
//
// All database operations are async. Use execAsync, getAllAsync, getFirstAsync.
// WAL mode is enabled for better concurrent read performance.

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('fastrackdeutsch.db');
  await enableWAL(db);
  await runMigrations(db);
  return db;
}

async function enableWAL(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const applied = await database.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version;'
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      await database.execAsync(migration.sql);
      await database.runAsync(
        'INSERT OR IGNORE INTO schema_migrations (version) VALUES (?);',
        migration.version
      );
    }
  }
}

const MIGRATIONS: Array<{ version: number; sql: string }> = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        selected_level TEXT NOT NULL DEFAULT 'A1',
        daily_study_minutes INTEGER NOT NULL DEFAULT 30,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        onboarding_complete INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      INSERT OR IGNORE INTO user_settings (id) VALUES (1);

      CREATE TABLE IF NOT EXISTS user_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL UNIQUE,
        unlocked INTEGER NOT NULL DEFAULT 0,
        started_at TEXT,
        total_study_seconds INTEGER DEFAULT 0
      );

      INSERT OR IGNORE INTO user_levels (level, unlocked) VALUES
        ('A1', 1), ('A2', 0), ('B1', 0), ('B2', 0), ('C1', 0);

      CREATE TABLE IF NOT EXISTS exam_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        mock_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        listening_score REAL,
        listening_max REAL,
        reading_score REAL,
        reading_max REAL,
        writing_score REAL,
        writing_max REAL,
        sprachbausteine_score REAL,
        sprachbausteine_max REAL,
        speaking_score REAL,
        speaking_max REAL,
        total_score REAL,
        total_max REAL,
        passed INTEGER,
        time_spent_seconds INTEGER
      );

      CREATE TABLE IF NOT EXISTS question_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_attempt_id INTEGER,
        level TEXT NOT NULL,
        mock_id TEXT NOT NULL,
        section TEXT NOT NULL,
        part INTEGER NOT NULL,
        question_index INTEGER NOT NULL,
        user_answer TEXT,
        correct_answer TEXT,
        is_correct INTEGER,
        time_spent_seconds INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (exam_attempt_id) REFERENCES exam_attempts(id)
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        german TEXT NOT NULL,
        english TEXT NOT NULL,
        article TEXT,
        plural TEXT,
        example_sentence TEXT,
        topic TEXT,
        audio_file TEXT,
        ease_factor REAL DEFAULT 2.5,
        interval_days INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review_date TEXT,
        last_reviewed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS grammar_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        topic TEXT NOT NULL,
        explanation TEXT NOT NULL,
        examples TEXT NOT NULL,
        exercises TEXT,
        order_index INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER,
        score REAL,
        items_completed INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        study_minutes INTEGER DEFAULT 0,
        activities_completed INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        mock_id TEXT NOT NULL,
        section TEXT NOT NULL,
        part INTEGER NOT NULL,
        question_index INTEGER NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `,
  },
];

// Convenience query helpers

export async function getUserSettings(): Promise<{
  selected_level: string;
  daily_study_minutes: number;
  notifications_enabled: number;
  onboarding_complete: number;
} | null> {
  const database = await getDatabase();
  return database.getFirstAsync('SELECT * FROM user_settings WHERE id = 1;');
}

export async function updateSelectedLevel(level: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE user_settings SET selected_level = ?, updated_at = datetime('now') WHERE id = 1;",
    level
  );
}

export async function getTodayStreak(): Promise<{
  date: string;
  study_minutes: number;
  activities_completed: number;
} | null> {
  const database = await getDatabase();
  return database.getFirstAsync(
    "SELECT * FROM streaks WHERE date = date('now');"
  );
}

export async function incrementTodayStudy(minutes: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO streaks (date, study_minutes, activities_completed)
     VALUES (date('now'), ?, 1)
     ON CONFLICT(date) DO UPDATE SET
       study_minutes = study_minutes + ?,
       activities_completed = activities_completed + 1;`,
    minutes,
    minutes
  );
}

export async function getRecentAttempts(
  level: string,
  limit: number = 10
): Promise<Array<{ id: number; mock_id: string; total_score: number; total_max: number; passed: number; completed_at: string }>> {
  const database = await getDatabase();
  return database.getAllAsync(
    `SELECT id, mock_id, total_score, total_max, passed, completed_at
     FROM exam_attempts
     WHERE level = ? AND completed_at IS NOT NULL
     ORDER BY completed_at DESC
     LIMIT ?;`,
    level,
    limit
  );
}

export async function getVocabularyDueToday(
  level: string,
  limit: number = 20
): Promise<Array<{ id: number; german: string; english: string; article: string | null; topic: string }>> {
  const database = await getDatabase();
  return database.getAllAsync(
    `SELECT id, german, english, article, topic
     FROM vocabulary
     WHERE level = ?
       AND (next_review_date IS NULL OR next_review_date <= date('now'))
     ORDER BY RANDOM()
     LIMIT ?;`,
    level,
    limit
  );
}
