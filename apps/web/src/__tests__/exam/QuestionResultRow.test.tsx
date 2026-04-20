import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionResultRow } from '../../components/exam/QuestionResultRow';

describe('QuestionResultRow', () => {
  it('shows success styling when correct', () => {
    const { container } = render(
      <QuestionResultRow
        label="Teil 1, Aufgabe 1"
        questionText="Was ist richtig?"
        userAnswer="a"
        correctAnswer="a"
        isCorrect={true}
      />,
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/border-pass/);
    expect(el.className).toMatch(/bg-pass-surface/);
  });

  it('shows error styling when wrong', () => {
    const { container } = render(
      <QuestionResultRow
        label="Teil 1, Aufgabe 2"
        questionText="Was ist das?"
        userAnswer="b"
        correctAnswer="a"
        isCorrect={false}
      />,
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/border-fail/);
    expect(el.className).toMatch(/bg-fail-surface/);
  });

  it('shows user answer and correct answer when wrong', () => {
    render(
      <QuestionResultRow
        label="Teil 2, Aufgabe 1"
        questionText="Woher?"
        userAnswer="b"
        correctAnswer="c"
        isCorrect={false}
      />,
    );

    expect(screen.getByText('b')).toBeTruthy();
    expect(screen.getByText('c')).toBeTruthy();
  });

  it('shows explanation when wrong and explanation provided', () => {
    render(
      <QuestionResultRow
        label="Teil 1, Aufgabe 3"
        questionText="Frage?"
        userAnswer="b"
        correctAnswer="a"
        explanation="Die richtige Antwort ist a weil..."
        isCorrect={false}
      />,
    );

    expect(screen.getByText('Die richtige Antwort ist a weil...')).toBeTruthy();
  });

  it('does not show explanation when correct', () => {
    render(
      <QuestionResultRow
        label="Teil 1, Aufgabe 4"
        questionText="Frage?"
        userAnswer="a"
        correctAnswer="a"
        explanation="Should not appear"
        isCorrect={true}
      />,
    );

    expect(screen.queryByText('Should not appear')).toBeNull();
  });

  it('shows em-dash when user answer is empty', () => {
    render(
      <QuestionResultRow
        label="Teil 1, Aufgabe 5"
        questionText="Frage?"
        userAnswer=""
        correctAnswer="a"
        isCorrect={false}
      />,
    );

    expect(screen.getByText('—')).toBeTruthy();
  });
});
