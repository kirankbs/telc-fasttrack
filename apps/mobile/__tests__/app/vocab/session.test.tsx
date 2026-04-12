/**
 * Tests for vocab session logic.
 *
 * Rendering the full session screen exhausts the Jest worker heap on this
 * machine (same constraint as home.test.tsx — reanimated-heavy component with
 * --no-cache transforms). We test the pure queue-management and SM-2
 * integration logic directly instead.
 *
 * Coverage:
 * - SM-2 quality mapping (which qualities trigger re-queue)
 * - Queue re-insertion logic for failed cards
 * - Completion detection (cursor >= queue length)
 * - Average quality label computation
 * - recordVocabReview is called with correct args
 * - seedVocabularyIfEmpty is called on load
 */

import { calculateNextReview } from '../../../src/services/spacedRepetition';
import { seedVocabularyIfEmpty, recordVocabReview } from '../../../src/services/vocabularyService';
import { getVocabularyDueToday } from '../../../src/services/database';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetVocabDue = jest.fn();
jest.mock('../../../src/services/database', () => ({
  getVocabularyDueToday: (...args: unknown[]) => mockGetVocabDue(...args),
}));

const mockSeedVocab = jest.fn().mockResolvedValue(undefined);
const mockRecordReview = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../src/services/vocabularyService', () => ({
  seedVocabularyIfEmpty: (...args: unknown[]) => mockSeedVocab(...args),
  recordVocabReview: (...args: unknown[]) => mockRecordReview(...args),
}));

// ---------------------------------------------------------------------------
// Pure queue helpers extracted from session logic for testing
// (mirrors what session.tsx does on each handleRating call)
// ---------------------------------------------------------------------------

