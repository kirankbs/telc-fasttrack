import { notFound } from 'next/navigation';
import { MOCK_EXAM_CATALOG } from '@fastrack/content';
import { parseMockId } from '@/lib/loadMockExam';
import type { Level } from '@fastrack/types';
import { ExamResults } from '@/components/exam/ExamResults';

export function generateStaticParams(): { mockId: string }[] {
  return MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));
}

export const dynamicParams = false;

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const parsed = parseMockId(mockId);
  if (!parsed) notFound();

  const level = parsed.level as Level;

  return (
    <ExamResults
      mockId={mockId}
      level={level}
      mockNumber={parsed.mockNumber}
    />
  );
}
