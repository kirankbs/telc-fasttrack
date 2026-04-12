import { LEVEL_CONFIG } from "@telc/config";
import type { Level } from "@telc/types";

const levels: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-brand-primary p-8 text-white sm:p-12">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Spend X hours. Pass telc.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/80">
          Practice with realistic mock exams, build vocabulary with spaced
          repetition, and track your progress toward exam day.
        </p>
        <a
          href="/exam"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-white/90"
        >
          Start practicing
        </a>
      </section>

      {/* Level cards */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Choose your level
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {levels.map((level) => {
            const cfg = LEVEL_CONFIG[level];
            return (
              <a
                key={level}
                href={`/exam?level=${level}`}
                className="group rounded-xl border border-[#e0e0e0] bg-white p-6 transition-shadow hover:shadow-md"
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
                      {cfg.label}
                    </div>
                    <div className="text-xs text-text-secondary">
                      ~{cfg.targetHours}h to exam ready
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-text-secondary">
                  10 mock exams &middot; 60% pass threshold
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          href="/exam"
          title="Mock Exams"
          description="Full timed exams with Hören, Lesen, Schreiben, Sprechen"
          icon="📝"
        />
        <QuickAction
          href="/vocab"
          title="Vocabulary"
          description="Flashcards with SM-2 spaced repetition"
          icon="📚"
        />
        <QuickAction
          href="/grammar"
          title="Grammar"
          description="Topics with exercises and examples"
          icon="📖"
        />
      </section>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="flex gap-4 rounded-xl border border-[#e0e0e0] bg-white p-5 transition-shadow hover:shadow-md"
    >
      <span className="text-2xl" role="img" aria-hidden>
        {icon}
      </span>
      <div>
        <div className="font-semibold text-text-primary">{title}</div>
        <div className="mt-1 text-sm text-text-secondary">{description}</div>
      </div>
    </a>
  );
}
