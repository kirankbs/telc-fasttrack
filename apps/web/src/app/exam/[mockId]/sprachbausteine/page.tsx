import { notFound } from 'next/navigation';
import { MOCK_EXAM_CATALOG } from '@fastrack/content';
import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { SprachbausteineExam } from '@/components/exam/SprachbausteineExam';

// Sprachbausteine only exists in B1 and B2 — A1, A2, C1 never have it.
// dynamicParams=false fast-404s any other level at the routing layer.
export function generateStaticParams(): { mockId: string }[] {
  return MOCK_EXAM_CATALOG.filter((entry) =>
    entry.level === 'B1' || entry.level === 'B2',
  ).map((entry) => ({ mockId: entry.id }));
}

export const dynamicParams = false;

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
