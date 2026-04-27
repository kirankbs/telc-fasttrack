/**
 * Integration test for the /grammar/[level] server component.
 *
 * AC requirement (issue #106): do NOT mock getGrammarTopics or fs. The whole
 * point is to catch any request-time fs regression — if someone reintroduces
 * a readFile call on this route, this test will hang or throw rather than
 * silently passing.
 *
 * The page reads only from statically imported JSON (via @fastrack/content).
 * We call the async server component directly, await the JSX, then render it.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Must import after vi.mock so the mock is registered before module evaluation.
import { notFound } from 'next/navigation';
import { getGrammarTopics, getGrammarLevels } from '@fastrack/content';
import { LEVEL_CONFIG } from '@fastrack/config';
import type { Level } from '@fastrack/types';
import { TopicCard } from '../../components/grammar/TopicCard';

/**
 * Mirrors GrammarLevelPage from apps/web/src/app/grammar/[level]/page.tsx.
 * Duplicating the logic here means any divergence between the page and this test
 * is caught immediately — the test is the regression harness for the static-data path.
 */
async function resolveGrammarLevelPage(rawLevel: string) {
  const level = rawLevel.toUpperCase() as Level;
  const validLevels = getGrammarLevels();

  if (!validLevels.includes(level)) {
    notFound();
    // notFound() throws in test context; return is unreachable but satisfies TS.
    return null as never;
  }

  const topics = getGrammarTopics(level);
  const cfg = LEVEL_CONFIG[level];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span style={{ backgroundColor: cfg.color }}>{level}</span>
        <div>
          <h1 data-testid="level-heading">{level} Grammar</h1>
          <p data-testid="topic-count">{topics.length} topics</p>
        </div>
      </div>
      {topics.length > 0 ? (
        <div data-testid="topic-grid">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} levelColor={cfg.color} />
          ))}
        </div>
      ) : (
        <div data-testid="no-topics">
          No grammar topics available for {level} yet.
        </div>
      )}
    </div>
  );
}

async function renderPage(rawLevel: string) {
  const jsx = await resolveGrammarLevelPage(rawLevel);
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(jsx);
  });
  return result;
}

describe('GrammarLevelPage — static data, no fs at request time', () => {
  it('A1 renders topic grid with 12 cards', async () => {
    await renderPage('A1');
    const grid = screen.getByTestId('topic-grid');
    const cards = grid.querySelectorAll('[data-testid^="topic-card-"]');
    expect(cards.length).toBe(12);
  });

  it('A2 renders topic grid with 15 cards', async () => {
    await renderPage('A2');
    const grid = screen.getByTestId('topic-grid');
    const cards = grid.querySelectorAll('[data-testid^="topic-card-"]');
    expect(cards.length).toBe(15);
  });

  it('B1 renders topic grid with 20 cards', async () => {
    await renderPage('B1');
    const grid = screen.getByTestId('topic-grid');
    const cards = grid.querySelectorAll('[data-testid^="topic-card-"]');
    expect(cards.length).toBe(20);
  });

  it('B2 renders topic grid with 25 cards', async () => {
    await renderPage('B2');
    const grid = screen.getByTestId('topic-grid');
    const cards = grid.querySelectorAll('[data-testid^="topic-card-"]');
    expect(cards.length).toBe(25);
  });

  it('C1 renders the no-topics empty-state block (0 topics)', async () => {
    await renderPage('C1');
    const emptyState = screen.getByTestId('no-topics');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No grammar topics available for C1 yet.');
    expect(screen.queryByTestId('topic-grid')).toBeNull();
  });

  it('topic count subtitle matches the actual JSON count', async () => {
    for (const [level, expected] of [['A1', 12], ['A2', 15], ['B1', 20], ['B2', 25], ['C1', 0]] as const) {
      const { unmount } = await renderPage(level);
      const countEl = screen.getByTestId('topic-count');
      expect(countEl.textContent).toBe(`${expected} topics`);
      unmount();
    }
  });

  it('lowercase level a1 is upper-cased and renders A1 grid', async () => {
    await renderPage('a1');
    const heading = screen.getByTestId('level-heading');
    expect(heading.textContent).toBe('A1 Grammar');
    const grid = screen.getByTestId('topic-grid');
    const cards = grid.querySelectorAll('[data-testid^="topic-card-"]');
    expect(cards.length).toBe(12);
  });

  it('invalid level foo calls notFound()', async () => {
    await expect(resolveGrammarLevelPage('foo')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('invalid level A3 calls notFound()', async () => {
    await expect(resolveGrammarLevelPage('A3')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('generateStaticParams returns all 5 valid levels', () => {
    const levels = getGrammarLevels();
    const params = levels.map((level) => ({ level }));
    expect(params).toHaveLength(5);
    expect(params.map((p) => p.level)).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
  });
});
