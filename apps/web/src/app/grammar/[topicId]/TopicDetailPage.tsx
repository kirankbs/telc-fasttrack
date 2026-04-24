'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { GrammarTopic } from '@fastrack/types';
import { TopicDetail } from '@/components/grammar/TopicDetail';
import { ExercisePlayer } from '@/components/grammar/ExercisePlayer';

interface TopicDetailPageProps {
  topic: GrammarTopic;
  orderIndex: number;
  totalTopics: number;
  hasPrev: boolean;
  hasNext: boolean;
}

// Rough "reading + exercise" time estimate. Matches the mobile app's
// assumption of ~2 min per exercise + 3 min reading.
function estimateMinutes(topic: GrammarTopic): number {
  const exerciseCount = topic.exercises?.length ?? 0;
  return 3 + exerciseCount * 2;
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
  const minutes = estimateMinutes(topic);

  return (
    <article className="mx-auto max-w-[660px] px-6 pt-10 pb-16 md:px-0">
      {/* Breadcrumb */}
      <nav
        data-testid="breadcrumb"
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[13px] text-text-secondary"
      >
        <Link
          href="/grammar"
          data-testid="back-to-overview"
          className="inline-flex items-center gap-1 hover:text-text-primary"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Grammatik</span>
        </Link>
        <span className="text-text-tertiary" aria-hidden="true">
          /
        </span>
        <Link
          href={`/grammar/${topic.level}`}
          data-testid="back-to-level"
          className="hover:text-text-primary"
        >
          {topic.level}
        </Link>
        <span className="text-text-tertiary" aria-hidden="true">
          /
        </span>
        <span className="truncate text-text-primary" lang="de">
          {topic.topic}
        </span>
      </nav>

      {/* Title */}
      <header className="mt-6 space-y-2">
        <h1
          className="font-sans text-3xl font-semibold tracking-[-0.01em] text-text-primary"
          lang="de"
        >
          {topic.topic}
        </h1>
        <p
          data-testid="topic-subtitle"
          className="text-xs font-medium uppercase tracking-wide text-text-tertiary"
        >
          {topic.level} · ~{minutes} Minuten
        </p>
      </header>

      {/* Explanation + examples */}
      <div className="mt-8">
        <TopicDetail topic={topic} />
      </div>

      {/* Divider between explanation and exercises */}
      {hasExercises && (
        <>
          <hr
            data-testid="exercise-divider"
            className="my-10 border-0 border-t border-border"
          />
          <ExercisePlayer exercises={exercises} topicName={topic.topic} />
        </>
      )}

      {/* Topic navigation footer — stays within the same level */}
      <div
        className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
      >
        <button
          data-testid="prev-topic"
          disabled={!hasPrev}
          onClick={() => router.push(`/grammar/${topic.level}/${orderIndex - 1}`)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
        >
          &larr; Zurück
        </button>
        <span data-testid="topic-counter" className="text-sm text-text-secondary">
          {orderIndex} / {totalTopics}
        </span>
        <button
          data-testid="next-topic"
          disabled={!hasNext}
          onClick={() => router.push(`/grammar/${topic.level}/${orderIndex + 1}`)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
        >
          Weiter &rarr;
        </button>
      </div>
    </article>
  );
}
