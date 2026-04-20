'use client';

import type { GrammarTopic } from '@fastrack/types';

interface TopicDetailProps {
  topic: GrammarTopic;
}

export function TopicDetail({ topic }: TopicDetailProps) {
  return (
    <div className="space-y-6">
      <section data-testid="explanation-section">
        <h2 className="text-lg font-semibold text-text-primary">Erklärung</h2>
        <div className="mt-2 rounded-xl border border-border bg-white p-5">
          <p className="text-text-primary leading-relaxed whitespace-pre-line">
            {topic.explanation}
          </p>
        </div>
      </section>

      <section data-testid="examples-section">
        <h2 className="text-lg font-semibold text-text-primary">Beispiele</h2>
        <ul className="mt-2 space-y-2 rounded-xl border border-border bg-white p-5">
          {topic.examples.map((example, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-text-primary"
            >
              <span className="mt-0.5 text-text-secondary select-none">•</span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
