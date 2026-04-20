'use client';

import Link from 'next/link';
import type { GrammarTopic } from '@fastrack/types';

interface TopicCardProps {
  topic: GrammarTopic;
  levelColor: string;
}

export function TopicCard({ topic, levelColor }: TopicCardProps) {
  const exerciseCount = topic.exercises?.length ?? 0;
  const exampleCount = topic.examples.length;

  return (
    <Link
      href={`/grammar/${topic.orderIndex}`}
      data-testid={`topic-card-${topic.orderIndex}`}
      className="block rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: levelColor }}
        >
          {topic.orderIndex}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-text-primary leading-snug">
            {topic.topic}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
            <span>{exampleCount} Beispiele</span>
            {exerciseCount > 0 && <span>{exerciseCount} Übungen</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
