import { notFound } from "next/navigation";
import { LEVEL_CONFIG } from "@telc/config";
import { SECTION_DURATIONS, formatTime } from "@telc/core";
import type { Level } from "@telc/types";
import { loadMockExam, parseMockId } from "@/lib/loadMockExam";

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

  // Check if actual content exists for this mock
  const exam = await loadMockExam(level, mockNumber);
  const hasContent = exam !== null;
  const durations = SECTION_DURATIONS[level];

  const sections = [
    { name: "Hören", key: "listening" as const, icon: "🎧", route: "listening" },
    { name: "Lesen", key: "reading" as const, icon: "📖", route: "reading" },
    { name: "Schreiben", key: "writing" as const, icon: "✍️", route: "writing" },
    { name: "Sprechen", key: "speaking" as const, icon: "🗣️", route: "speaking" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <a
        href={`/exam?level=${level}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-brand-primary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to {level} exams
      </a>

      {/* Header */}
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

        <div className="mt-4 rounded-lg bg-surface-container p-4 text-sm text-text-secondary">
          Bestehensgrenze: {cfg.passThreshold * 100}% in schriftlicher und
          mündlicher Prüfung.
        </div>

        {!hasContent && (
          <div className="mt-3 rounded-lg border border-warning bg-warning-light px-4 py-2 text-sm text-warning">
            Inhalt noch nicht verfügbar — kommt bald.
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Abschnitte</h2>
        {sections.map((section) => {
          const duration = durations[section.key];
          const href = `/exam/${mockId}/${section.route}`;
          return (
            <div
              key={section.key}
              className="flex items-center justify-between rounded-xl border border-border bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-hidden>
                  {section.icon}
                </span>
                <div>
                  <div className="font-semibold text-text-primary">
                    {section.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {duration > 0 ? `${Math.round(duration / 60)} Min.` : "—"}
                  </div>
                </div>
              </div>
              {hasContent ? (
                <a
                  href={href}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: cfg.color }}
                >
                  Starten
                </a>
              ) : (
                <span className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-disabled">
                  Bald
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Start full exam */}
      {hasContent ? (
        <a
          href={`/exam/${mockId}/listening`}
          className="block w-full rounded-xl py-4 text-center text-lg font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: cfg.color }}
        >
          Vollständige Prüfung starten
        </a>
      ) : (
        <div className="w-full rounded-xl py-4 text-center text-lg font-semibold text-text-disabled bg-surface-container">
          Inhalt noch nicht verfügbar
        </div>
      )}
    </div>
  );
}
