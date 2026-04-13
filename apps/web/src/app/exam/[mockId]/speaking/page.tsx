import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { SpeakingExam } from '@/components/exam/SpeakingExam';

export default async function SpeakingPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const { exam } = await getMockExamOrNotFound(mockId);

  return (
    <div className="mx-auto max-w-3xl">
      <SpeakingExam
        mockId={mockId}
        level={exam.level}
        section={exam.sections.speaking}
      />
    </div>
  );
}
