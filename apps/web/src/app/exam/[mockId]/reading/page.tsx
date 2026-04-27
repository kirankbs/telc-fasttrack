import { MOCK_EXAM_CATALOG } from '@fastrack/content';
import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { ReadingExam } from '@/components/exam/ReadingExam';

export function generateStaticParams(): { mockId: string }[] {
  return MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));
}

export const dynamicParams = false;

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const { exam } = await getMockExamOrNotFound(mockId);

  return (
    <div className="mx-auto max-w-3xl">
      <ReadingExam
        mockId={mockId}
        level={exam.level}
        section={exam.sections.reading}
      />
    </div>
  );
}
