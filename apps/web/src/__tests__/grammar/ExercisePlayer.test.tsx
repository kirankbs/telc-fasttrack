import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExercisePlayer } from '../../components/grammar/ExercisePlayer';
import type { GrammarExercise } from '@fastrack/types';

const fillBlank: GrammarExercise = {
  type: 'fill_blank',
  prompt: 'Ich ___ (lernen) jeden Tag Deutsch.',
  correctAnswer: 'lerne',
  explanation: 'First person singular: stem + -e',
};

const mcq: GrammarExercise = {
  type: 'mcq',
  prompt: 'Wir ___ in einer kleinen Stadt.',
  correctAnswer: 'wohnen',
  explanation: 'First person plural takes infinitive form.',
};

const reorder: GrammarExercise = {
  type: 'reorder',
  prompt: 'Reorder: Deutsch / Ich / lerne',
  correctAnswer: 'Ich lerne Deutsch',
  explanation: 'Subject-Verb-Object order.',
};

const exercises = [fillBlank, mcq, reorder];

describe('ExercisePlayer', () => {
  it('renders the first exercise with counter and progress bar', () => {
    render(<ExercisePlayer exercises={exercises} topicName="Test" />);

    expect(screen.getByTestId('exercise-player')).toBeDefined();
    expect(screen.getByTestId('exercise-counter')).toHaveTextContent('Aufgabe 1 von 3');
    expect(screen.getByTestId('exercise-prompt')).toHaveTextContent(fillBlank.prompt);
  });

  it('disables check button when no answer entered (fill_blank)', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    const checkBtn = screen.getByTestId('check-button');
    expect(checkBtn).toBeDisabled();
  });

  it('enables check button after typing in fill_blank', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    const input = screen.getByTestId('exercise-input');
    fireEvent.change(input, { target: { value: 'lerne' } });

    expect(screen.getByTestId('check-button')).not.toBeDisabled();
  });

  it('shows correct feedback for correct fill_blank answer', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'lerne' },
    });
    fireEvent.click(screen.getByTestId('check-button'));

    expect(screen.getByTestId('exercise-feedback-correct')).toBeDefined();
    expect(screen.getByText('Richtig!')).toBeDefined();
  });

  it('shows incorrect feedback for wrong fill_blank answer', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'lernt' },
    });
    fireEvent.click(screen.getByTestId('check-button'));

    expect(screen.getByTestId('exercise-feedback-incorrect')).toBeDefined();
    expect(screen.getByText('Leider falsch')).toBeDefined();
    expect(screen.getByText(fillBlank.explanation)).toBeDefined();
  });

  it('performs case-insensitive comparison', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: '  Lerne  ' },
    });
    fireEvent.click(screen.getByTestId('check-button'));

    expect(screen.getByTestId('exercise-feedback-correct')).toBeDefined();
  });

  it('locks input after checking', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'lerne' },
    });
    fireEvent.click(screen.getByTestId('check-button'));

    expect(screen.getByTestId('exercise-input')).toBeDisabled();
  });

  it('advances to next exercise on Next click', () => {
    render(<ExercisePlayer exercises={exercises} topicName="Test" />);

    // answer first exercise
    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'lerne' },
    });
    fireEvent.click(screen.getByTestId('check-button'));
    fireEvent.click(screen.getByTestId('next-button'));

    expect(screen.getByTestId('exercise-counter')).toHaveTextContent('Aufgabe 2 von 3');
  });

  it('shows summary after completing all exercises', () => {
    const onComplete = vi.fn();
    render(
      <ExercisePlayer exercises={[fillBlank]} topicName="Test Topic" onComplete={onComplete} />,
    );

    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'lerne' },
    });
    fireEvent.click(screen.getByTestId('check-button'));

    // last exercise — button should say "Abschluss"
    const nextBtn = screen.getByTestId('next-button');
    expect(nextBtn).toHaveTextContent('Abschluss');
    fireEvent.click(nextBtn);

    expect(screen.getByTestId('exercise-summary')).toBeDefined();
    expect(screen.getByTestId('exercise-score')).toHaveTextContent('1 / 1 richtig (100%)');
    expect(onComplete).toHaveBeenCalled();
  });

  it('shows 0% when all answers are wrong', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByTestId('check-button'));
    fireEvent.click(screen.getByTestId('next-button'));

    expect(screen.getByTestId('exercise-score')).toHaveTextContent('0 / 1 richtig (0%)');
  });

  it('resets exercises on retry', () => {
    render(<ExercisePlayer exercises={[fillBlank]} topicName="Test" />);

    // complete exercise
    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'lerne' },
    });
    fireEvent.click(screen.getByTestId('check-button'));
    fireEvent.click(screen.getByTestId('next-button'));

    // retry
    fireEvent.click(screen.getByTestId('retry-button'));

    expect(screen.getByTestId('exercise-player')).toBeDefined();
    expect(screen.getByTestId('exercise-counter')).toHaveTextContent('Aufgabe 1 von 1');
  });

  it('handles reorder type with text input', () => {
    render(<ExercisePlayer exercises={[reorder]} topicName="Test" />);

    expect(screen.getByTestId('exercise-input')).toBeDefined();
    fireEvent.change(screen.getByTestId('exercise-input'), {
      target: { value: 'Ich lerne Deutsch' },
    });
    fireEvent.click(screen.getByTestId('check-button'));

    expect(screen.getByTestId('exercise-feedback-correct')).toBeDefined();
  });
});
