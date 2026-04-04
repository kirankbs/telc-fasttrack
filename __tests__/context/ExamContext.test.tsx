/**
 * Unit tests for ExamContext.
 *
 * Validates state transitions through startExam, setAnswer, completeSection,
 * endExam, and resetExam without touching the real SQLite database.
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockRunAsync = jest.fn().mockResolvedValue({ lastInsertRowId: 42 });
const mockGetDatabase = jest.fn().mockResolvedValue({ runAsync: mockRunAsync });

jest.mock('../../src/services/database', () => ({
  getDatabase: () => mockGetDatabase(),
}));

jest.mock('../../src/services/scoringEngine', () => ({
  calculateExamScore: jest.fn().mockReturnValue({
    listening: { earned: 18, max: 24, percentage: 0.75, passed: true },
    reading:   { earned: 16, max: 24, percentage: 0.67, passed: true },
    writing:   { earned: 8,  max: 12, percentage: 0.67, passed: true },
    speaking:  { earned: 14, max: 24, percentage: 0.58, passed: false },
    written:   { earned: 42, max: 60, percentage: 0.7,  passed: true },
    oral:      { earned: 14, max: 24, percentage: 0.58, passed: false },
    overall:   { earned: 56, max: 84, percentage: 0.67, passed: false },
    passed: false,
  }),
}));

import { ExamProvider, useExam, type ExamMode } from '../../src/context/ExamContext';
import type { MockExam } from '../../src/types/exam';

// ---------------------------------------------------------------------------
// Minimal fixture
// ---------------------------------------------------------------------------

function buildExam(): MockExam {
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
            audioFile: '',
            playCount: 2,
            questions: [
              { id: 'L_q1', type: 'mcq', questionText: 'Q1', options: ['a', 'b'], correctAnswer: 'a', explanation: '' },
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
              { id: 'R_q1', type: 'true_false', questionText: 'Q1', correctAnswer: 'richtig', explanation: '' },
            ],
          },
        ],
      },
      writing: {
        totalTimeMinutes: 20,
        tasks: [
          {
            taskNumber: 1,
            type: 'short_message',
            instructions: '',
            instructionsTranslation: '',
            sampleAnswer: '',
            scoringCriteria: [{ criterion: 'Inhalt', maxPoints: 6, description: '' }],
          },
        ],
      },
      speaking: {
        totalTimeMinutes: 15,
        prepTimeMinutes: 0,
        parts: [
          {
            partNumber: 1,
            instructions: '',
            instructionsTranslation: '',
            type: 'introduce',
            prompt: '',
            sampleResponse: '',
            evaluationTips: [],
            keyPhrases: [],
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

type SpyFn = (value: ReturnType<typeof useExam>) => void;

function TestHarness({ spy }: { spy: SpyFn }) {
  const ctx = useExam();
  spy(ctx);
  return <View testID="harness" />;
}

function renderWithProvider(spy: SpyFn) {
  return render(
    <ExamProvider>
      <TestHarness spy={spy} />
    </ExamProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExamContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue({ runAsync: mockRunAsync });
    mockRunAsync.mockResolvedValue({ lastInsertRowId: 42 });
  });

  it('starts with null session', () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });
    expect(ctx.session).toBeNull();
  });

  it('sets session on startExam', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    const exam = buildExam();
    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', exam, 'practice');
    });

    expect(ctx.session).not.toBeNull();
    expect(ctx.session?.mockId).toBe('A1_mock_01');
    expect(ctx.session?.level).toBe('A1');
    expect(ctx.session?.mode).toBe('practice');
    expect(ctx.session?.answers).toEqual({});
  });

  it('sets attemptId from DB after startExam', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', buildExam(), 'exam_sim');
    });

    await waitFor(() => {
      expect(ctx.session?.attemptId).toBe(42);
    });
  });

  it('records answer via setAnswer', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', buildExam(), 'practice');
    });

    act(() => {
      ctx.setAnswer('L_q1', 'a');
    });

    expect(ctx.session?.answers['L_q1']).toBe('a');
  });

  it('updates multiple answers without clobbering', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', buildExam(), 'practice');
    });

    act(() => {
      ctx.setAnswer('L_q1', 'a');
      ctx.setAnswer('R_q1', 'richtig');
    });

    expect(ctx.session?.answers['L_q1']).toBe('a');
    expect(ctx.session?.answers['R_q1']).toBe('richtig');
  });

  it('marks section complete via completeSection', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', buildExam(), 'practice');
    });

    act(() => {
      ctx.completeSection('listening', { earned: 18, max: 24 });
    });

    expect(ctx.session?.listeningComplete).toBe(true);
    expect(ctx.session?.sectionScores.listening).toEqual({ earned: 18, max: 24 });
  });

  it('returns ExamScore from endExam', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', buildExam(), 'practice');
    });

    let score: Awaited<ReturnType<typeof ctx.endExam>> = null;
    await act(async () => {
      score = await ctx.endExam();
    });

    expect(score).not.toBeNull();
    expect(score?.passed).toBe(false);
    expect(score?.overall.earned).toBe(56);
  });

  it('clears session after resetExam', async () => {
    let ctx!: ReturnType<typeof useExam>;
    renderWithProvider((c) => { ctx = c; });

    await act(async () => {
      await ctx.startExam('A1_mock_01', 'A1', buildExam(), 'practice');
    });

    act(() => {
      ctx.resetExam();
    });

    expect(ctx.session).toBeNull();
  });

  it('throws when useExam is used outside provider', () => {
    // Suppress expected error output
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestHarness spy={() => {}} />);
    }).toThrow('useExam must be used inside <ExamProvider>');
    spy.mockRestore();
  });
});
