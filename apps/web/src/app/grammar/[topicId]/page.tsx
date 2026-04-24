import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ topicId: string }>;
}

// Legacy route: /grammar/N was always A1. Redirect to the canonical level-scoped URL.
export default async function GrammarTopicRedirectPage({ params }: Props) {
  const { topicId } = await params;
  redirect(`/grammar/A1/${topicId}`);
}
