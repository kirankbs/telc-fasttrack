import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashCard } from '../../components/vocab/FlashCard';
import type { VocabularyWord } from '../../lib/loadVocabulary';

const mockWord: VocabularyWord = {
  id: 1,
  level: 'A1',
  german: 'der Name',
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

describe('FlashCard', () => {
  it('renders the front with German word and topic', () => {
    render(<FlashCard word={mockWord} isFlipped={false} onFlip={() => {}} />);
    const front = screen.getByTestId('flashcard-front');
    expect(front).toHaveTextContent('der Name');
    expect(front).toHaveTextContent('Persönliche Angaben');
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
});
