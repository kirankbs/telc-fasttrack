import { LEVEL_CONFIG } from "@telc/config";
import { getMocksForLevel, getAvailableLevels } from "@telc/content";
import type { Level } from "@telc/types";

export default function ExamListPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  return <ExamListContent searchParamsPromise={searchParams} />;
}

async function ExamListContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ level?: string }>;
}) {
  const { level: selectedLevel } = await searchParamsPromise;
  const levels = getAvailableLevels();
  const activeLevel = (
    levels.includes(selectedLevel as Level) ? selectedLevel : "A1"
  ) as Level;
  const mocks = getMocksForLevel(activeLevel);
  const cfg = LEVEL_CONFIG[activeLevel];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mock Exams</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Full timed practice exams following the official telc format
        </p>
      </div>

      {/* Level tabs */}
      <div className="flex flex-wrap gap-2">
        {levels.map((lvl) => {
          const isActive = lvl === activeLevel;
          const lvlCfg = LEVEL_CONFIG[lvl];
          return (
            <a
              key={lvl}
              href={`/exam?level=${lvl}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "border border-[#e0e0e0] bg-white text-text-secondary hover:border-[#bdbdbd]"
              }`}
              style={isActive ? { backgroundColor: lvlCfg.color } : undefined}
            >
              {lvl}
            </a>
          );
        })}
      </div>

      {/* Level info */}
      <div
        className="rounded-lg border-l-4 p-4"
        style={{ borderColor: cfg.color, backgroundColor: `${cfg.color}10` }}
      >
        <div className="font-semibold text-text-primary">{cfg.label}</div>
        <div className="mt-1 text-sm text-text-secondary">
          ~{cfg.targetHours} hours to exam ready &middot; {cfg.passThreshold * 100}%
          pass threshold in both written and oral
        </div>
      </div>

      {/* Mock exam grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mocks.map((mock) => (
          <a
            key={mock.id}
            href={`/exam/${mock.id}`}
            className="group rounded-xl border border-[#e0e0e0] bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: cfg.color }}
                >
                  {activeLevel}
                </span>
                <h3 className="mt-2 font-semibold text-text-primary">
                  Übungstest {mock.mockNumber}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {mock.title.split(": ")[1] || mock.title}
                </p>
              </div>
              <svg
                className="mt-1 h-5 w-5 text-text-disabled transition-colors group-hover:text-brand-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <div className="mt-4 flex gap-3 text-xs text-text-secondary">
              <span>Hören</span>
              <span>&middot;</span>
              <span>Lesen</span>
              <span>&middot;</span>
              <span>Schreiben</span>
              <span>&middot;</span>
              <span>Sprechen</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
