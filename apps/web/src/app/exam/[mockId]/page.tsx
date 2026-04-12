import { LEVEL_CONFIG } from "@telc/config";
import { SECTION_DURATIONS, formatTime } from "@telc/core";
import type { Level } from "@telc/types";

export default async function MockExamDetailPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;

  // Parse level and mock number from ID like "A1_mock_01"
  const match = mockId.match(/^(A1|A2|B1|B2|C1)_mock_(\d+)$/);
  if (!match) {
    return (
      <div className="py-12 text-center text-text-secondary">
        Invalid mock exam ID: {mockId}
      </div>
    );
  }

  const level = match[1] as Level;
  const mockNumber = parseInt(match[2], 10);
  const cfg = LEVEL_CONFIG[level];
  const durations = SECTION_DURATIONS[level];

  const sections = [
    { name: "Hören", key: "listening" as const, icon: "🎧" },
    { name: "Lesen", key: "reading" as const, icon: "📖" },
    { name: "Schreiben", key: "writing" as const, icon: "✍️" },
    { name: "Sprechen", key: "speaking" as const, icon: "🗣️" },
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
      <div className="rounded-xl border border-[#e0e0e0] bg-white p-6">
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
          Pass requirement: {cfg.passThreshold * 100}% in both the written and
          oral sections.
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Sections</h2>
        {sections.map((section) => {
          const duration = durations[section.key];
          return (
            <div
              key={section.key}
              className="flex items-center justify-between rounded-xl border border-[#e0e0e0] bg-white p-5"
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
                    {duration > 0 ? formatTime(duration) : "—"} minutes
                  </div>
                </div>
              </div>
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: cfg.color }}
              >
                Start
              </button>
            </div>
          );
        })}
      </div>

      {/* Start full exam */}
      <button
        className="w-full rounded-xl py-4 text-center text-lg font-semibold text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: cfg.color }}
      >
        Start Full Exam
      </button>
    </div>
  );
}
