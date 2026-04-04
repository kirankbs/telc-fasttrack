import {
  calculateNextReview,
  isDueToday,
  getDaysUntilReview,
  getQualityLabel,
} from '../../src/services/spacedRepetition';

// ---------------------------------------------------------------------------
// calculateNextReview
// ---------------------------------------------------------------------------

describe('calculateNextReview — first card, good recall (quality 4)', () => {
  it('sets interval to 1 day on first repetition', () => {
    const result = calculateNextReview(4, 2.5, 0, 0);
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it('sets interval to 6 days on second repetition', () => {
    const result = calculateNextReview(4, 2.5, 1, 1);
    expect(result.intervalDays).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('multiplies by ease factor on third repetition', () => {
    // Default ease factor 2.5, previous interval 6
    const result = calculateNextReview(4, 2.5, 6, 2);
    expect(result.intervalDays).toBe(Math.round(6 * 2.5));
    expect(result.repetitions).toBe(3);
  });
});

describe('calculateNextReview — failed recall (quality < 3)', () => {
  it('resets repetitions to 0 and interval to 1 on blackout', () => {
    const result = calculateNextReview(0, 2.5, 30, 5);
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('resets on quality 1', () => {
    const result = calculateNextReview(1, 2.5, 10, 3);
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('resets on quality 2', () => {
    const result = calculateNextReview(2, 2.5, 10, 3);
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);
  });
});

describe('calculateNextReview — ease factor bounds', () => {
  it('never drops ease factor below 1.3', () => {
    // Quality 0 causes maximum downward adjustment; repeated blackouts should clamp
    let ef = 2.5;
    for (let i = 0; i < 20; i++) {
      const r = calculateNextReview(0, ef, 1, 1);
      ef = r.easeFactor;
    }
    expect(ef).toBeCloseTo(1.3, 5);
  });

  it('increases ease factor on perfect recall', () => {
    const result = calculateNextReview(5, 2.5, 6, 2);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('decreases ease factor on hard recall', () => {
    const result = calculateNextReview(3, 2.5, 6, 2);
    expect(result.easeFactor).toBeLessThan(2.5);
  });
});

describe('calculateNextReview — nextReviewDate', () => {
  it('returns a valid ISO date string', () => {
    const result = calculateNextReview(4, 2.5, 0, 0);
    expect(result.nextReviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('throws on out-of-range quality', () => {
    expect(() => calculateNextReview(6, 2.5, 0, 0)).toThrow(RangeError);
    expect(() => calculateNextReview(-1, 2.5, 0, 0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// isDueToday
// ---------------------------------------------------------------------------

describe('isDueToday', () => {
  it('returns true when nextReviewDate is undefined (never reviewed)', () => {
    expect(isDueToday(undefined)).toBe(true);
  });

  it('returns true when review date is today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isDueToday(today)).toBe(true);
  });

  it('returns true when review date is in the past', () => {
    expect(isDueToday('2000-01-01')).toBe(true);
  });

  it('returns false when review date is in the future', () => {
    expect(isDueToday('2099-12-31')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDaysUntilReview
// ---------------------------------------------------------------------------

describe('getDaysUntilReview', () => {
  it('returns 0 when nextReviewDate is undefined', () => {
    expect(getDaysUntilReview(undefined)).toBe(0);
  });

  it('returns 0 for a past date', () => {
    expect(getDaysUntilReview('2000-01-01')).toBe(0);
  });

  it('returns 0 for today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(getDaysUntilReview(today)).toBe(0);
  });

  it('returns positive integer for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const futureDateStr = future.toISOString().slice(0, 10);
    expect(getDaysUntilReview(futureDateStr)).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// getQualityLabel
// ---------------------------------------------------------------------------

describe('getQualityLabel', () => {
  it('maps 0 and 1 to Again', () => {
    expect(getQualityLabel(0)).toBe('Again');
    expect(getQualityLabel(1)).toBe('Again');
  });

  it('maps 2 to Hard', () => {
    expect(getQualityLabel(2)).toBe('Hard');
  });

  it('maps 3 and 4 to Good', () => {
    expect(getQualityLabel(3)).toBe('Good');
    expect(getQualityLabel(4)).toBe('Good');
  });

  it('maps 5 to Easy', () => {
    expect(getQualityLabel(5)).toBe('Easy');
  });
});
