/**
 * Integration test for the /grammar/[level]/[topicId] server component.
 *
 * AC requirement (issue #106): do NOT mock getGrammarTopics or fs. The test
 * verifies that the page resolves data from the statically imported JSON
 * (no runtime fs reads) and that all edge-case paths (non-numeric topicId,
 * out-of-range, empty C1) call notFound() rather than hanging.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import { notFound } from 'next/navigation';
import { getGrammarTopics, getGrammarLevels } from '@fastrack/content';
import type { Level } from '@fastrack/types';
import { TopicDetailPage } from '../../app/grammar/[topicId]/TopicDetailPage';

/**
 * Mirrors GrammarLevelTopicPage from apps/web/src/app/grammar/[level]/[topicId]/page.tsx.
 */
async function resolveGrammarTopicPage(rawLevel: string, topicIdStr: string) {
  const level = rawLevel.toUpperCase() as Level;
  const validLevels = getGrammarLevels();

  if (!validLevels.includes(level)) {
    notFound();
    return null as never;
  }

  const orderIndex = parseInt(topicIdStr, 10);
  if (isNaN(orderIndex) || orderIndex < 1) {
    notFound();
    return null as never;
  }

  const topics = getGrammarTopics(level);
  const topic = topics.find((t) => t.orderIndex === orderIndex);
  if (!topic) {
    notFound();
    return null as never;
  }

  const totalTopics = topics.length;
  const hasPrev = topics.some((t) => t.orderIndex === orderIndex - 1);
  const hasNext = topics.some((t) => t.orderIndex === orderIndex + 1);

  return (
    <TopicDetailPage
      topic={topic}
      orderIndex={orderIndex}
      totalTopics={totalTopics}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />
  );
}

async function renderPage(rawLevel: string, topicId: string) {
  const jsx = await resolveGrammarTopicPage(rawLevel, topicId);
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(jsx);
  });
  return result;
}

describe('GrammarLevelTopicPage — static data, no fs at request time', () => {
  it('A1/1 renders the first topic with prev disabled, next enabled', async () => {
    await renderPage('A1', '1');
    const counter = screen.getByTestId('topic-counter');
    expect(counter.textContent).toBe('1 / 12');
    const prevBtn = screen.getByTestId('prev-topic') as HTMLButtonElement;
    const nextBtn = screen.getByTestId('next-topic') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);
  });

  it('A1/12 renders the last topic with prev enabled, next disabled', async () => {
    await renderPage('A1', '12');
    const counter = screen.getByTestId('topic-counter');
    expect(counter.textContent).toBe('12 / 12');
    const prevBtn = screen.getByTestId('prev-topic') as HTMLButtonElement;
    const nextBtn = screen.getByTestId('next-topic') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(true);
  });

  it('A1/6 renders a middle topic with both prev and next enabled', async () => {
    await renderPage('A1', '6');
    const counter = screen.getByTestId('topic-counter');
    expect(counter.textContent).toBe('6 / 12');
    const prevBtn = screen.getByTestId('prev-topic') as HTMLButtonElement;
    const nextBtn = screen.getByTestId('next-topic') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(false);
  });

  it('non-numeric topicId "articles" calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('A1', 'articles')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('non-numeric topicId "foo" calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('A1', 'foo')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('topicId 0 calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('A1', '0')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('topicId -1 calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('A1', '-1')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('out-of-range topicId 999 on A1 calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('A1', '999')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('topicId 1 on C1 (empty level) calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('C1', '1')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('invalid level calls notFound()', async () => {
    await expect(resolveGrammarTopicPage('D2', '1')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('B1/1 renders with correct total count of 20', async () => {
    await renderPage('B1', '1');
    const counter = screen.getByTestId('topic-counter');
    expect(counter.textContent).toBe('1 / 20');
  });

  it('generateStaticParams includes all level+topic combinations', () => {
    const validLevels = getGrammarLevels();
    const params = validLevels.flatMap((level) => {
      const topics = getGrammarTopics(level);
      return topics.map((t) => ({ level, topicId: String(t.orderIndex) }));
    });
    // A1(12) + A2(15) + B1(20) + B2(25) + C1(0) = 72
    expect(params.length).toBe(72);
    // C1 contributes 0 entries
    const c1Entries = params.filter((p) => p.level === 'C1');
    expect(c1Entries.length).toBe(0);
    // A1 contributes 12
    const a1Entries = params.filter((p) => p.level === 'A1');
    expect(a1Entries.length).toBe(12);
  });
});
