import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicCard } from '../../components/grammar/TopicCard';
import type { GrammarTopic } from '@telc/types';

const mockTopic: GrammarTopic = {
  id: 1,
  level: 'A1',
  topic: 'Präsens — regelmäßige Verben',
  explanation: 'Regular verbs follow a predictable pattern.',
  examples: ['Ich lerne Deutsch.', 'Du spielst Fußball.', 'Er kommt aus Berlin.'],
  exercises: [
    {
      type: 'fill_blank',
      prompt: 'Ich ___ (lernen) jeden Tag Deutsch.',
      correctAnswer: 'lerne',
      explanation: 'First person singular: stem + -e',
    },
    {
      type: 'mcq',
      prompt: 'Wir ___ in einer kleinen Stadt.',
      correctAnswer: 'wohnen',
      explanation: 'First person plural takes infinitive form.',
    },
  ],
  orderIndex: 1,
};

const topicNoExercises: GrammarTopic = {
  ...mockTopic,
  id: 2,
  exercises: undefined,
  orderIndex: 2,
  topic: 'Test topic without exercises',
};

describe('TopicCard', () => {
  it('renders topic name, order number, and counts', () => {
    render(<TopicCard topic={mockTopic} levelColor="#4caf50" />);

    expect(screen.getByText('Präsens — regelmäßige Verben')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('3 Beispiele')).toBeDefined();
    expect(screen.getByText('2 Übungen')).toBeDefined();
  });

  it('links to the topic detail page', () => {
    render(<TopicCard topic={mockTopic} levelColor="#4caf50" />);

    const link = screen.getByTestId('topic-card-1');
    expect(link.getAttribute('href')).toBe('/grammar/1');
  });

  it('hides exercise count when no exercises', () => {
    render(<TopicCard topic={topicNoExercises} levelColor="#4caf50" />);

    expect(screen.getByText('3 Beispiele')).toBeDefined();
    expect(screen.queryByText(/Übungen/)).toBeNull();
  });

  it('applies the level color to the order badge', () => {
    render(<TopicCard topic={mockTopic} levelColor="#4caf50" />);

    const badge = screen.getByText('1');
    expect(badge.style.backgroundColor).toBe('rgb(76, 175, 80)');
  });
});
