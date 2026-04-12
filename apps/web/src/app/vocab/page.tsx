import { LEVEL_CONFIG } from "@telc/config";
import type { Level } from "@telc/types";

const levels: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export default function VocabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Vocabulary</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Flashcards with SM-2 spaced repetition. Review daily for best results.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => {
          const cfg = LEVEL_CONFIG[level];
          return (
            <div
              key={level}
              className="rounded-xl border border-[#e0e0e0] bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: cfg.color }}
                >
                  {level}
                </span>
                <div>
                  <div className="font-semibold text-text-primary">
                    {level} Vocabulary
                  </div>
                  <div className="text-xs text-text-secondary">
                    {level === "A1" ? "~650 words" : "Coming soon"}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: cfg.color }}
                  disabled={level !== "A1"}
                >
                  {level === "A1" ? "Start Review" : "Coming Soon"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
