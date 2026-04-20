import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SprachbausteineExam,
  parseTextSegments,
  answerKey,
} from '../../components/exam/SprachbausteineExam';
import type {
  SprachbausteineSection,
  SprachbausteinePart,
  SprachbausteineQuestion,
} from '@telc/types';

vi.mock('@telc/core', () => ({
  SECTION_DURATIONS: {
    B1: { sprachbausteine: 15 * 60, reading: 75 * 60 },
    A1: { reading: 25 * 60 },
  },
  scoreSprachbausteine: vi.fn((answers: Record<string, string>, section: SprachbausteineSection) => {
    let earned = 0;
    let max = 0;
    for (const part of section.parts) {
      for (const q of part.questions) {
        max += 1;
        const key = `sprachbausteine_${part.partNumber}_${q.blankNumber}`;
        if (answers[key]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          earned += 1;
        }
      }
    }
    const percentage = max > 0 ? earned / max : 0;
    return { earned, max, percentage, passed: percentage >= 0.6 };
  }),
  formatTime: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
  createTimerState: vi.fn(),
  tickTimer: vi.fn(),
}));

function makeQuestion(
  blankNumber: number,
  type: 'mcq' | 'word_bank',
  options: string[],
  correctAnswer: string,
  explanation = `Explanation for blank ${blankNumber}.`,
): SprachbausteineQuestion {
  return { blankNumber, type, options, correctAnswer, explanation };
}

// Teil 1: 10 MCQ gaps with 3 options each.
const teil1Options = ['a) in', 'b) an', 'c) bei'];
const teil1Text = Array.from({ length: 10 }, (_, i) => `Word ${i + 1} __(${i + 1})__`).join(' ');
const teil1Part: SprachbausteinePart = {
  partNumber: 1,
  instructions: 'Wählen Sie a, b oder c.',
  text: teil1Text,
  questions: Array.from({ length: 10 }, (_, i) =>
    makeQuestion(i + 1, 'mcq', teil1Options, 'c'),
  ),
};

// Teil 2: 10 word-bank gaps sharing 15 options.
const teil2Options = [
  'a) Dank',
  'b) trotzdem',
  'c) gesprochen',
  'd) funktioniert',
  'e) für',
  'f) In',
  'g) erhöht',
  'h) auf',
  'i) wahrscheinlich',
  'j) Vielleicht',
  'k) herzlichen',
  'l) nachgedacht',
  'm) reicht',
  'n) zu',
  'o) damit',
];
const teil2CorrectByBlank: Record<number, string> = {
  11: 'a',
  12: 'b',
  13: 'c',
  14: 'd',
  15: 'e',
  16: 'f',
  17: 'g',
  18: 'h',
  19: 'i',
  20: 'j',
};
const teil2Text = Array.from(
  { length: 10 },
  (_, i) => `Slot ${i + 11} __(${i + 11})__`,
).join(' ');
const teil2Part: SprachbausteinePart = {
  partNumber: 2,
  instructions: 'Jedes Wort passt nur einmal.',
  text: teil2Text,
  questions: Array.from({ length: 10 }, (_, i) => {
    const blank = i + 11;
    return makeQuestion(blank, 'word_bank', teil2Options, teil2CorrectByBlank[blank]);
  }),
};

function buildSection(parts: SprachbausteinePart[]): SprachbausteineSection {
  return { parts };
}

async function startExam() {
  await userEvent.click(screen.getByTestId('section-start-btn'));
}

beforeEach(() => {
  window.sessionStorage.clear();
});

describe('parseTextSegments', () => {
  it('splits mixed text and blanks in order', () => {
    const segments = parseTextSegments('Hello __(1)__ world __(2)__.');
    expect(segments).toEqual([
      { kind: 'text', content: 'Hello ' },
      { kind: 'blank', blankNumber: 1 },
      { kind: 'text', content: ' world ' },
      { kind: 'blank', blankNumber: 2 },
      { kind: 'text', content: '.' },
    ]);
  });

  it('returns only text for plain input', () => {
    expect(parseTextSegments('No gaps here.')).toEqual([
      { kind: 'text', content: 'No gaps here.' },
    ]);
  });

  it('returns only blanks for back-to-back markers', () => {
    expect(parseTextSegments('__(1)____(2)__')).toEqual([
      { kind: 'blank', blankNumber: 1 },
      { kind: 'blank', blankNumber: 2 },
    ]);
  });
});

