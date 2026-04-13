import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { WritingExam } from '@/components/exam/WritingExam';

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
