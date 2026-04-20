import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashCard } from '../../components/vocab/FlashCard';
import type { VocabularyWord } from '../../lib/loadVocabulary';

const mockWord: VocabularyWord = {
  id: 1,
  level: 'A1',
  german: 'Name',
  english: 'name',
  article: 'der',
  plural: 'die Namen',
  exampleSentence: 'Mein Name ist Thomas.',
  topic: 'Persönliche Angaben',
  audioFile: null,
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  nextReviewDate: null,
  lastReviewedAt: null,
};

const wordWithoutArticle: VocabularyWord = {
  ...mockWord,
  id: 2,
  german: 'sprechen',
  english: 'to speak',
  article: null,
  plural: null,
  exampleSentence: 'Ich spreche Deutsch.',
  topic: 'Sprache',
};

const wordArticleAlreadyInGerman: VocabularyWord = {
  ...mockWord,
  id: 3,
  german: 'das Frühstück',
  english: 'breakfast',
  article: 'das',
  plural: null,
  exampleSentence: 'Ich esse jeden Morgen Frühstück.',
  topic: 'Alltag',
};

describe('FlashCard', () => {
  it('renders the front with German word, article, and topic', () => {
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={() => {}} />);
    const front = screen.getByTestId('flashcard-front');
    // article inline with noun
    expect(front).toHaveTextContent('der Name');
    expect(front).toHaveTextContent('Persönliche Angaben');
  });

  it('does not double-prefix the article when it is already part of the German string', () => {
    render(<FlashCard word={wordArticleAlreadyInGerman} isFlipped={false} onFlip={() => {}} />);
    const german = screen.getByTestId('flashcard-german');
    expect(german.textContent).toBe('das Frühstück');
    expect(german.textContent).not.toContain('das das');
  });

  it('renders the back with English, article gender, plural, and example', () => {
    render(<FlashCard word={mockWord} isFlipped={true} onFlip={() => {}} />);
    const back = screen.getByTestId('flashcard-back');
    expect(back).toHaveTextContent('name');
    expect(back).toHaveTextContent('der (masculine)');
    expect(back).toHaveTextContent('Plural: die Namen');
    expect(back).toHaveTextContent('Mein Name ist Thomas.');
  });

  it('does not render article or plural when absent', () => {
    render(<FlashCard word={wordWithoutArticle} isFlipped={true} onFlip={() => {}} />);
    const back = screen.getByTestId('flashcard-back');
    expect(back).not.toHaveTextContent('masculine');
    expect(back).not.toHaveTextContent('Plural:');
  });

  it('shows the flip hint by default', () => {
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={() => {}} />);
    expect(screen.getByTestId('flashcard-flip-hint')).toBeInTheDocument();
    expect(screen.getByTestId('flashcard-flip-hint')).toHaveTextContent('Karte umdrehen');
  });

  it('hides the flip hint when showFlipHint is false (after first flip in session)', () => {
    render(
      <FlashCard word={mockWord} isFlipped={false} onFlip={() => {}} showFlipHint={false} />,
    );
    expect(screen.queryByTestId('flashcard-flip-hint')).not.toBeInTheDocument();
  });

  it('calls onFlip when card is clicked', () => {
    const onFlip = vi.fn();
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={onFlip} />);
    fireEvent.click(screen.getByTestId('flashcard'));
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('calls onFlip on Enter key', () => {
    const onFlip = vi.fn();
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={onFlip} />);
    fireEvent.keyDown(screen.getByTestId('flashcard'), { key: 'Enter' });
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('calls onFlip on Space key', () => {
    const onFlip = vi.fn();
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={onFlip} />);
    fireEvent.keyDown(screen.getByTestId('flashcard'), { key: ' ' });
    expect(onFlip).toHaveBeenCalledTimes(1);
  });

  it('uses motion-reduce classes for reduced-motion fallback', () => {
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={() => {}} />);
    const flipper = screen.getByTestId('flashcard-flipper');
    // 3D rotation applies under motion-safe; reduced-motion disables the transform transition
    expect(flipper.className).toMatch(/motion-safe:transition-transform/);
    expect(flipper.className).toMatch(/motion-reduce:transition-none/);

    const front = screen.getByTestId('flashcard-front');
    expect(front.className).toMatch(/motion-reduce:transition-opacity/);
    expect(front.className).toMatch(/motion-reduce:duration-\[150ms\]/);
  });
});
