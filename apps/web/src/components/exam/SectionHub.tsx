'use client';

import { useEffect, useMemo, useState } from 'react';
import { Headphones, FileText, Puzzle, Pencil, Mic } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Level } from '@fastrack/types';
import { LEVEL_CONFIG } from '@fastrack/config';
import { getSession, type ExamSessionState } from '@/lib/examSession';

export type SectionKey =
  | 'listening'
  | 'reading'
  | 'sprachbausteine'
  | 'writing'
  | 'speaking';

export interface HubSection {
  key: SectionKey;
  name: string;
  route: string;
  durationSec: number;
}

interface SectionHubProps {
  mockId: string;
  level: Level;
  written: HubSection[];
  oral: HubSection[];
  /** Whether the actual content JSON exists; when false we lock every row. */
  hasContent: boolean;
}

const ICON_BY_KEY: Record<SectionKey, LucideIcon> = {
  listening: Headphones,
  reading: FileText,
  sprachbausteine: Puzzle,
  writing: Pencil,
  speaking: Mic,
};

type Status = 'not-started' | 'in-progress' | 'completed';

/**
 * Section hub lives below the mock header. Groups sections into
 * Schriftlich / Mündlich with pass-threshold sub-headings, and surfaces
 * a single "Start with {next}" CTA at the bottom for quick continuation.
 */
export function SectionHub({
  mockId,
  level,
  written,
  oral,
  hasContent,
}: SectionHubProps) {
  const [session, setSession] = useState<ExamSessionState | null>(null);

  useEffect(() => {
    if (hasContent) setSession(getSession(mockId));
  }, [mockId, hasContent]);

  const statusOf = (key: SectionKey): Status => {
    const s = session?.sections[key];
    if (!s) return 'not-started';
    // We store per-section results on submission, so "in-progress" only
    // surfaces after the orchestrator (exam runner) adds a partial marker.
    // Today we treat any stored section as completed.
    return 'completed';
  };

  const ordered = useMemo(() => [...written, ...oral], [written, oral]);
  const nextSection = ordered.find((s) => statusOf(s.key) !== 'completed');
  const inProgressExists = ordered.some((s) => statusOf(s.key) === 'in-progress');

  const ctaLabel = nextSection
    ? inProgressExists
      ? `Weiter mit ${nextSection.name}`
      : `Mit ${nextSection.name} starten`
    : 'Alle Abschnitte abgeschlossen';

  const ctaHref = nextSection
    ? `/exam/${mockId}/${nextSection.route}`
    : `/exam/${mockId}/results`;

  return (
    <div className="space-y-6">
      <Group
        title="Schriftlich"
        threshold="min. 60% zum Bestehen"
        sections={written}
        mockId={mockId}
        level={level}
        statusOf={statusOf}
        hasContent={hasContent}
      />
      <Group
        title="Mündlich"
        threshold="min. 60% zum Bestehen"
        sections={oral}
        mockId={mockId}
        level={level}
        statusOf={statusOf}
        hasContent={hasContent}
      />

      {hasContent ? (
        <a
          href={ctaHref}
          data-testid="section-hub-cta"
          className="block w-full rounded-xl bg-brand-600 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {ctaLabel}
        </a>
      ) : (
        <div className="w-full rounded-xl bg-surface-container py-4 text-center text-base font-semibold text-text-tertiary">
          Inhalt noch nicht verfügbar
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  threshold,
  sections,
  mockId,
  level,
  statusOf,
  hasContent,
}: {
  title: string;
  threshold: string;
  sections: HubSection[];
  mockId: string;
  level: Level;
  statusOf: (key: SectionKey) => Status;
  hasContent: boolean;
}) {
  const cfg = LEVEL_CONFIG[level];

  return (
    <section
      data-testid={`hub-group-${title.toLowerCase()}`}
      aria-label={`${title} — ${threshold}`}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </h2>
        <span className="text-xs text-text-tertiary">{threshold}</span>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {sections.map((s) => {
          const Icon = ICON_BY_KEY[s.key];
          const status = statusOf(s.key);
          const mins = Math.round(s.durationSec / 60);
          const href = `/exam/${mockId}/${s.route}`;

          const dotColor =
            status === 'completed'
              ? 'bg-pass'
              : status === 'in-progress'
                ? ''
                : 'bg-text-tertiary';

          const dotInlineColor =
            status === 'in-progress' ? { backgroundColor: cfg.color } : undefined;

          const buttonLabel =
            status === 'completed'
              ? 'Review'
              : status === 'in-progress'
                ? 'Continue'
                : 'Start';

          const buttonStyle =
            status === 'completed'
              ? 'border border-border text-text-primary hover:border-border-hover'
              : status === 'in-progress'
                ? 'bg-brand-500 text-white hover:bg-brand-600'
                : 'text-white hover:opacity-90';

          const inlineStyle =
            status === 'not-started'
              ? { backgroundColor: cfg.color }
              : undefined;

          return (
            <div
              key={s.key}
              data-testid={`hub-section-${s.key}`}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                  style={dotInlineColor}
                  data-testid={`hub-status-dot-${s.key}`}
                  data-status={status}
                />
                <Icon
                  className="h-5 w-5 shrink-0 text-text-secondary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="font-medium text-text-primary">{s.name}</div>
                  <div className="text-xs text-text-secondary">
                    {mins > 0 ? `${mins} Min.` : '—'}
                  </div>
                </div>
              </div>
              {hasContent ? (
                <a
                  href={href}
                  data-testid={`hub-action-${s.key}`}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${buttonStyle}`}
                  style={inlineStyle}
                >
                  {buttonLabel}
                </a>
              ) : (
                <span className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-tertiary">
                  Bald
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