describe('answerKey', () => {
  it('formats as sprachbausteine_{part}_{blank}', () => {
    expect(answerKey(1, 5)).toBe('sprachbausteine_1_5');
    expect(answerKey(2, 11)).toBe('sprachbausteine_2_11');
  });
});

describe('SprachbausteineExam — Teil 1 (MCQ cloze)', () => {
  it('renders all 10 MCQ gaps with 3 options each after starting', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part])}
      />,
    );
    await startExam();

    for (let i = 1; i <= 10; i++) {
      const gap = screen.getByTestId(`gap-1-${i}`) as HTMLSelectElement;
      // The blank options include the 3 MCQ options plus the placeholder.
      const valueOpts = Array.from(gap.options).map((o) => o.value);
      expect(valueOpts).toEqual(['', 'a', 'b', 'c']);
    }
  });
});

describe('SprachbausteineExam — Teil 2 (word bank)', () => {
  it('renders 10 word-bank gaps with 15 options each', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil2Part])}
      />,
    );
    await startExam();

    for (let i = 11; i <= 20; i++) {
      const gap = screen.getByTestId(`gap-2-${i}`) as HTMLSelectElement;
      // 15 word-bank options plus the empty placeholder = 16 total.
      expect(gap.options).toHaveLength(16);
    }
  });

  it('disables word-bank option in other gaps once selected', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil2Part])}
      />,
    );
    await startExam();

    const gap11 = screen.getByTestId('gap-2-11') as HTMLSelectElement;
    await userEvent.selectOptions(gap11, 'a');

    // In gap 11, option 'a' is the selected value, so it remains enabled.
    const optionAInGap11 = Array.from(gap11.options).find((o) => o.value === 'a');
    expect(optionAInGap11?.disabled).toBe(false);

    // In any other gap, option 'a' is now marked used and disabled.
    const gap12 = screen.getByTestId('gap-2-12') as HTMLSelectElement;
    const optionAInGap12 = Array.from(gap12.options).find((o) => o.value === 'a');
    expect(optionAInGap12?.disabled).toBe(true);
  });
});

describe('SprachbausteineExam — answering state', () => {
  it('selecting an option marks the gap as answered (blue surface)', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part])}
      />,
    );
    await startExam();

    const gap = screen.getByTestId('gap-1-1') as HTMLSelectElement;
    expect(gap.className).toContain('bg-surface-container');

    await userEvent.selectOptions(gap, 'c');
    expect(gap.value).toBe('c');
    expect(gap.className).toContain('bg-brand-primary-surface');
  });

  it('submit button is disabled until all gaps are answered', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part])}
      />,
    );
    await startExam();

    expect(screen.getByTestId('submit-btn')).toBeDisabled();

    // Fill 9 of 10 blanks.
    for (let i = 1; i <= 9; i++) {
      await userEvent.selectOptions(screen.getByTestId(`gap-1-${i}`), 'c');
    }
    expect(screen.getByTestId('submit-btn')).toBeDisabled();

    // Fill the last one.
    await userEvent.selectOptions(screen.getByTestId('gap-1-10'), 'c');
    expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
  });

  it('switching between part tabs preserves answers', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part, teil2Part])}
      />,
    );
    await startExam();

    await userEvent.selectOptions(screen.getByTestId('gap-1-1'), 'c');
    await userEvent.click(screen.getByTestId('part-tab-2'));
    expect(screen.getByTestId('gap-2-11')).toBeTruthy();

    await userEvent.click(screen.getByTestId('part-tab-1'));
    const gap = screen.getByTestId('gap-1-1') as HTMLSelectElement;
    expect(gap.value).toBe('c');
  });
});

