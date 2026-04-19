import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardSession } from '../../components/vocab/FlashcardSession';
import type { VocabularyWord } from '../../lib/loadVocabulary';

vi.mock('@telc/core', () => ({
  calculateNextReview: vi.fn((quality: number) => ({
    easeFactor: quality >= 3 ? 2.6 : 2.1,
    intervalDays: quality >= 3 ? 1 : 0,
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
    expect(screen.getByText('Card 1 of 20')).toBeInTheDocument();
  });

  it('uses all words when fewer than 20 are available', () => {
    render(<FlashcardSession allWords={makeWords(5)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    expect(screen.getByText('Card 1 of 5')).toBeInTheDocument();
  });

  it('shows flip button on front, grade buttons after flip', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    expect(screen.getByTestId('flip-button')).toBeInTheDocument();
    expect(screen.queryByTestId('grade-buttons')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('flip-button'));
    expect(screen.getByTestId('grade-buttons')).toBeInTheDocument();
  });

  it('advances to next card after grading', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-3'));

    expect(screen.getByText('Card 2 of 20')).toBeInTheDocument();
  });

  it('resets flip state on card advance', () => {
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-5'));

    expect(screen.getByTestId('flip-button')).toBeInTheDocument();
    expect(screen.queryByTestId('grade-buttons')).not.toBeInTheDocument();
  });

  it('calls calculateNextReview with correct args on grade', async () => {
    const { calculateNextReview } = await import('@telc/core');
    render(<FlashcardSession allWords={makeWords(25)} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));
    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-3'));

    expect(calculateNextReview).toHaveBeenCalledWith(3, 2.5, 0, 0);
  });

  it('shows summary after all cards are graded', () => {
    const words = makeWords(3);
    render(<FlashcardSession allWords={words} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId('flip-button'));
      fireEvent.click(screen.getByTestId('grade-3'));
    }

    expect(screen.getByTestId('session-summary')).toBeInTheDocument();
    expect(screen.getByText('Session Complete')).toBeInTheDocument();
    expect(screen.getByText('Cards reviewed')).toBeInTheDocument();
  });

  it('shows quality breakdown in summary', () => {
    const words = makeWords(3);
    render(<FlashcardSession allWords={words} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-0'));

    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-3'));

    fireEvent.click(screen.getByTestId('flip-button'));
    fireEvent.click(screen.getByTestId('grade-5'));

    expect(screen.getByTestId('session-summary')).toBeInTheDocument();
    expect(screen.getByText('Again')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('starts a new session when clicking New Session', () => {
    const words = makeWords(3);
    render(<FlashcardSession allWords={words} {...defaultProps} />);
    fireEvent.click(screen.getByTestId('start-review'));

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId('flip-button'));
      fireEvent.click(screen.getByTestId('grade-3'));
    }

    expect(screen.getByTestId('session-summary')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-session'));
    expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
  });

  it('calls onBack when Back to Vocabulary is clicked from summary', () => {
    const onBack = vi.fn();
    const words = makeWords(2);
    render(<FlashcardSession allWords={words} {...{ ...defaultProps, onBack }} />);
    fireEvent.click(screen.getByTestId('start-review'));

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByTestId('flip-button'));
      fireEvent.click(screen.getByTestId('grade-3'));
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
});
