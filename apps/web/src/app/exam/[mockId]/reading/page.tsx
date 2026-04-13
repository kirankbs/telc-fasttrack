import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { ReadingExam } from '@/components/exam/ReadingExam';

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
