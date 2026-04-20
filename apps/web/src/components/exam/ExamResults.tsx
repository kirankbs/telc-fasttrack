'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Level } from '@fastrack/types';
import { getSession, clearSession, hasAnySection } from '@/lib/examSession';
import type { ExamSessionState, SectionResult } from '@/lib/examSession';

interface ExamResultsProps {
  mockId: string;
  level: Level;
  mockNumber: number;
}

const SECTION_META = [
  { key: 'listening' as const, label: 'Hören', aggregate: 'written' as const },
  { key: 'reading' as const, label: 'Lesen', aggregate: 'written' as const },
  {
    key: 'sprachbausteine' as const,
    label: 'Sprachbausteine',
    aggregate: 'written' as const,
  },
  { key: 'writing' as const, label: 'Schreiben', aggregate: 'written' as const },
  { key: 'speaking' as const, label: 'Sprechen', aggregate: 'oral' as const },
] as const;

type SectionKey = (typeof SECTION_META)[number]['key'];

function SectionScoreRow({
  label,
  result,
  isHumanGraded,
}: {
  label: string;
  result: SectionResult | undefined;
  isHumanGraded: boolean;
}) {
  if (!result) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <span className="font-medium text-text-primary">{label}</span>
        <span
          data-testid={`section-status-${label.toLowerCase()}`}
          className="text-sm text-text-disabled"
        >
          Nicht bearbeitet
        </span>
      </div>
    );
  }

  const pct = Math.round(result.score.percentage * 100);
  const hasAssessment = result.selfAssessment !== undefined;

  return (
    <div
      data-testid={`section-result-${label.toLowerCase()}`}
      className="rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-text-primary">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">
            {result.score.earned}/{result.score.max}
          </span>
          <span
            className={`text-sm font-semibold ${
              result.score.passed ? 'text-pass' : 'text-fail'
            }`}
          >
            {pct}%
          </span>
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              result.score.passed ? 'bg-pass' : 'bg-fail'
            }`}
          />
        </div>
      </div>
      {isHumanGraded && !hasAssessment && (
        <p className="mt-2 text-xs italic text-text-secondary">
          Prüferbewertung ausstehend
        </p>
      )}
      {isHumanGraded && hasAssessment && (
        <p className="mt-2 text-xs text-text-secondary">
          Selbsteinschätzung: {result.selfAssessment}%
        </p>
      )}
    </div>
  );
}

function computeAggregates(session: ExamSessionState) {
  const sections = session.sections;
  let writtenEarned = 0, writtenMax = 0;
  let oralEarned = 0, oralMax = 0;

  for (const meta of SECTION_META) {
    const result = sections[meta.key];
    if (!result) continue;
    if (meta.aggregate === 'written') {
      writtenEarned += result.score.earned;
      writtenMax += result.score.max;
    } else {
      oralEarned += result.score.earned;
      oralMax += result.score.max;
    }
  }

  const writtenPct = writtenMax > 0 ? writtenEarned / writtenMax : 0;
  const oralPct = oralMax > 0 ? oralEarned / oralMax : 0;
  const totalEarned = writtenEarned + oralEarned;
  const totalMax = writtenMax + oralMax;
  const totalPct = totalMax > 0 ? totalEarned / totalMax : 0;

  const writtenPassed = writtenPct >= 0.6;
  const oralPassed = oralPct >= 0.6;
  const passed = writtenPassed && oralPassed;

  const isComplete = !!(
    sections.listening &&
    sections.reading &&
    sections.writing &&
    sections.speaking
  );

  return {
    written: { earned: writtenEarned, max: writtenMax, pct: writtenPct, passed: writtenPassed },
    oral: { earned: oralEarned, max: oralMax, pct: oralPct, passed: oralPassed },
    total: { earned: totalEarned, max: totalMax, pct: totalPct },
    passed,
    isComplete,
  };
}

interface Recommendation {
  section: SectionKey | 'generic';
  text: string;
}

function buildRecommendations(
  session: ExamSessionState,
  agg: ReturnType<typeof computeAggregates>,
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (agg.isComplete && agg.passed) {
    recs.push({
      section: 'generic',
      text: 'Gut gemacht — dieses Ergebnis reicht für die Prüfung. Mach weiter.',
    });
    return recs;
  }

  // For every failing section, attach at least one actionable recommendation.
  for (const meta of SECTION_META) {
    const result = session.sections[meta.key];
    if (!result) continue;
    if (!result.score.passed) {
      recs.push({
        section: meta.key,
        text: `${meta.label} — 3 weitere Übungen empfohlen.`,
      });
    }
  }

  // If no per-section failure but aggregates fail (e.g., mix of missing +
  // weak), fall back to aggregate-level nudges.
  if (recs.length === 0) {
    if (!agg.written.passed) {
      recs.push({
        section: 'generic',
        text: 'Schriftlich — zusätzliche Übungen in den schriftlichen Teilen empfohlen.',
      });
    }
    if (!agg.oral.passed) {
      recs.push({
        section: 'generic',
        text: 'Mündlich — Sprechen weiter üben.',
      });
    }
  }

  return recs;
}

export function ExamResults({ mockId, level, mockNumber }: ExamResultsProps) {
  const router = useRouter();
  const [session, setSession] = useState<ExamSessionState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSession(getSession(mockId));
    setLoaded(true);
  }, [mockId]);

  if (!loaded) return null;

  if (!session || !hasAnySection(session)) {
    return (
      <div data-testid="results-empty" className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <h2 className="text-xl font-bold text-text-primary">
            Keine Prüfungsdaten vorhanden
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Starten Sie zuerst eine Prüfung, um Ergebnisse zu sehen.
          </p>
          <a
            href={`/exam/${mockId}`}
            className="mt-4 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Zur Prüfungsübersicht
          </a>
        </div>
      </div>
    );
  }

  const agg = computeAggregates(session);
  const recommendations = buildRecommendations(session, agg);

  const handleRestart = () => {
    clearSession(mockId);
    router.push(`/exam/${mockId}`);
  };

  return (
    <div data-testid="results-page" className="mx-auto max-w-3xl space-y-8">
      <a
        href={`/exam/${mockId}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Zurück zur Prüfung
      </a>

      {/* 1. Header */}
      <header data-testid="results-header" className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          {level} Prüfungsergebnis
        </p>
        <h1 className="font-sans text-2xl font-semibold text-text-primary">
          Übungstest {mockNumber} — Ergebnisse
        </h1>
      </header>

      {/* 2. Score headline — absolute score leads, never the verdict */}
      <section data-testid="score-headline" className="space-y-1">
        <p className="font-display text-4xl font-semibold leading-tight text-text-primary">
          Du hast {agg.total.earned} von {agg.total.max} Punkten erreicht.
        </p>
        <p className="text-sm text-text-secondary">
          {Math.round(agg.total.pct * 100)}% insgesamt
          {!agg.isComplete && ' · Einige Abschnitte wurden noch nicht bearbeitet.'}
        </p>
      </section>

      {/* 3. Written + Oral aggregate cards, side by side */}
      <section
        aria-label="Aggregate scores"
        className="grid gap-4 sm:grid-cols-2"
      >
        <AggregateCard
          testId="written-aggregate"
          label="Schriftlich"
          sectionName="Schriftlich"
          pct={agg.written.pct}
          passed={agg.written.passed}
          hasData={agg.written.max > 0}
        />
        <AggregateCard
          testId="oral-aggregate"
          label="Mündlich"
          sectionName="Mündlich"
          pct={agg.oral.pct}
          passed={agg.oral.passed}
          hasData={agg.oral.max > 0}
        />
      </section>

      {/* 4. Pass/fail as small dot line — not hero */}
      {agg.isComplete && (
        <section
          data-testid="overall-verdict"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary"
          aria-label="Bestanden-Status"
        >
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${agg.written.passed ? 'bg-pass' : 'bg-fail'}`}
            />
            <span>
              Schriftlich:{' '}
              <span
                className={`font-medium ${
                  agg.written.passed ? 'text-pass' : 'text-fail'
                }`}
              >
                {agg.written.passed ? 'Bestanden' : 'Nicht bestanden'}
              </span>
            </span>
          </span>
          <span aria-hidden="true" className="text-text-tertiary">
            •
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${agg.oral.passed ? 'bg-pass' : 'bg-fail'}`}
            />
            <span>
              Mündlich:{' '}
              <span
                className={`font-medium ${
                  agg.oral.passed ? 'text-pass' : 'text-fail'
                }`}
              >
                {agg.oral.passed ? 'Bestanden' : 'Nicht bestanden'}
              </span>
            </span>
          </span>
        </section>
      )}

      {/* 5. Per-section breakdown */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Abschnitte
        </h2>
        {SECTION_META
          // Only show Sprachbausteine row if the exam actually has it.
          .filter(
            (meta) => meta.key !== 'sprachbausteine' || !!session.sections.sprachbausteine,
          )
          .map((meta) => (
            <SectionScoreRow
              key={meta.key}
              label={meta.label}
              result={session.sections[meta.key]}
              isHumanGraded={meta.key === 'writing' || meta.key === 'speaking'}
            />
          ))}
      </section>

      {/* 6. Recommendations */}
      {recommendations.length > 0 && (
        <section data-testid="recommendations" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
            Empfehlungen
          </h2>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                data-testid={`recommendation-${rec.section}`}
                className="rounded-lg border border-border bg-surface p-4 text-sm text-text-primary"
                lang="de"
              >
                {rec.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          data-testid="restart-btn"
          onClick={handleRestart}
          className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-secondary hover:border-border-hover"
        >
          Prüfung neu starten
        </button>
        <a
          href="/exam"
          className="flex-1 rounded-xl bg-brand-600 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          Alle Übungstests
        </a>
      </div>
    </div>
  );
}

function AggregateCard({
  testId,
  label,
  sectionName,
  pct,
  passed,
  hasData,
}: {
  testId: string;
  label: string;
  sectionName: string;
  pct: number;
  passed: boolean;
  hasData: boolean;
}) {
  const pctValue = Math.round(pct * 100);
  return (
    <div
      data-testid={testId}
      className="rounded-xl border border-border bg-surface p-5"
    >
      <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={`font-sans text-3xl font-semibold ${
            hasData ? (passed ? 'text-pass' : 'text-fail') : 'text-text-disabled'
          }`}
        >
          {hasData ? `${pctValue}%` : '—'}
        </span>
      </div>
      <p className="mt-2 text-xs text-text-secondary" lang="de">
        {hasData
          ? `60% Mindestpunktzahl — Du hast ${pctValue}% erreicht.`
          : 'Noch keine Daten für diesen Teil.'}
      </p>
      {hasData && !passed && (
        <p className="mt-1 text-xs font-medium text-text-primary" lang="de">
          Empfehlung: {sectionName} üben.
        </p>
      )}
    </div>
  );
}
