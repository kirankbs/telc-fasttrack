import { notFound } from 'next/navigation';
import type { Level } from '@fastrack/types';
import { getGrammarTopics, getGrammarLevels } from '@fastrack/content';
import { TopicDetailPage } from '../../[topicId]/TopicDetailPage';

// Defense-in-depth: pre-render all topic detail pages at build time.
// Root cause of #106: this page previously called loadGrammar (request-time fs read)
// which hung on Vercel because the grammar JSON was not bundled into the Lambda.
export const dynamicParams = false;

const VALID_LEVELS = getGrammarLevels();

export function generateStaticParams() {
  return VALID_LEVELS.flatMap((level) => {
    const topics = getGrammarTopics(level);
    return topics.map((t) => ({ level, topicId: String(t.orderIndex) }));
  });
}

interface Props {
  params: Promise<{ level: string; topicId: string }>;
}

export default async function GrammarLevelTopicPage({ params }: Props) {
  const { level: rawLevel, topicId } = await params;
  const level = rawLevel.toUpperCase() as Level;

  if (!VALID_LEVELS.includes(level)) {
    notFound();
  }

  const orderIndex = parseInt(topicId, 10);
  if (isNaN(orderIndex) || orderIndex < 1) {
    notFound();
  }

  const topics = getGrammarTopics(level);
  const topic = topics.find((t) => t.orderIndex === orderIndex);
  if (!topic) {
    notFound();
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
