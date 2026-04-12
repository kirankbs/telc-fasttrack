/**
 * Tests for vocabularyService.ts
 *
 * All SQLite calls are mocked — the service is tested purely as a layer of
 * query logic between the caller and the DB.
 */

import {
  seedVocabularyIfEmpty,
  recordVocabReview,
  getVocabularyStats,
} from '../../src/services/vocabularyService';
import type { VocabularyItem } from '../../src/types/exam';
import type { SM2Result } from '../../src/services/spacedRepetition';

// ---------------------------------------------------------------------------
// DB mock
// ---------------------------------------------------------------------------

const mockRunAsync = jest.fn().mockResolvedValue(undefined);
const mockGetFirstAsync = jest.fn();
const mockWithTransactionAsync = jest.fn(
  async (fn: () => Promise<void>) => fn()
);

jest.mock('../../src/services/database', () => ({
  getDatabase: jest.fn().mockResolvedValue({
    runAsync: (...args: unknown[]) => mockRunAsync(...args),
    getFirstAsync: (...args: unknown[]) => mockGetFirstAsync(...args),
    withTransactionAsync: (fn: () => Promise<void>) =>
      mockWithTransactionAsync(fn),
  }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SAMPLE_ITEMS: VocabularyItem[] = [
  {
    id: 1,
    level: 'A1',
    german: 'der Name',
    english: 'name',
    article: 'der',
    plural: 'die Namen',
    exampleSentence: 'Mein Name ist Thomas.',
    topic: 'Persönliche Angaben',
    audioFile: undefined,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewDate: undefined,
    lastReviewedAt: undefined,
  },
  {
    id: 2,
    level: 'A1',
    german: 'das Alter',
    english: 'age',
    article: 'das',
    topic: 'Persönliche Angaben',
    audioFile: undefined,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewDate: undefined,
    lastReviewedAt: undefined,
  },
];

const SAMPLE_SM2_RESULT: SM2Result = {
  easeFactor: 2.6,
  intervalDays: 1,
  repetitions: 1,
  nextReviewDate: '2026-04-04',
};

// ---------------------------------------------------------------------------
// seedVocabularyIfEmpty
// ---------------------------------------------------------------------------

describe('seedVocabularyIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips insert when rows already exist', async () => {
    mockGetFirstAsync.mockResolvedValue({ count: 5 });

    await seedVocabularyIfEmpty('A1', SAMPLE_ITEMS);

    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('inserts all items when table is empty', async () => {
    mockGetFirstAsync.mockResolvedValue({ count: 0 });

    await seedVocabularyIfEmpty('A1', SAMPLE_ITEMS);

    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    // runAsync called once per item
    expect(mockRunAsync).toHaveBeenCalledTimes(SAMPLE_ITEMS.length);
  });

  it('inserts items when count row is null (fresh DB)', async () => {
    mockGetFirstAsync.mockResolvedValue(null);

    await seedVocabularyIfEmpty('A1', SAMPLE_ITEMS);

    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledTimes(SAMPLE_ITEMS.length);
  });

  it('passes correct SQL params for each item', async () => {
    mockGetFirstAsync.mockResolvedValue({ count: 0 });

    await seedVocabularyIfEmpty('A1', SAMPLE_ITEMS);

    const firstCall = mockRunAsync.mock.calls[0];
    // First positional param after SQL is level
    expect(firstCall[1]).toBe('A1');
    // German word
    expect(firstCall[2]).toBe('der Name');
    // English
    expect(firstCall[3]).toBe('name');
  });
});

// ---------------------------------------------------------------------------
// recordVocabReview
// ---------------------------------------------------------------------------

describe('recordVocabReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls runAsync with correct SM-2 fields', async () => {
    await recordVocabReview(42, 4, SAMPLE_SM2_RESULT);

    expect(mockRunAsync).toHaveBeenCalledTimes(1);
    const [, easeFactor, intervalDays, repetitions, nextReviewDate, id] =
      mockRunAsync.mock.calls[0];
    expect(easeFactor).toBe(SAMPLE_SM2_RESULT.easeFactor);
    expect(intervalDays).toBe(SAMPLE_SM2_RESULT.intervalDays);
    expect(repetitions).toBe(SAMPLE_SM2_RESULT.repetitions);
    expect(nextReviewDate).toBe(SAMPLE_SM2_RESULT.nextReviewDate);
    expect(id).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// getVocabularyStats
// ---------------------------------------------------------------------------

describe('getVocabularyStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns aggregated counts from four queries', async () => {
    mockGetFirstAsync
      .mockResolvedValueOnce({ n: 100 }) // total
      .mockResolvedValueOnce({ n: 40 })  // reviewed
      .mockResolvedValueOnce({ n: 12 })  // dueToday
      .mockResolvedValueOnce({ n: 8 });  // mastered

    const stats = await getVocabularyStats('A1');

    expect(stats.total).toBe(100);
    expect(stats.reviewed).toBe(40);
    expect(stats.dueToday).toBe(12);
    expect(stats.mastered).toBe(8);
  });

  it('returns zeros when all queries return null', async () => {
    mockGetFirstAsync.mockResolvedValue(null);

    const stats = await getVocabularyStats('A1');

    expect(stats.total).toBe(0);
    expect(stats.reviewed).toBe(0);
    expect(stats.dueToday).toBe(0);
    expect(stats.mastered).toBe(0);
  });

  it('issues exactly four getFirstAsync calls', async () => {
    mockGetFirstAsync.mockResolvedValue({ n: 0 });

    await getVocabularyStats('A1');

    expect(mockGetFirstAsync).toHaveBeenCalledTimes(4);
  });
});
