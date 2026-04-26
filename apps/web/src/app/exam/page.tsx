import { LEVEL_CONFIG } from "@fastrack/config";
import { getMocksForLevel, getAvailableLevels } from "@fastrack/content";
import type { Level } from "@fastrack/types";
import { MockCardList } from "@/components/exam/MockCardList";

// Force static rendering: this page reads only from catalog metadata
// (baked at build time). No Lambda invocation, no fs reads at request time.
// Root cause of #104: the previous version ran Promise.all(loadMockExam) for
// every catalog entry — 10 concurrent fs reads that hung the Vercel function.
export const dynamic = "force-static";

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

  // Derive mocks from catalog only — hasContent is a static literal in
  // packages/content/src/catalog.ts, no fs probing at request time.
  const catalogMocks = getMocksForLevel(activeLevel);
  const mocks = catalogMocks.map((m) => ({
    id: m.id,
    mockNumber: m.mockNumber,
    title: m.title.split(": ")[1] ?? m.title,
    hasContent: m.hasContent,
  }));

  const anyContent = mocks.some((m) => m.hasContent);
  const cfg = LEVEL_CONFIG[activeLevel];
  const totalSections = 4; // Hören, Lesen, Schreiben, Sprechen — base count

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Übungstests</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Vollständige Prüfungssimulationen nach offiziellem telc-Format.
        </p>
      </div>

      {/* Level pills */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="CEFR-Stufen">
        {levels.map((lvl) => {
          const isActive = lvl === activeLevel;
          const lvlCfg = LEVEL_CONFIG[lvl];
          return (
            <a
              key={lvl}
              href={`/exam?level=${lvl}`}
              role="tab"
              aria-selected={isActive}
              data-testid={`level-tab-${lvl}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "border border-border bg-white text-text-secondary hover:border-border-hover"
              }`}
              style={isActive ? { backgroundColor: lvlCfg.color } : undefined}
            >
              {lvl}
            </a>
          );
        })}
      </div>

      {/* Level info strip — uses level-surface + level-text (no hex-opacity hack). */}
      <div
        className="rounded-lg border-l-4 p-4"
        data-testid="level-info-strip"
        style={{
          borderColor: cfg.color,
          backgroundColor: cfg.surface,
          color: cfg.textColor,
        }}
      >
        <div className="font-semibold">{cfg.label}</div>
        <div className="mt-1 text-sm opacity-90">
          ~{cfg.targetHours} Stunden bis zur Prüfungsreife &middot;{" "}
          {cfg.passThreshold * 100}% Bestehensgrenze in schriftlicher und
          mündlicher Prüfung.
        </div>
      </div>

      {/* Mock grid or empty state */}
      {anyContent ? (
        <MockCardList
          level={activeLevel}
          mocks={mocks}
          totalSections={totalSections}
        />
      ) : (
        <div
          className="rounded-xl border border-border bg-white py-12 text-center text-sm text-text-secondary"
          data-testid="mocks-empty-state"
        >
          {activeLevel} Übungstests sind bald verfügbar.
        </div>
      )}
    </div>
  );
}
