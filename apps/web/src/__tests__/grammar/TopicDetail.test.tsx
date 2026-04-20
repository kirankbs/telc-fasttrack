import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicDetail } from '../../components/grammar/TopicDetail';
import type { GrammarTopic } from '@fastrack/types';

const topic: GrammarTopic = {
  id: 1,
  level: 'A1',
  topic: 'Artikel und Nomen',
  explanation:
    'Im Deutschen hat jedes Nomen einen Artikel. Die drei Artikel sind der, die und das.',
  examples: [
    'der Mann — the man',
    'die Frau — the woman',
    'das Kind — the child',
  ],
  exercises: [],
  orderIndex: 1,
};

describe('TopicDetail', () => {
  it('renders the explanation text', () => {
    render(<TopicDetail topic={topic} />);
    const section = screen.getByTestId('explanation-section');
    expect(section).toHaveTextContent(/Im Deutschen hat jedes Nomen einen Artikel/);
  });

  it('renders examples inside a left-bordered brand-tinted block', () => {
    render(<TopicDetail topic={topic} />);
    const block = screen.getByTestId('examples-block');
    expect(block).toBeInTheDocument();

    // Editorial example block: 4px left border, brand 200 color, brand 50 bg,
    // rounded on the right only.
    expect(block.className).toMatch(/border-l-4/);
    expect(block.className).toMatch(/border-brand-200/);
    expect(block.className).toMatch(/bg-brand-50/);
    expect(block.className).toMatch(/rounded-r-lg/);
  });

  it('splits German and English parts of each example on the em-dash', () => {
    render(<TopicDetail topic={topic} />);
    const first = screen.getByTestId('example-0');
    // German goes first, English goes after the em-dash separator
    expect(first.textContent).toContain('der Mann');
    expect(first.textContent).toContain('— the man');
  });

  it('does not wrap the explanation in a standalone card surface anymore', () => {
    const { container } = render(<TopicDetail topic={topic} />);
    // Old layout put the explanation inside rounded-xl border + bg-surface card.
    // New editorial layout drops the card — only the example block keeps a surface.
    const explanation = screen.getByTestId('explanation-section');
    expect(explanation.className).not.toMatch(/rounded-xl/);
    expect(explanation.className).not.toMatch(/border border-border/);
    // Safety net: no redundant "Erklärung" heading in the new version.
    expect(container.textContent).not.toMatch(/Erklärung/);
  });

  it('omits the examples block when there are no examples', () => {
    const noExamples: GrammarTopic = { ...topic, examples: [] };
    render(<TopicDetail topic={noExamples} />);
    expect(screen.queryByTestId('examples-block')).toBeNull();
  });
});