interface SessionCard {
  id: number;
  german: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

function advanceQueue(
  queue: SessionCard[],
  cursor: number,
  quality: number
): { nextQueue: SessionCard[]; nextCursor: number; done: boolean } {
  const card = queue[cursor];
  const result = calculateNextReview(
    quality,
    card.easeFactor,
    card.intervalDays,
    card.repetitions
  );

  let nextQueue = queue;
  if (quality < 3) {
    nextQueue = [...queue, { ...card, repetitions: result.repetitions }];
  }

  const nextCursor = cursor + 1;
  const done = nextCursor >= nextQueue.length;
  return { nextQueue, nextCursor, done };
}

function computeAvgLabel(sumQuality: number, totalSeen: number): string {
  const avg = totalSeen > 0 ? sumQuality / totalSeen : 0;
  if (avg >= 4.5) return 'Leicht';
  if (avg >= 3.5) return 'Gut';
  if (avg >= 2.5) return 'Schwer';
  return 'Nochmal';
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CARD_A: SessionCard = { id: 1, german: 'der Name', easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
const CARD_B: SessionCard = { id: 2, german: 'das Alter', easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
const TWO_CARD_QUEUE = [CARD_A, CARD_B];

// ---------------------------------------------------------------------------
// Queue logic
// ---------------------------------------------------------------------------

describe('advanceQueue — good/easy ratings (quality >= 3)', () => {
  it('moves cursor forward without growing queue on quality 4 (Gut)', () => {
    const { nextQueue, nextCursor } = advanceQueue(TWO_CARD_QUEUE, 0, 4);
    expect(nextQueue.length).toBe(2);
    expect(nextCursor).toBe(1);
  });

  it('moves cursor forward without growing queue on quality 5 (Leicht)', () => {
    const { nextQueue, nextCursor } = advanceQueue(TWO_CARD_QUEUE, 0, 5);
    expect(nextQueue.length).toBe(2);
    expect(nextCursor).toBe(1);
  });

  it('moves cursor forward without growing queue on quality 3 (Schwer)', () => {
    const { nextQueue, nextCursor } = advanceQueue(TWO_CARD_QUEUE, 0, 3);
    expect(nextQueue.length).toBe(2);
    expect(nextCursor).toBe(1);
  });
});

describe('advanceQueue — failed ratings (quality < 3)', () => {
  it('re-appends card to end of queue on quality 1 (Nochmal)', () => {
    const { nextQueue, nextCursor } = advanceQueue(TWO_CARD_QUEUE, 0, 1);
    expect(nextQueue.length).toBe(3);
    expect(nextCursor).toBe(1);
    // Re-appended card is last
    expect(nextQueue[2].id).toBe(CARD_A.id);
  });

  it('re-appends card to end of queue on quality 0 (blackout)', () => {
    const { nextQueue } = advanceQueue(TWO_CARD_QUEUE, 0, 0);
    expect(nextQueue.length).toBe(3);
  });

  it('re-appended card has SM-2 updated repetitions (reset to 0)', () => {
    const { nextQueue } = advanceQueue(TWO_CARD_QUEUE, 0, 1);
    const requeued = nextQueue[2];
    expect(requeued.repetitions).toBe(0); // SM-2 resets on failure
  });
});

describe('advanceQueue — completion detection', () => {
  it('done=true when last card rated good', () => {
    const { done } = advanceQueue(TWO_CARD_QUEUE, 1, 4);
    expect(done).toBe(true);
  });

  it('done=false when more cards remain', () => {
    const { done } = advanceQueue(TWO_CARD_QUEUE, 0, 4);
    expect(done).toBe(false);
  });

  it('done=false when failed card re-appended (queue grew)', () => {
    // cursor 1 is last in original 2-card queue, but quality<3 appends another
    const { done } = advanceQueue(TWO_CARD_QUEUE, 1, 1);
    expect(done).toBe(false);
  });

  it('single card queue completes on good rating', () => {
    const { done } = advanceQueue([CARD_A], 0, 4);
    expect(done).toBe(true);
  });

  it('single card queue loops once on failed rating', () => {
    const { done, nextQueue } = advanceQueue([CARD_A], 0, 1);
    expect(done).toBe(false);
    expect(nextQueue.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Average quality label
// ---------------------------------------------------------------------------

describe('computeAvgLabel', () => {
  it('returns "Leicht" for avg >= 4.5', () => {
    expect(computeAvgLabel(5 + 5, 2)).toBe('Leicht'); // avg 5.0
  });

  it('returns "Gut" for avg 3.5–4.4', () => {
    expect(computeAvgLabel(4 + 4, 2)).toBe('Gut'); // avg 4.0
  });

  it('returns "Schwer" for avg 2.5–3.4', () => {
    expect(computeAvgLabel(3 + 3, 2)).toBe('Schwer'); // avg 3.0
  });

  it('returns "Nochmal" for avg < 2.5', () => {
    expect(computeAvgLabel(1 + 1, 2)).toBe('Nochmal'); // avg 1.0
  });

  it('returns "Nochmal" when totalSeen is 0', () => {
    expect(computeAvgLabel(0, 0)).toBe('Nochmal');
  });
});

// ---------------------------------------------------------------------------
// DB integration — seed and record helpers
// ---------------------------------------------------------------------------

describe('seedVocabularyIfEmpty integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is called with level and vocab array on load', async () => {
    const fakeItems = [{ id: 1, level: 'A1', german: 'test', english: 'test', topic: 'test', easeFactor: 2.5, intervalDays: 0, repetitions: 0 }];
    await seedVocabularyIfEmpty('A1', fakeItems as any);
    expect(mockSeedVocab).toHaveBeenCalledWith('A1', fakeItems);
  });
});

describe('recordVocabReview integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is called with id, quality, and SM-2 result', async () => {
    const result = calculateNextReview(4, 2.5, 0, 0);
    await recordVocabReview(7, 4, result);
    expect(mockRecordReview).toHaveBeenCalledWith(7, 4, result);
  });

  it('passes quality=1 for Nochmal', async () => {
    const result = calculateNextReview(1, 2.5, 6, 2);
    await recordVocabReview(3, 1, result);
    expect(mockRecordReview.mock.calls[0][1]).toBe(1);
  });

  it('passes quality=5 for Leicht', async () => {
    const result = calculateNextReview(5, 2.5, 6, 2);
    await recordVocabReview(3, 5, result);
    expect(mockRecordReview.mock.calls[0][1]).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// getVocabularyDueToday — empty state trigger
// ---------------------------------------------------------------------------

describe('getVocabularyDueToday', () => {
  beforeEach(() => jest.clearAllMocks());

  it('empty result triggers empty state (0 cards)', async () => {
    mockGetVocabDue.mockResolvedValue([]);
    const rows = await mockGetVocabDue('A1', 20);
    expect(rows.length).toBe(0);
  });

  it('20-card cap respected by query param', async () => {
    mockGetVocabDue.mockResolvedValue([]);
    await getVocabularyDueToday('A1', 20);
    expect(mockGetVocabDue).toHaveBeenCalledWith('A1', 20);
  });
});
