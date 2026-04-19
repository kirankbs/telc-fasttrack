import { notFound } from 'next/navigation';
import { parseMockId } from '@/lib/loadMockExam';
import type { Level } from '@telc/types';
import { ExamResults } from '@/components/exam/ExamResults';

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
