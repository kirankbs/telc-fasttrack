import { notFound } from 'next/navigation';
import type { Level } from '@fastrack/types';
import { loadGrammar } from '@/lib/loadGrammar';
import { TopicDetailPage } from '../../[topicId]/TopicDetailPage';

const VALID_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

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

  const topics = await loadGrammar(level);
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
