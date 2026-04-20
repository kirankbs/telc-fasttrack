import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardSession } from '../../components/vocab/FlashcardSession';
import type { VocabularyWord } from '../../lib/loadVocabulary';

vi.mock('@fastrack/core', () => ({
  calculateNextReview: vi.fn((quality: number) => ({
    easeFactor: quality >= 3 ? 2.6 : 2.1,
    intervalDays: quality >= 4 ? 14 : 0,
    repetitions: quality >= 3 ? 1 : 0,
    nextReviewDate: '2026-04-20',
  })),
  getQualityLabel: vi.fn((quality: number) => {
    if (quality <= 1) return 'Again';
    if (quality === 2) return 'Hard';
    if (quality <= 4) return 'Good';
    return 'Easy';
  }),
}));

function makeWords(count: number): VocabularyWord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    level: 'A1',
    german: `Wort ${i + 1}`,
    english: `Word ${i + 1}`,
    article: i % 3 === 0 ? 'der' : null,
    plural: null,
    exampleSentence: `Beispiel ${i + 1}.`,
    topic: 'Test',
    audioFile: null,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewDate: null,
    lastReviewedAt: null,
  }));
}

const defaultProps = {
  levelLabel: 'A1 Vocabulary',
  levelColor: '#4caf50',
  onBack: vi.fn(),
};

describe('FlashcardSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders idle state with start button', () => {
    render(<FlashcardSession allWords={makeWords(650)} {...defaultProps} />);
    expect(screen.getByTestId('start-review')).toBeInTheDocument();
    expect(screen.getByText(/650 words available/)).toBeInTheDocument();
  });

  it('selects 20 cards on session start', () => {
    render(<FlashcardSession allWords={makeWords(650)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('card-progress')).toHaveTextContent('Karte 1 von 20');
  });

  it('uses all words when fewer than 20 are available', () => {
    render(<FlashcardSession allWords={makeWords(5)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    expect(screen.getByTestId('card-progress')).toHaveTextContent('Karte 1 von 5');
  });

  it('shows flip button on front, grade buttons after flip', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    expect(screen.getByTestId('flip-button')).toBeInTheDocument();
    expect(screen.queryByTestId('grade-buttons')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('flip-button'));
    expect(screen.getByTestId('grade-buttons')).toBeInTheDocument();
    // Two equal-weight buttons only. No red/shame button.
    expect(screen.getByTestId('grade-2')).toHaveTextContent('Noch lernen');
    expect(screen.getByTestId('grade-4')).toHaveTextContent('Gewusst');
  });

  it('advances to next card after grading', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-4'));

    expect(screen.getByTestId('card-progress')).toHaveTextContent('Karte 2 von 20');
  });

  it('resets flip state on card advance', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-4'));

    expect(screen.getByTestId('flip-button')).toBeInTheDocument();
    expect(screen.queryByTestId('grade-buttons')).not.toBeInTheDocument();
  });

  it('calls calculateNextReview with correct args on grade', async () => {
    const { calculateNextReview } = await import('@fastrack/core');
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-4'));

    expect(calculateNextReview).toHaveBeenCalledWith(4, 2.5, 0, 0);
  });

  it('hides the flip hint after the first flip in the session', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    // Hint visible on first card before any flip
    expect(screen.getByTestId('flashcard-flip-hint')).toBeInTheDocument();

    // Flip + grade → advance to card 2
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-4'));

    // Hint should be gone on the next front face
    expect(screen.queryByTestId('flashcard-flip-hint')).not.toBeInTheDocument();
  });

  it('shows session end screen with 3 honest stats — no percentage, no confetti', () => {
    const words = makeWords(3);
    render(<FlashcardSession allWords={words} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    // Grade all three as known → mock returns intervalDays=14 > 7, so all "sicher"
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId('flip-button'));
      fireEvent.click(screen.getByTestId('grade-4'));
    }

    const summary = screen.getByTestId('session-summary');
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent('Einheit abgeschlossen');

    const stats = screen.getByTestId('session-summary-stats');
    expect(stats).toHaveTextContent('3');
    expect(stats).toHaveTextContent('Wörter geübt');
    expect(stats).toHaveTextContent('sicher');
    expect(stats).toHaveTextContent('zum Wiederholen');

    // No percent sign anywhere in the summary
    expect(summary.textContent ?? '').not.toContain('%');
    // No confetti test-id
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();

    // Primary CTA + secondary link
    expect(screen.getByTestId('new-session')).toHaveTextContent('Weiter lernen');
    expect(screen.getByTestId('back-to-vocab')).toHaveTextContent('Zur Vokabelliste');
  });

  it('counts cards with interval > 7 days as "sicher", others as "zum Wiederholen"', () => {
    const words = makeWords(3);
    render(<FlashcardSession allWords={words} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    // mock: quality>=4 → interval 14 (sicher); quality<4 → interval 0 (wiederholen)
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-2'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-4'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-4'));

    const stats = screen.getByTestId('session-summary-stats');
    // 2 sicher, 1 zum Wiederholen, total 3
    expect(stats.textContent).toMatch(/3\s*Wörter geübt/);
    expect(stats.textContent).toMatch(/2\s*sicher/);
    expect(stats.textContent).toMatch(/1\s*zum Wiederholen/);
  });

  it('starts a new session when clicking Weiter lernen', () => {
    const words = makeWords(3);
    render(<FlashcardSession allWords={words} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId('flip-button'));
      fireEvent.click(screen.getByTestId('grade-4'));
    }

    expect(screen.getByTestId('session-summary')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-session'));
    expect(screen.getByTestId('card-progress')).toHaveTextContent('Karte 1 von 3');
  });

  it('calls onBack when Zur Vokabelliste is clicked from summary', () => {
    const onBack = vi.fn();
    const words = makeWords(2);
    render(<FlashcardSession allWords={words} {...{ ...defaultProps, onBack }} />);
    fireEvent.click(screen.getByTestId('start-review'));

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByTestId('flip-button'));
      fireEvent.click(screen.getByTestId('grade-4'));
    }

    fireEvent.click(screen.getByTestId('back-to-vocab'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('progress bar has correct ARIA attributes', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    const bar = screen.getByTestId('progress-bar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '20');
  });

  it('uses neutral styling on grade buttons — no red/shame color', () => {
    render(<FlashcardSession allWords={makeWords(3)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));

    const again = screen.getByTestId('grade-2');
    const known = screen.getByTestId('grade-4');

    // Neither button should carry red-on-red styling
    for (const btn of [again, known]) {
      expect(btn.className).not.toMatch(/bg-red/);
      expect(btn.className).not.toMatch(/text-red/);
      expect(btn.className).not.toMatch(/bg-error/);
      expect(btn.className).not.toMatch(/bg-fail/);
    }
    // "Noch lernen" is outline; "Gewusst" is filled brand
    expect(again.className).toMatch(/border-border/);
    expect(again.className).toMatch(/bg-surface/);
    expect(known.className).toMatch(/bg-brand-600/);
  });
});
