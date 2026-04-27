import { MOCK_EXAM_CATALOG } from '@fastrack/content';
import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { WritingExam } from '@/components/exam/WritingExam';

export function generateStaticParams(): { mockId: string }[] {
  return MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));
}

export const dynamicParams = false;

export default async function WritingPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const { exam } = await getMockExamOrNotFound(mockId);

  return (
    <div className="mx-auto max-w-3xl">
      <WritingExam
        mockId={mockId}
        level={exam.level}
        section={exam.sections.writing}
      />
    </div>
  );
}
