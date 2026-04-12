import {
  calculateExamScore,
  calculateSectionScore,
  getReadinessLevel,
  formatScore,
  SectionScore,
} from '../../src/services/scoringEngine';
import type { MockExam, ListeningSection } from '../../src/types/exam';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sectionScore(earned: number, max: number): SectionScore {
  const percentage = max > 0 ? earned / max : 0;
  return { earned, max, percentage, passed: percentage >= 0.6 };
}

function buildMinimalExam(): MockExam {
  return {
    id: 'A1_mock_01',
    level: 'A1',
    title: 'Übungstest 1',
    version: 1,
    sections: {
      listening: {
        totalTimeMinutes: 20,
        parts: [
          {
            partNumber: 1,
            instructions: '',
            instructionsTranslation: '',
            audioFile: 'assets/audio/A1/mock01/listening_part1.mp3',
            playCount: 2,
            questions: [
              { id: 'L1_q1', type: 'mcq', questionText: 'Q1', options: ['a', 'b', 'c'], correctAnswer: 'a', explanation: '' },
              { id: 'L1_q2', type: 'mcq', questionText: 'Q2', options: ['a', 'b', 'c'], correctAnswer: 'b', explanation: '' },
            ],
          },
        ],
      },
      reading: {
        totalTimeMinutes: 25,
        parts: [
          {
            partNumber: 1,
            instructions: '',
            instructionsTranslation: '',
            texts: [],
            questions: [
              { id: 'R1_q1', type: 'true_false', questionText: 'Q1', correctAnswer: 'richtig', explanation: '' },
              { id: 'R1_q2', type: 'true_false', questionText: 'Q2', correctAnswer: 'falsch', explanation: '' },
            ],
          },
        ],
      },
      writing: {
        totalTimeMinutes: 20,
        tasks: [
          {
            taskNumber: 1,
            type: 'form_fill',
            instructions: '',
            instructionsTranslation: '',
            sampleAnswer: '',
            scoringCriteria: [
              { criterion: 'Inhalt', maxPoints: 6, description: '' },
              { criterion: 'Sprache', maxPoints: 6, description: '' },
            ],
          },
        ],
      },
      speaking: {
        totalTimeMinutes: 15,
        prepTimeMinutes: 0,
        parts: [
          { partNumber: 1, type: 'introduce', instructions: '', instructionsTranslation: '', prompt: '', sampleResponse: '', evaluationTips: [], keyPhrases: [] },
          { partNumber: 2, type: 'picture_cards', instructions: '', instructionsTranslation: '', prompt: '', sampleResponse: '', evaluationTips: [], keyPhrases: [] },
          { partNumber: 3, type: 'und_du', instructions: '', instructionsTranslation: '', prompt: '', sampleResponse: '', evaluationTips: [], keyPhrases: [] },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// calculateSectionScore
// ---------------------------------------------------------------------------

describe('calculateSectionScore', () => {
  const section: ListeningSection = {
    totalTimeMinutes: 20,
    parts: [
      {
        partNumber: 1,
        instructions: '',
        instructionsTranslation: '',
        audioFile: '',
        playCount: 2,
        questions: [
          { id: 'q1', type: 'mcq', questionText: '', correctAnswer: 'a', explanation: '' },
          { id: 'q2', type: 'mcq', questionText: '', correctAnswer: 'b', explanation: '' },
          { id: 'q3', type: 'true_false', questionText: '', correctAnswer: 'richtig', explanation: '' },
        ],
      },
    ],
  };

  it('scores all correct', () => {
    const result = calculateSectionScore({ q1: 'a', q2: 'b', q3: 'richtig' }, section);
    expect(result.earned).toBe(3);
    expect(result.max).toBe(3);
    expect(result.passed).toBe(true);
  });

  it('scores partial correct', () => {
    const result = calculateSectionScore({ q1: 'a', q2: 'c', q3: 'falsch' }, section);
    expect(result.earned).toBe(1);
    expect(result.max).toBe(3);
    expect(result.passed).toBe(false);
  });

  it('handles missing answers as wrong', () => {
    const result = calculateSectionScore({}, section);
    expect(result.earned).toBe(0);
    expect(result.max).toBe(3);
  });

  it('is case-insensitive', () => {
    const result = calculateSectionScore({ q1: 'A', q2: 'B', q3: 'Richtig' }, section);
    expect(result.earned).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// calculateExamScore
// ---------------------------------------------------------------------------

describe('calculateExamScore', () => {
  it('marks passed when both written and oral >= 60%', () => {
    const exam = buildMinimalExam();
    const responses = [
      // Listening: 2/2
      { questionId: 'L1_q1', userAnswer: 'a', correctAnswer: 'a' },
      { questionId: 'L1_q2', userAnswer: 'b', correctAnswer: 'b' },
      // Reading: 2/2
      { questionId: 'R1_q1', userAnswer: 'richtig', correctAnswer: 'richtig' },
      { questionId: 'R1_q2', userAnswer: 'falsch', correctAnswer: 'falsch' },
      // Writing task 1: 12/12 (via points)
      { questionId: 'writing_task_1', userAnswer: '', correctAnswer: '', points: 12 },
      // Speaking: 8/8 per part
      { questionId: 'speaking_part_1', userAnswer: '', correctAnswer: '', points: 8 },
      { questionId: 'speaking_part_2', userAnswer: '', correctAnswer: '', points: 8 },
      { questionId: 'speaking_part_3', userAnswer: '', correctAnswer: '', points: 8 },
    ];

    const score = calculateExamScore(responses, exam);

    expect(score.passed).toBe(true);
    expect(score.listening.earned).toBe(2);
    expect(score.reading.earned).toBe(2);
    expect(score.writing.earned).toBe(12);
    expect(score.speaking.earned).toBe(24);
    expect(score.written.passed).toBe(true);
    expect(score.oral.passed).toBe(true);
  });

  it('fails when oral is below 60% even if written passes', () => {
    const exam = buildMinimalExam();
    const responses = [
      { questionId: 'L1_q1', userAnswer: 'a', correctAnswer: 'a' },
      { questionId: 'L1_q2', userAnswer: 'b', correctAnswer: 'b' },
      { questionId: 'R1_q1', userAnswer: 'richtig', correctAnswer: 'richtig' },
      { questionId: 'R1_q2', userAnswer: 'falsch', correctAnswer: 'falsch' },
      { questionId: 'writing_task_1', userAnswer: '', correctAnswer: '', points: 12 },
      // Speaking: only 4/8 on each part (below 60%)
      { questionId: 'speaking_part_1', userAnswer: '', correctAnswer: '', points: 4 },
      { questionId: 'speaking_part_2', userAnswer: '', correctAnswer: '', points: 4 },
      { questionId: 'speaking_part_3', userAnswer: '', correctAnswer: '', points: 4 },
    ];

    const score = calculateExamScore(responses, exam);

    expect(score.written.passed).toBe(true);
    expect(score.oral.passed).toBe(false);
    expect(score.passed).toBe(false);
  });

  it('caps speaking points at part maximum', () => {
    const exam = buildMinimalExam();
    const responses = [
      { questionId: 'speaking_part_1', userAnswer: '', correctAnswer: '', points: 100 },
      { questionId: 'speaking_part_2', userAnswer: '', correctAnswer: '', points: 100 },
      { questionId: 'speaking_part_3', userAnswer: '', correctAnswer: '', points: 100 },
    ];

    const score = calculateExamScore(responses, exam);
    expect(score.speaking.earned).toBe(24); // capped at 8 per part × 3
  });

  it('overall combines written and oral', () => {
    const exam = buildMinimalExam();
    const responses = [
      { questionId: 'L1_q1', userAnswer: 'a', correctAnswer: 'a' },
      { questionId: 'L1_q2', userAnswer: 'b', correctAnswer: 'b' },
      { questionId: 'R1_q1', userAnswer: 'richtig', correctAnswer: 'richtig' },
      { questionId: 'R1_q2', userAnswer: 'falsch', correctAnswer: 'falsch' },
      { questionId: 'writing_task_1', userAnswer: '', correctAnswer: '', points: 12 },
      { questionId: 'speaking_part_1', userAnswer: '', correctAnswer: '', points: 8 },
      { questionId: 'speaking_part_2', userAnswer: '', correctAnswer: '', points: 8 },
      { questionId: 'speaking_part_3', userAnswer: '', correctAnswer: '', points: 8 },
    ];

    const score = calculateExamScore(responses, exam);
    // written max: 2+2+12 = 16, oral max: 24
    expect(score.overall.max).toBe(40);
    expect(score.overall.earned).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// getReadinessLevel
// ---------------------------------------------------------------------------

describe('getReadinessLevel', () => {
  it('returns building below 40%', () => {
    expect(getReadinessLevel(0)).toBe('building');
    expect(getReadinessLevel(0.39)).toBe('building');
  });

  it('returns developing 40–59%', () => {
    expect(getReadinessLevel(0.4)).toBe('developing');
    expect(getReadinessLevel(0.59)).toBe('developing');
  });

  it('returns almost 60–74%', () => {
    expect(getReadinessLevel(0.6)).toBe('almost');
    expect(getReadinessLevel(0.74)).toBe('almost');
  });

  it('returns ready at 75% and above', () => {
    expect(getReadinessLevel(0.75)).toBe('ready');
    expect(getReadinessLevel(1)).toBe('ready');
  });
});

// ---------------------------------------------------------------------------
// formatScore
// ---------------------------------------------------------------------------

describe('formatScore', () => {
  it('formats correctly', () => {
    expect(formatScore(sectionScore(18, 24))).toBe('18/24 (75%)');
    expect(formatScore(sectionScore(0, 24))).toBe('0/24 (0%)');
    expect(formatScore(sectionScore(24, 24))).toBe('24/24 (100%)');
  });

  it('rounds percentage', () => {
    // 1/3 = 33.3…% → rounds to 33
    expect(formatScore(sectionScore(1, 3))).toBe('1/3 (33%)');
  });
});
