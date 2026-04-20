import { notFound } from 'next/navigation';
import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { SprachbausteineExam } from '@/components/exam/SprachbausteineExam';

export default async function SprachbausteinePage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const { exam } = await getMockExamOrNotFound(mockId);

  if (!exam.sections.sprachbausteine) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <SprachbausteineExam
        mockId={mockId}
        level={exam.level}
        section={exam.sections.sprachbausteine}
      />
    </div>
  );
}
