import { MOCK_EXAM_CATALOG } from '@fastrack/content';
import { getMockExamOrNotFound } from '@/lib/loadMockExam';
import { ListeningExam } from '@/components/exam/ListeningExam';

export function generateStaticParams(): { mockId: string }[] {
  return MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));
}

export const dynamicParams = false;

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
