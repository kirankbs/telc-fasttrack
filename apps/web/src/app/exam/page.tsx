import { LEVEL_CONFIG } from "@fastrack/config";
import { getMocksForLevel, getAvailableLevels } from "@fastrack/content";
import type { Level } from "@fastrack/types";
import { loadMockExam } from "@/lib/loadMockExam";
import { MockCardList } from "@/components/exam/MockCardList";

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

  // Determine which catalog entries actually have JSON content on disk. This
  // is a cheap fs probe per mock; results are a few dozen per level at most.
  const mocksWithAvailability = await Promise.all(
    mocks.map(async (m) => {
      const exam = await loadMockExam(activeLevel, m.mockNumber);
      return {
        id: m.id,
        mockNumber: m.mockNumber,
        title: m.title.split(": ")[1] ?? m.title,
        hasContent: exam !== null,
      };
    }),
  );

  const anyContent = mocksWithAvailability.some((m) => m.hasContent);
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
          mocks={mocksWithAvailability}
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
