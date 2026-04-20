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
  { key: 'listening' as const, label: 'Hören', icon: '🎧', aggregate: 'written' as const },
  { key: 'reading' as const, label: 'Lesen', icon: '📖', aggregate: 'written' as const },
  {
    key: 'sprachbausteine' as const,
    label: 'Sprachbausteine',
    icon: '🧩',
    aggregate: 'written' as const,
  },
  { key: 'writing' as const, label: 'Schreiben', icon: '✍️', aggregate: 'written' as const },
  { key: 'speaking' as const, label: 'Sprechen', icon: '🗣️', aggregate: 'oral' as const },
] as const;

function SectionScoreCard({
  label,
  icon,
  result,
  isHumanGraded,
}: {
  label: string;
  icon: string;
  result: SectionResult | undefined;
  isHumanGraded: boolean;
}) {
  if (!result) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-text-primary">{label}</span>
        </div>
        <span
          data-testid={`section-status-${label.toLowerCase()}`}
          className="text-sm font-medium text-text-disabled"
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
      className={`rounded-xl border-2 p-5 ${
        result.score.passed ? 'border-pass bg-pass-light' : 'border-fail bg-fail-light'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-text-primary">{label}</span>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${result.score.passed ? 'text-pass' : 'text-fail'}`}>
            {result.score.earned}/{result.score.max}
          </div>
          <div className={`text-sm ${result.score.passed ? 'text-pass' : 'text-fail'}`}>
            {pct}%
          </div>
        </div>
      </div>
      {isHumanGraded && !hasAssessment && (
        <p className="mt-2 text-xs text-text-secondary italic">
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

  const isComplete = !!(sections.listening && sections.reading && sections.writing && sections.speaking);

  return {
    written: { earned: writtenEarned, max: writtenMax, pct: writtenPct, passed: writtenPassed },
    oral: { earned: oralEarned, max: oralMax, pct: oralPct, passed: oralPassed },
    total: { earned: totalEarned, max: totalMax, pct: totalPct },
    passed,
    isComplete,
  };
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
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <div className="text-4xl">📋</div>
          <h2 className="mt-3 text-xl font-bold text-text-primary">
            Keine Prüfungsdaten vorhanden
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Starten Sie zuerst eine Prüfung, um Ergebnisse zu sehen.
          </p>
          <a
            href={`/exam/${mockId}`}
            className="mt-4 inline-block rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Zur Prüfungsübersicht
          </a>
        </div>
      </div>
    );
  }

  const agg = computeAggregates(session);

  const handleRestart = () => {
    clearSession(mockId);
    router.push(`/exam/${mockId}`);
  };

  return (
    <div data-testid="results-page" className="mx-auto max-w-3xl space-y-6">
      <a
        href={`/exam/${mockId}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-brand-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Zurück zur Prüfung
      </a>

      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <h1 className="text-xl font-bold text-text-primary">
          Übungstest {mockNumber} — Ergebnisse
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{level} Prüfungsergebnis</p>
      </div>

      {/* Overall verdict */}
      <div
        data-testid="overall-verdict"
        className={`rounded-xl border-2 p-6 text-center ${
          agg.isComplete
            ? agg.passed
              ? 'border-pass bg-pass-light'
              : 'border-fail bg-fail-light'
            : 'border-warning bg-warning-light'
        }`}
      >
        <div
          className={`text-3xl font-bold ${
            agg.isComplete
              ? agg.passed
                ? 'text-pass'
                : 'text-fail'
              : 'text-warning'
          }`}
        >
          {agg.total.earned}/{agg.total.max}
        </div>
        <div
          className={`mt-1 text-lg font-medium ${
            agg.isComplete
              ? agg.passed
                ? 'text-pass'
                : 'text-fail'
              : 'text-warning'
          }`}
        >
          {Math.round(agg.total.pct * 100)}% —{' '}
          {agg.isComplete
            ? agg.passed
              ? 'Bestanden'
              : 'Nicht bestanden'
            : 'Unvollständig'}
        </div>
        {!agg.isComplete && (
          <p className="mt-1 text-sm text-text-secondary">
            Einige Abschnitte wurden noch nicht bearbeitet.
          </p>
        )}
      </div>

      {/* Written / Oral aggregates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          data-testid="written-aggregate"
          className={`rounded-xl border p-4 text-center ${
            agg.written.passed ? 'border-pass' : 'border-fail'
          }`}
        >
          <div className="text-sm font-medium text-text-secondary">Schriftlich</div>
          <div className={`text-2xl font-bold ${agg.written.passed ? 'text-pass' : 'text-fail'}`}>
            {agg.written.earned}/{agg.written.max}
          </div>
          <div className={`text-sm ${agg.written.passed ? 'text-pass' : 'text-fail'}`}>
            {Math.round(agg.written.pct * 100)}% — {agg.written.passed ? 'Bestanden' : 'Nicht bestanden'}
          </div>
        </div>
        <div
          data-testid="oral-aggregate"
          className={`rounded-xl border p-4 text-center ${
            agg.oral.passed ? 'border-pass' : 'border-fail'
          }`}
        >
          <div className="text-sm font-medium text-text-secondary">Mündlich</div>
          <div className={`text-2xl font-bold ${agg.oral.passed ? 'text-pass' : 'text-fail'}`}>
            {agg.oral.earned}/{agg.oral.max}
          </div>
          <div className={`text-sm ${agg.oral.passed ? 'text-pass' : 'text-fail'}`}>
            {Math.round(agg.oral.pct * 100)}% — {agg.oral.passed ? 'Bestanden' : 'Nicht bestanden'}
          </div>
        </div>
      </div>

      {/* Per-section scores */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">Abschnitte</h2>
        {SECTION_META
          // Only show Sprachbausteine row if the exam actually has it (i.e. session
          // already recorded a result). A1/A2/C1 don't have this section.
          .filter(
            (meta) => meta.key !== 'sprachbausteine' || !!session.sections.sprachbausteine,
          )
          .map((meta) => (
            <SectionScoreCard
              key={meta.key}
              label={meta.label}
              icon={meta.icon}
              result={session.sections[meta.key]}
              isHumanGraded={meta.key === 'writing' || meta.key === 'speaking'}
            />
          ))}
      </div>

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
          className="flex-1 rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Alle Übungstests
        </a>
      </div>
    </div>
  );
}
