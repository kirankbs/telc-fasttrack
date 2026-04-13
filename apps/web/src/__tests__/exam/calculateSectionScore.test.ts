import { describe, it, expect } from 'vitest';
import { calculateSectionScore } from '@telc/core';
import type { ListeningSection } from '@telc/types';

function makeSection(questions: { id: string; correctAnswer: string }[]): ListeningSection {
  return {
    totalTimeMinutes: 20,
    parts: [
      {
        partNumber: 1,
        instructions: 'Test',
        instructionsTranslation: '',
        audioFile: 'test.mp3',
        playCount: 1,
        questions: questions.map((q) => ({
          id: q.id,
          type: 'mcq' as const,
          questionText: 'Test question',
          options: ['a) Option A', 'b) Option B'],
          correctAnswer: q.correctAnswer,
          explanation: '',
        })),
      },
    ],
  };
}

describe('calculateSectionScore', () => {
  it('scores each correct answer as 1 point', () => {
    const section = makeSection([
      { id: 'q1', correctAnswer: 'a' },
      { id: 'q2', correctAnswer: 'b' },
    ]);
    const result = calculateSectionScore({ q1: 'a', q2: 'b' }, section);
    expect(result.earned).toBe(2);
    expect(result.max).toBe(2);
    expect(result.passed).toBe(true);
  });

  it('scores wrong answers as 0', () => {
    const section = makeSection([
      { id: 'q1', correctAnswer: 'a' },
      { id: 'q2', correctAnswer: 'b' },
    ]);
    const result = calculateSectionScore({ q1: 'b', q2: 'a' }, section);
    expect(result.earned).toBe(0);
    expect(result.max).toBe(2);
  });

  it('is case-insensitive', () => {
    const section = makeSection([{ id: 'q1', correctAnswer: 'A' }]);
    const result = calculateSectionScore({ q1: 'a' }, section);
    expect(result.earned).toBe(1);
  });

  it('returns earned=0, max=N, passed=false for empty answers map', () => {
    const section = makeSection([
      { id: 'q1', correctAnswer: 'a' },
      { id: 'q2', correctAnswer: 'b' },
      { id: 'q3', correctAnswer: 'c' },
    ]);
    const result = calculateSectionScore({}, section);
    expect(result.earned).toBe(0);
    expect(result.max).toBe(3);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('passes at exactly 60% threshold', () => {
    const section = makeSection([
      { id: 'q1', correctAnswer: 'a' },
      { id: 'q2', correctAnswer: 'b' },
      { id: 'q3', correctAnswer: 'c' },
      { id: 'q4', correctAnswer: 'd' },
      { id: 'q5', correctAnswer: 'e' },
    ]);
    // 3/5 = 60%
    const result = calculateSectionScore(
      { q1: 'a', q2: 'b', q3: 'c', q4: 'wrong', q5: 'wrong' },
      section,
    );
    expect(result.earned).toBe(3);
    expect(result.passed).toBe(true);
  });

  it('handles section with no parts (0/0 = 0, not divide-by-zero)', () => {
    const section: ListeningSection = { totalTimeMinutes: 0, parts: [] };
    const result = calculateSectionScore({}, section);
    expect(result.earned).toBe(0);
    expect(result.max).toBe(0);
    expect(result.percentage).toBe(0);
  });
});
