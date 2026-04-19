'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GrammarTopic } from '@telc/types';
import { TopicDetail } from '@/components/grammar/TopicDetail';
import { ExercisePlayer } from '@/components/grammar/ExercisePlayer';

interface TopicDetailPageProps {
  topic: GrammarTopic;
  orderIndex: number;
  totalTopics: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function TopicDetailPage({
  topic,
  orderIndex,
  totalTopics,
  hasPrev,
  hasNext,
}: TopicDetailPageProps) {
  const router = useRouter();
  const exercises = topic.exercises ?? [];
  const hasExercises = exercises.length > 0;

  return (
    <div className="space-y-6">
      {/* header with back + nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/grammar"
          data-testid="back-to-overview"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-primary-light transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Übersicht
        </Link>

        <div className="flex items-center gap-2">
          <button
            data-testid="prev-topic"
            disabled={!hasPrev}
            onClick={() => router.push(`/grammar/${orderIndex - 1}`)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &larr; Zurück
          </button>
          <span
            data-testid="topic-counter"
            className="text-sm text-text-secondary"
          >
            {orderIndex} / {totalTopics}
          </span>
          <button
            data-testid="next-topic"
            disabled={!hasNext}
            onClick={() => router.push(`/grammar/${orderIndex + 1}`)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Weiter &rarr;
          </button>
        </div>
      </div>

      {/* topic title */}
      <h1 className="text-2xl font-bold text-text-primary">{topic.topic}</h1>

      {/* explanation + examples */}
      <TopicDetail topic={topic} />

      {/* exercise player */}
      {hasExercises && (
        <ExercisePlayer
          exercises={exercises}
          topicName={topic.topic}
        />
      )}

      {/* bottom nav after exercises / when no exercises */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {hasNext && (
          <button
            data-testid="next-topic-bottom"
            onClick={() => router.push(`/grammar/${orderIndex + 1}`)}
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-light"
          >
            Nächstes Thema
          </button>
        )}
        <Link
          href="/grammar"
          data-testid="back-to-overview-bottom"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container"
        >
          Zur Übersicht
        </Link>
      </div>
    </div>
  );
}
