import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LEVEL_CONFIG } from "@fastrack/config";
import { SECTION_DURATIONS } from "@fastrack/core";
import type { Level } from "@fastrack/types";
import { MOCK_EXAM_CATALOG } from "@fastrack/content";
import { loadMockExam, parseMockId } from "@/lib/loadMockExam";
import { SectionHub, type HubSection } from "@/components/exam/SectionHub";
import { ViewResultsLink } from "@/components/exam/SectionStatus";

// Pre-render every known mock at build time so /exam/[mockId] is served as a
// static page — no Lambda invocation, no fs read at request time.
// dynamicParams=false means any mockId not in this list immediately 404s at
// the routing layer (faster than letting the page component do it).
export function generateStaticParams(): { mockId: string }[] {
  return MOCK_EXAM_CATALOG.map((entry) => ({ mockId: entry.id }));
}

export const dynamicParams = false;

export default async function MockExamDetailPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;

  const parsed = parseMockId(mockId);
  if (!parsed) notFound();

  const { level: levelStr, mockNumber } = parsed;
  const level = levelStr as Level;
  const cfg = LEVEL_CONFIG[level];

  const exam = await loadMockExam(level, mockNumber);
  const hasContent = exam !== null;
  const durations = SECTION_DURATIONS[level] as Record<string, number | undefined>;
  const hasSprachbausteine = Boolean(exam?.sections.sprachbausteine);

  const written: HubSection[] = [
    {
      key: "listening",
      name: "Hören",
      route: "listening",
      durationSec: durations.listening ?? 0,
    },
    {
      key: "reading",
      name: "Lesen",
      route: "reading",
      durationSec: durations.reading ?? 0,
    },
    ...(hasSprachbausteine
      ? [
          {
            key: "sprachbausteine" as const,
            name: "Sprachbausteine",
            route: "sprachbausteine",
            durationSec: durations.sprachbausteine ?? 0,
          },
        ]
      : []),
    {
      key: "writing",
      name: "Schreiben",
      route: "writing",
      durationSec: durations.writing ?? 0,
    },
  ];

  const oral: HubSection[] = [
    {
      key: "speaking",
      name: "Sprechen",
      route: "speaking",
      durationSec: durations.speaking ?? 0,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <a
        href={`/exam?level=${level}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Zurück zu {level}-Übungstests
      </a>

      {/* Exam header */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: cfg.color }}
          >
            {level}
          </span>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Übungstest {mockNumber}
            </h1>
            <p className="text-sm text-text-secondary">{cfg.label}</p>
          </div>
        </div>

        {!hasContent && (
          <div className="mt-4 rounded-lg border border-warning bg-warning-surface px-4 py-2 text-sm text-warning">
            Inhalt noch nicht verfügbar — kommt bald.
          </div>
        )}
      </div>

      <SectionHub
        mockId={mockId}
        level={level}
        written={written}
        oral={oral}
        hasContent={hasContent}
      />

      {hasContent && <ViewResultsLink mockId={mockId} />}
    </div>
  );
}