describe('SprachbausteineExam — submit & review', () => {
  async function fillPartCorrectly(partNumber: number, blanks: number[], correct: string) {
    for (const b of blanks) {
      await userEvent.selectOptions(screen.getByTestId(`gap-${partNumber}-${b}`), correct);
    }
  }

  it('submitting with all-correct answers shows passed verdict and per-part scores', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part, teil2Part])}
      />,
    );
    await startExam();

    // Teil 1: all correct = 'c'
    await fillPartCorrectly(
      1,
      Array.from({ length: 10 }, (_, i) => i + 1),
      'c',
    );

    // Teil 2: fill each gap with its correct word-bank letter.
    await userEvent.click(screen.getByTestId('part-tab-2'));
    for (let b = 11; b <= 20; b++) {
      await userEvent.selectOptions(
        screen.getByTestId(`gap-2-${b}`),
        teil2CorrectByBlank[b],
      );
    }

    await userEvent.click(screen.getByTestId('submit-btn'));

    // Overall verdict
    expect(screen.getByText('20/20')).toBeTruthy();
    expect(screen.getByText(/100% — Bestanden/)).toBeTruthy();

    // Per-part scorecards
    const part1Card = screen.getByTestId('part-score-1');
    expect(within(part1Card).getByText('10/10')).toBeTruthy();
    const part2Card = screen.getByTestId('part-score-2');
    expect(within(part2Card).getByText('10/10')).toBeTruthy();

    // Next-section link points to writing (Sprachbausteine → Schreiben).
    expect(screen.getByTestId('next-section-link')).toHaveAttribute(
      'href',
      '/exam/B1_mock_01/writing',
    );
  });

  it('review mode shows correct answers with explanations and marks wrong gaps', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part])}
      />,
    );
    await startExam();

    // Answer all gaps wrong ('a' instead of correct 'c').
    for (let i = 1; i <= 10; i++) {
      await userEvent.selectOptions(screen.getByTestId(`gap-1-${i}`), 'a');
    }
    await userEvent.click(screen.getByTestId('submit-btn'));

    // Review rows show the user answer + the correct answer.
    for (let i = 1; i <= 10; i++) {
      const reviewGap = screen.getByTestId(`review-gap-1-${i}`);
      // Wrong answer: displays "a → c ✗" inside an error-styled span.
      expect(reviewGap.textContent).toContain('a → c');
      expect(reviewGap.className).toContain('border-error');
    }

    // Explanation rows are present per question.
    const explanation1 = screen.getByTestId('review-explanation-1-1');
    expect(explanation1.textContent).toContain('Explanation for blank 1.');
  });

  it('review mode marks correctly-answered gaps as success', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part])}
      />,
    );
    await startExam();

    for (let i = 1; i <= 10; i++) {
      await userEvent.selectOptions(screen.getByTestId(`gap-1-${i}`), 'c');
    }
    await userEvent.click(screen.getByTestId('submit-btn'));

    for (let i = 1; i <= 10; i++) {
      const reviewGap = screen.getByTestId(`review-gap-1-${i}`);
      expect(reviewGap.className).toContain('border-success');
      expect(reviewGap.textContent).toContain('c');
    }
  });

  it('persists score into sessionStorage under the exam session key', async () => {
    render(
      <SprachbausteineExam
        mockId="B1_mock_01"
        level="B1"
        section={buildSection([teil1Part])}
      />,
    );
    await startExam();

    for (let i = 1; i <= 10; i++) {
      await userEvent.selectOptions(screen.getByTestId(`gap-1-${i}`), 'c');
    }
    await userEvent.click(screen.getByTestId('submit-btn'));

    const raw = window.sessionStorage.getItem('exam_session_B1_mock_01');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.sections.sprachbausteine).toBeDefined();
    expect(parsed.sections.sprachbausteine.score.earned).toBe(10);
    expect(parsed.sections.sprachbausteine.score.max).toBe(10);
    expect(parsed.sections.sprachbausteine.score.passed).toBe(true);
  });
});
