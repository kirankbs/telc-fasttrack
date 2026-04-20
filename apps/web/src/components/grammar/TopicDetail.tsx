'use client';

import type { GrammarTopic } from '@fastrack/types';

interface TopicDetailProps {
  topic: GrammarTopic;
}

/**
 * Splits an example line of the form "der Mann — the man" or "der Mann - the man"
 * into its German and English halves. If no separator is present, the whole string
 * is treated as German.
 */
function splitExample(example: string): { german: string; english: string | null } {
  const separators = [' — ', ' – ', ' - ', ' -- '];
  for (const sep of separators) {
    const idx = example.indexOf(sep);
    if (idx >= 0) {
      return {
        german: example.slice(0, idx).trim(),
        english: example.slice(idx + sep.length).trim(),
      };
    }
  }
  return { german: example.trim(), english: null };
}

export function TopicDetail({ topic }: TopicDetailProps) {
  return (
    <div className="space-y-8">
      <section data-testid="explanation-section" className="space-y-5">
        <p
          className="font-sans text-base leading-[1.65] text-text-primary whitespace-pre-line"
          lang="de"
        >
          {topic.explanation}
        </p>

        {topic.examples.length > 0 && (
          <div
            data-testid="examples-block"
            className="rounded-r-lg border-l-4 border-brand-200 bg-brand-50 p-4 pl-5"
          >
            <ul className="space-y-2">
              {topic.examples.map((example, i) => {
                const { german, english } = splitExample(example);
                return (
                  <li
                    key={i}
                    data-testid={`example-${i}`}
                    className="text-sm leading-relaxed text-text-primary"
                  >
                    <span className="font-medium" lang="de">
                      {german}
                    </span>
                    {english && (
                      <span className="text-text-secondary"> — {english}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
