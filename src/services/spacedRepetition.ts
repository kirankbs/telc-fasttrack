// SM-2 spaced repetition algorithm for vocabulary flashcards.
// Ref: Wozniak, P.A. (1990). "Optimization of learning" — original SM-2 paper.
//
// Quality scale:
//   0 = complete blackout
//   1 = wrong answer, remembered on seeing correct
//   2 = wrong answer, but correct felt obvious
//   3 = correct with significant difficulty
//   4 = correct after a hesitation
//   5 = perfect recall

export interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string (YYYY-MM-DD)
}

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function calculateNextReview(
  quality: number,
  easeFactor: number = DEFAULT_EASE_FACTOR,
  intervalDays: number = 0,
  repetitions: number = 0
): SM2Result {
  if (quality < 0 || quality > 5) {
    throw new RangeError(`SM-2 quality must be 0–5, got ${quality}`);
  }

  // Update ease factor first (applied regardless of quality)
  const easeAdjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeAdjustment);

  let newRepetitions: number;
  let newInterval: number;

  if (quality < 3) {
    // Failed recall — restart the schedule
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;

    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEaseFactor);
    }
  }

  const nextReviewDate = toISODate(addDays(new Date(), newInterval));

  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}

export function isDueToday(nextReviewDate: string | undefined): boolean {
  if (nextReviewDate === undefined || nextReviewDate === null) {
    // Never reviewed — always due
    return true;
  }
  const today = toISODate(new Date());
  return nextReviewDate <= today;
}

export function getDaysUntilReview(nextReviewDate: string | undefined): number {
  if (nextReviewDate === undefined || nextReviewDate === null) {
    return 0;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const review = new Date(nextReviewDate + 'T00:00:00');
  const diffMs = review.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Maps quality values to the four-button labels used in flashcard UIs.
// Quality 0–1 both map to "Again" since either is a failed recall at the UX level.
export function getQualityLabel(quality: number): string {
  if (quality <= 1) return 'Again';
  if (quality === 2) return 'Hard';
  if (quality <= 4) return 'Good';
  return 'Easy';
}
