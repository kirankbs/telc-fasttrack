import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import { getDatabase } from '../services/database';
import {
  calculateExamScore,
  type ExamScore,
  type QuestionResponse,
} from '../services/scoringEngine';
import type { MockExam } from '../types/exam';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExamMode = 'exam_sim' | 'practice';

type SectionKey = 'listening' | 'reading' | 'writing' | 'speaking';

interface SectionScoreEntry {
  earned: number;
  max: number;
}

export interface ExamSession {
  mockId: string;
  level: string;
  exam: MockExam;
  mode: ExamMode;
  /** DB row ID — null until the INSERT resolves */
  attemptId: number | null;
  /** Flat answer map: questionId → userAnswer */
  answers: Record<string, string>;
  listeningComplete: boolean;
  readingComplete: boolean;
  writingComplete: boolean;
  speakingComplete: boolean;
  sectionScores: Partial<Record<SectionKey, SectionScoreEntry>>;
  startedAt: string;
}

interface ExamContextValue {
  session: ExamSession | null;
  startExam: (
    mockId: string,
    level: string,
    exam: MockExam,
    mode: ExamMode
  ) => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  completeSection: (section: SectionKey, score: SectionScoreEntry) => void;
  endExam: () => Promise<ExamScore | null>;
  resetExam: () => void;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | {
      type: 'START';
      payload: {
        mockId: string;
        level: string;
        exam: MockExam;
        mode: ExamMode;
        startedAt: string;
      };
    }
  | { type: 'SET_ATTEMPT_ID'; payload: number }
  | { type: 'SET_ANSWER'; questionId: string; answer: string }
  | {
      type: 'COMPLETE_SECTION';
      section: SectionKey;
      score: SectionScoreEntry;
    }
  | { type: 'RESET' };

function reducer(state: ExamSession | null, action: Action): ExamSession | null {
  switch (action.type) {
    case 'START':
      return {
        mockId: action.payload.mockId,
        level: action.payload.level,
        exam: action.payload.exam,
        mode: action.payload.mode,
        attemptId: null,
        answers: {},
        listeningComplete: false,
        readingComplete: false,
        writingComplete: false,
        speakingComplete: false,
        sectionScores: {},
        startedAt: action.payload.startedAt,
      };

    case 'SET_ATTEMPT_ID':
      if (!state) return state;
      return { ...state, attemptId: action.payload };

    case 'SET_ANSWER':
      if (!state) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };

    case 'COMPLETE_SECTION': {
      if (!state) return state;
      const completionFlag = `${action.section}Complete` as
        | 'listeningComplete'
        | 'readingComplete'
        | 'writingComplete'
        | 'speakingComplete';
      return {
        ...state,
        [completionFlag]: true,
        sectionScores: {
          ...state.sectionScores,
          [action.section]: action.score,
        },
      };
    }

    case 'RESET':
      return null;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ExamContext = createContext<ExamContextValue | null>(null);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [session, dispatch] = useReducer(reducer, null);

  // Keep a stable ref so async DB callbacks can read current session
  // without stale closure issues.
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const startExam = useCallback(
    async (
      mockId: string,
      level: string,
      exam: MockExam,
      mode: ExamMode
    ): Promise<void> => {
      const startedAt = new Date().toISOString();

      dispatch({
        type: 'START',
        payload: { mockId, level, exam, mode, startedAt },
      });

      try {
        const db = await getDatabase();
        const result = await db.runAsync(
          `INSERT INTO exam_attempts (level, mock_id, started_at)
           VALUES (?, ?, ?);`,
          level,
          mockId,
          startedAt
        );
        dispatch({ type: 'SET_ATTEMPT_ID', payload: result.lastInsertRowId });
      } catch (err) {
        console.error('[ExamContext] Failed to persist attempt start:', err);
      }
    },
    []
  );

  const setAnswer = useCallback((questionId: string, answer: string): void => {
    dispatch({ type: 'SET_ANSWER', questionId, answer });
  }, []);

  const completeSection = useCallback(
    (section: SectionKey, score: SectionScoreEntry): void => {
      dispatch({ type: 'COMPLETE_SECTION', section, score });

      // Persist the section score to DB asynchronously — non-blocking.
      const current = sessionRef.current;
      if (!current?.attemptId) return;

      const col = section as string;
      getDatabase()
        .then((db) =>
          db.runAsync(
            `UPDATE exam_attempts
             SET ${col}_score = ?, ${col}_max = ?
             WHERE id = ?;`,
            score.earned,
            score.max,
            current.attemptId as number
          )
        )
        .catch((err) =>
          console.error(`[ExamContext] Failed to persist ${section} score:`, err)
        );
    },
    []
  );

  const endExam = useCallback(async (): Promise<ExamScore | null> => {
    const current = sessionRef.current;
    if (!current) return null;

    // Build QuestionResponse list from flat answers map.
    // For objective questions the answer string is the user's selection.
    // For writing/speaking the answers map stores points encoded as a
    // numeric string under the task/part key (e.g. "writing_task_1" → "7").
    const responses: QuestionResponse[] = Object.entries(current.answers).map(
      ([questionId, userAnswer]) => {
        const points = parseFloat(userAnswer);
        // Only carry `points` for non-NaN values (writing/speaking keys).
        const isPointsKey =
          questionId.startsWith('writing_task_') ||
          questionId.startsWith('speaking_part_');

        return isPointsKey && !isNaN(points)
          ? { questionId, userAnswer, correctAnswer: '', points }
          : { questionId, userAnswer, correctAnswer: userAnswer };
      }
    );

    const examScore = calculateExamScore(responses, current.exam);
    const completedAt = new Date().toISOString();
    const startMs = new Date(current.startedAt).getTime();
    const timeSpentSeconds = Math.round(
      (new Date(completedAt).getTime() - startMs) / 1000
    );

    if (current.attemptId !== null) {
      try {
        const db = await getDatabase();
        await db.runAsync(
          `UPDATE exam_attempts
           SET completed_at        = ?,
               listening_score     = ?,
               listening_max       = ?,
               reading_score       = ?,
               reading_max         = ?,
               writing_score       = ?,
               writing_max         = ?,
               speaking_score      = ?,
               speaking_max        = ?,
               sprachbausteine_score = ?,
               sprachbausteine_max   = ?,
               total_score         = ?,
               total_max           = ?,
               passed              = ?,
               time_spent_seconds  = ?
           WHERE id = ?;`,
          completedAt,
          examScore.listening.earned,
          examScore.listening.max,
          examScore.reading.earned,
          examScore.reading.max,
          examScore.writing.earned,
          examScore.writing.max,
          examScore.speaking.earned,
          examScore.speaking.max,
          examScore.sprachbausteine?.earned ?? null,
          examScore.sprachbausteine?.max ?? null,
          examScore.overall.earned,
          examScore.overall.max,
          examScore.passed ? 1 : 0,
          timeSpentSeconds,
          current.attemptId
        );
      } catch (err) {
        console.error('[ExamContext] Failed to persist final scores:', err);
      }
    }

    return examScore;
  }, []);

  const resetExam = useCallback((): void => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: ExamContextValue = {
    session,
    startExam,
    setAnswer,
    completeSection,
    endExam,
    resetExam,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam(): ExamContextValue {
  const ctx = useContext(ExamContext);
  if (ctx === null) {
    throw new Error('useExam must be used inside <ExamProvider>');
  }
  return ctx;
}
