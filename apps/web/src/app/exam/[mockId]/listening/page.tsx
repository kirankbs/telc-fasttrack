import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { ListeningExam } from '@/components/exam/ListeningExam';

export default async function ListeningPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const { exam, mockNumber } = await getMockExamOrNotFound(mockId);

  return (
    <div className="mx-auto max-w-3xl">
      <ListeningExam
        mockId={mockId}
        level={exam.level}
        mockNumber={mockNumber}
        section={exam.sections.listening}
      />
    </div>
  );
}
