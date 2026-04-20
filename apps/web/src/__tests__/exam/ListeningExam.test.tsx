import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListeningExam } from '../../components/exam/ListeningExam';
import type { ListeningSection, ListeningPart } from '@fastrack/types';

vi.mock('@fastrack/core', () => ({
  SECTION_DURATIONS: { A1: { listening: 1200 } },
  calculateSectionScore: vi.fn(() => ({
    earned: 8,
    max: 10,
    percentage: 0.8,
    passed: true,
  })),
  formatTime: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
  createTimerState: vi.fn(),
  tickTimer: vi.fn(),
}));

const mcqPart: ListeningPart = {
  partNumber: 1,
  instructions: 'Listen and choose.',
  instructionsTranslation: 'Hören Sie und wählen Sie.',
  audioFile: 'audio.mp3',
  playCount: 2,
  questions: [
    {
      id: 'q1',
      type: 'mcq' as const,
      questionText: 'What did you hear?',
      options: ['a) Hund', 'b) Katze', 'c) Vogel'],
      correctAnswer: 'a',
      explanation: 'Dog',
    },
  ],
};

const trueFalsePart: ListeningPart = {
  partNumber: 2,
  instructions: 'True or false?',
  instructionsTranslation: 'Richtig oder falsch?',
  audioFile: 'audio2.mp3',
  playCount: 2,
  questions: [
    {
      id: 'tf1',
      type: 'true_false' as const,
      questionText: 'Der Mann geht einkaufen.',
      correctAnswer: 'richtig',
      explanation: 'He goes shopping.',
    },
    {
      id: 'tf2',
      type: 'true_false' as const,
      questionText: 'Die Frau bleibt zu Hause.',
      correctAnswer: 'falsch',
      explanation: 'She leaves.',
    },
  ],
};

function buildSection(parts: ListeningPart[]): ListeningSection {
  return { totalTimeMinutes: 20, parts };
}

async function startExam() {
  await userEvent.click(screen.getByTestId('section-start-btn'));
}

describe('ListeningExam question type rendering', () => {
  it('renders richtig/falsch buttons for true_false questions', async () => {
    render(
      <ListeningExam
        mockId="A1_mock_01"
        level="A1"
        mockNumber={1}
        section={buildSection([trueFalsePart])}
      />,
    );
    await startExam();

    expect(screen.getByTestId('question-option-tf1-richtig')).toBeTruthy();
    expect(screen.getByTestId('question-option-tf1-falsch')).toBeTruthy();
    expect(screen.getByTestId('question-option-tf2-richtig')).toBeTruthy();
    expect(screen.getByTestId('question-option-tf2-falsch')).toBeTruthy();
  });

  it('renders MCQ options for mcq questions', async () => {
    render(
      <ListeningExam
        mockId="A1_mock_01"
        level="A1"
        mockNumber={1}
        section={buildSection([mcqPart])}
      />,
    );
    await startExam();

    expect(screen.getByTestId('question-option-q1-a')).toBeTruthy();
    expect(screen.getByTestId('question-option-q1-b')).toBeTruthy();
    expect(screen.getByTestId('question-option-q1-c')).toBeTruthy();
  });

  it('does not render MCQ options for true_false questions', async () => {
    render(
      <ListeningExam
        mockId="A1_mock_01"
        level="A1"
        mockNumber={1}
        section={buildSection([trueFalsePart])}
      />,
    );
    await startExam();

    expect(screen.queryByText('a)')).toBeNull();
    expect(screen.queryByText('b)')).toBeNull();
  });

  it('selecting richtig applies selected styling', async () => {
    render(
      <ListeningExam
        mockId="A1_mock_01"
        level="A1"
        mockNumber={1}
        section={buildSection([trueFalsePart])}
      />,
    );
    await startExam();

    const richtig = screen.getByTestId('question-option-tf1-richtig');
    const falsch = screen.getByTestId('question-option-tf1-falsch');

    await userEvent.click(richtig);
    // Selection uses a 4px LEFT accent bar — not a full brand-filled background.
    expect(richtig.getAttribute('data-state')).toBe('selected');
    expect(richtig.className).toContain('border-l-brand-500');
    expect(richtig.className).toContain('bg-surface-container');
    expect(falsch.getAttribute('data-state')).toBe('default');
  });

  it('switching between part tabs renders correct UI per type', async () => {
    render(
      <ListeningExam
        mockId="A1_mock_01"
        level="A1"
        mockNumber={1}
        section={buildSection([mcqPart, trueFalsePart])}
      />,
    );
    await startExam();

    // Part 1 — MCQ
    expect(screen.getByTestId('question-option-q1-a')).toBeTruthy();
    expect(screen.queryByTestId('question-option-tf1-richtig')).toBeNull();

    // Navigate to Part 2
    await userEvent.click(screen.getByTestId('section-nav-next'));

    // Part 2 — true_false
    expect(screen.getByTestId('question-option-tf1-richtig')).toBeTruthy();
    expect(screen.getByTestId('question-option-tf1-falsch')).toBeTruthy();
    expect(screen.queryByTestId('question-option-q1-a')).toBeNull();
  });

  it('allAnswered spans both MCQ and true_false — submit disabled until all answered', async () => {
    render(
      <ListeningExam
        mockId="A1_mock_01"
        level="A1"
        mockNumber={1}
        section={buildSection([mcqPart, trueFalsePart])}
      />,
    );
    await startExam();

    // Answer Part 1 MCQ
    await userEvent.click(screen.getByTestId('question-option-q1-a'));

    // Navigate to Part 2
    await userEvent.click(screen.getByTestId('section-nav-next'));

    // Submit should be disabled (Part 2 unanswered)
    expect(screen.getByTestId('submit-btn')).toBeDisabled();

    // Answer all true_false questions
    await userEvent.click(screen.getByTestId('question-option-tf1-richtig'));
    await userEvent.click(screen.getByTestId('question-option-tf2-falsch'));

    // Submit should now be enabled
    expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
  });
});
