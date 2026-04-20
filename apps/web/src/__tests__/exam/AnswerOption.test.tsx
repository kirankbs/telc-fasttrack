import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerOption } from '../../components/exam/AnswerOption';

describe('AnswerOption', () => {
  it('default state: 1px border, white bg, no left accent', () => {
    render(
      <AnswerOption
        name="q1"
        value="a"
        selected={false}
        onChange={() => {}}
        testId="opt"
      >
        Option A
      </AnswerOption>,
    );
    const el = screen.getByTestId('opt');
    expect(el.getAttribute('data-state')).toBe('default');
    expect(el.className).toMatch(/border-border/);
    expect(el.className).toMatch(/bg-white/);
    expect(el.className).not.toMatch(/border-l-/);
  });

  it('selected: left accent (4px brand-500) + surface-container bg, NOT brand full fill', () => {
    render(
      <AnswerOption
        name="q1"
        value="a"
        selected={true}
        onChange={() => {}}
        testId="opt"
      >
        Option A
      </AnswerOption>,
    );
    const el = screen.getByTestId('opt');
    expect(el.getAttribute('data-state')).toBe('selected');
    expect(el.className).toMatch(/border-l-\[4px\]/);
    expect(el.className).toMatch(/border-l-brand-500/);
    expect(el.className).toMatch(/bg-surface-container/);
    // The row must not be filled with the brand color — that's the banned pattern.
    expect(el.className).not.toMatch(/bg-brand-500(?!\w)/);
    expect(el.className).not.toMatch(/bg-brand-600(?!\w)/);
  });

  it('review correct: pass border + pass-surface + check icon', () => {
    render(
      <AnswerOption
        name="q1"
        value="a"
        selected={true}
        onChange={() => {}}
        review={{ isCorrect: true, userPicked: true }}
        testId="opt"
      >
        Option A
      </AnswerOption>,
    );
    const el = screen.getByTestId('opt');
    expect(el.getAttribute('data-state')).toBe('correct');
    expect(el.className).toMatch(/bg-pass-surface/);
    expect(el.className).toMatch(/border-l-pass/);
  });

  it('review wrong: fail border + fail-surface', () => {
    render(
      <AnswerOption
        name="q1"
        value="a"
        selected={true}
        onChange={() => {}}
        review={{ isCorrect: false, userPicked: true }}
        testId="opt"
      >
        Option A
      </AnswerOption>,
    );
    const el = screen.getByTestId('opt');
    expect(el.getAttribute('data-state')).toBe('wrong');
    expect(el.className).toMatch(/bg-fail-surface/);
    expect(el.className).toMatch(/border-l-fail/);
  });

  it('correct-but-not-picked: reveals the right answer in pass style', () => {
    render(
      <AnswerOption
        name="q1"
        value="b"
        selected={false}
        onChange={() => {}}
        review={{ isCorrect: true, userPicked: false }}
        testId="opt"
      >
        Option B
      </AnswerOption>,
    );
    const el = screen.getByTestId('opt');
    expect(el.getAttribute('data-state')).toBe('correctUnselected');
    expect(el.className).toMatch(/bg-pass-surface/);
  });

  it('forwards change on click', async () => {
    const onChange = vi.fn();
    render(
      <AnswerOption name="q1" value="a" selected={false} onChange={onChange} testId="opt">
        Option A
      </AnswerOption>,
    );
    await userEvent.click(screen.getByTestId('opt'));
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
