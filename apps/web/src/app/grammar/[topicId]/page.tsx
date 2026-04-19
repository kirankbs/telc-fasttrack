import { notFound } from 'next/navigation';
import { loadGrammar } from '@/lib/loadGrammar';
import { TopicDetailPage } from './TopicDetailPage';

interface Props {
  params: Promise<{ topicId: string }>;
}

export default async function GrammarTopicPage({ params }: Props) {
  const { topicId } = await params;
  const orderIndex = parseInt(topicId, 10);

  if (isNaN(orderIndex) || orderIndex < 1) {
    notFound();
  }

  const topics = await loadGrammar('A1');

  const topic = topics.find((t) => t.orderIndex === orderIndex);
  if (!topic) {
    notFound();
  }

  const totalTopics = topics.length;
  const hasPrev = orderIndex > 1;
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
