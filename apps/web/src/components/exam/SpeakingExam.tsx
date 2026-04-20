'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { SECTION_DURATIONS } from '@telc/core';
import type { SectionScore } from '@telc/core';
import type { SpeakingSection, Level } from '@telc/types';
import type { ExamPhase } from '@/lib/examTypes';
import { saveSection } from '@/lib/examSession';
import { ExamTimer } from './ExamTimer';
import { SectionIntro } from './SectionIntro';
import { SpeakingRecorder } from './SpeakingRecorder';
import { PrepTimer } from './PrepTimer';

interface SpeakingExamProps {
  mockId: string;
  level: Level;
  section: SpeakingSection;
}

export function SpeakingExam({ mockId, level, section }: SpeakingExamProps) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [currentPart, setCurrentPart] = useState(0);
  const [showSample, setShowSample] = useState<Record<number, boolean>>({});
  const [selfAssessment, setSelfAssessment] = useState<number | null>(null);
  const totalSeconds = SECTION_DURATIONS[level].speaking;

  const speakingMax = useMemo(
    () => section.parts.length * 8,
    [section.parts.length],
  );

  useEffect(() => {
    if (phase === 'submitted') {
      const score: SectionScore = selfAssessment !== null
        ? {
            earned: Math.round((selfAssessment / 100) * speakingMax),
            max: speakingMax,
            percentage: selfAssessment / 100,
            passed: selfAssessment >= 60,
          }
        : { earned: 0, max: speakingMax, percentage: 0, passed: false };

      saveSection(mockId, level, 'speaking', {
        answers: {},
        score,
        submittedAt: new Date().toISOString(),
        selfAssessment: selfAssessment ?? undefined,
      });
    }
  }, [phase, selfAssessment, mockId, level, speakingMax]);

  const handleExpire = useCallback(() => setPhase('submitted'), []);
  const totalParts = section.parts.length;
  const part = section.parts[currentPart];

  const prepInfo =
    section.prepTimeMinutes !== undefined && section.prepTimeMinutes > 0
      ? `Vorbereitungszeit: ${section.prepTimeMinutes} Minuten`
      : undefined;

  if (phase === 'intro') {
    return (
      <SectionIntro
        title="Sprechen"
        icon="🗣️"
        totalSeconds={totalSeconds}
        description={`${totalParts} Aufgaben`}
        extraInfo={
          prepInfo ??
          'Lesen Sie jede Aufgabe. Üben Sie das Sprechen laut. Vergleichen Sie Ihre Antwort mit der Musterlösung.'
        }
        onStart={() => setPhase('active')}
      />
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-white p-6 text-center">
          <div className="text-4xl">🗣️</div>
          <h2 className="mt-3 text-xl font-bold text-text-primary">Sprechen abgeschlossen</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Der Sprechen-Abschnitt wird von einem Prüfer bewertet.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 space-y-3">
          <h3 className="font-semibold text-text-primary">Selbsteinschätzung</h3>
          <p className="text-sm text-text-secondary">
            Wie gut haben Sie Ihrer Meinung nach abgeschnitten? (0-100%)
          </p>
          <div className="flex items-center gap-4">
            <input
              data-testid="self-assessment-slider"
              type="range"
              min={0}
              max={100}
              step={5}
              value={selfAssessment ?? 50}
              onChange={(e) => setSelfAssessment(Number(e.target.value))}
              className="flex-1 accent-brand-primary"
            />
            <span
              data-testid="self-assessment-value"
              className="w-14 text-center text-lg font-bold text-text-primary"
            >
              {selfAssessment !== null ? `${selfAssessment}%` : '—'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {section.parts.map((p) => (
            <div
              key={p.partNumber}
              className="rounded-xl border border-border bg-white p-5 space-y-3"
            >
              <h3 className="font-semibold text-text-primary">
                Aufgabe {p.partNumber}: {p.type}
              </h3>
              <p className="text-sm text-text-primary">{p.instructions}</p>
              {p.sampleResponse && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
                    Musterlösung:
                  </p>
                  <p className="text-sm text-text-secondary italic">{p.sampleResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <a
            href={`/exam/${mockId}`}
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-secondary hover:border-border-hover"
          >
            Zur Prüfungsübersicht
          </a>
          <a
            data-testid="view-results-link"
            href={`/exam/${mockId}/results`}
            className="flex-1 rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Ergebnisse anzeigen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sprechen</h1>
          <p className="text-sm text-text-secondary">
            Aufgabe {currentPart + 1} von {totalParts}
          </p>
        </div>
        <ExamTimer
          totalSeconds={totalSeconds}
          isRunning={phase === 'active'}
          onExpire={handleExpire}
        />
      </div>

      {section.prepTimeMinutes > 0 && (
        <PrepTimer totalSeconds={section.prepTimeMinutes * 60} />
      )}

      <div className="flex gap-2">
        {section.parts.map((p, i) => (
          <button
            key={p.partNumber}
            data-testid={`part-tab-${p.partNumber}`}
            onClick={() => setCurrentPart(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              i === currentPart
                ? 'bg-brand-primary text-white'
                : 'border border-border bg-white text-text-secondary hover:border-border-hover'
            }`}
          >
            Aufgabe {p.partNumber}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-6 space-y-5">
        <div>
          <p className="font-medium text-text-primary">{part.instructions}</p>
          {part.instructionsTranslation && (
            <p className="mt-1 text-sm text-text-secondary">{part.instructionsTranslation}</p>
          )}
        </div>

        {part.prompt && (
          <div className="rounded-lg bg-surface-container p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">
              Vorlage / Hilfe:
            </p>
            <p className="text-sm text-text-primary italic">{part.prompt}</p>
          </div>
        )}

        {part.keyPhrases && part.keyPhrases.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
              Nützliche Ausdrücke:
            </p>
            <div className="flex flex-wrap gap-2">
              {part.keyPhrases.map((phrase) => (
                <span
                  key={phrase}
                  className="rounded-full border border-border bg-surface-container px-3 py-1 text-xs text-text-primary"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}

        {part.evaluationTips && part.evaluationTips.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
              Tipps:
            </p>
            <ul className="space-y-1">
              {part.evaluationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-0.5 text-brand-primary">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
            Ihre Aufnahme:
          </p>
          <SpeakingRecorder
            key={`recorder-part-${part.partNumber}`}
            label={`Aufgabe ${part.partNumber}`}
          />
          <p className="mt-2 text-xs text-text-secondary">
            Tipp: Nehmen Sie Ihre Antwort auf, hören Sie sie ab und vergleichen Sie sie mit
            der Musterlösung. Aufnahmen werden nicht gespeichert.
          </p>
        </div>

        {part.sampleResponse && (
          <div>
            <button
              data-testid="sample-answer-toggle"
              onClick={() =>
                setShowSample((prev) => ({
                  ...prev,
                  [part.partNumber]: !prev[part.partNumber],
                }))
              }
              className="text-sm font-medium text-brand-primary hover:opacity-80"
            >
              {showSample[part.partNumber] ? 'Musterlösung ausblenden' : 'Musterlösung anzeigen'}
            </button>
            {showSample[part.partNumber] && (
              <div className="mt-3 rounded-lg border border-success bg-success-light p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-success mb-1">
                  Musterlösung:
                </p>
                <p className="text-sm text-text-primary">{part.sampleResponse}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          data-testid="section-nav-prev"
          onClick={() => setCurrentPart((p) => Math.max(0, p - 1))}
          disabled={currentPart === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary disabled:opacity-40 hover:border-border-hover"
        >
          Zurück
        </button>
        {currentPart < totalParts - 1 ? (
          <button
            data-testid="section-nav-next"
            onClick={() => setCurrentPart((p) => p + 1)}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nächste Aufgabe
          </button>
        ) : (
          <button
            data-testid="submit-btn"
            onClick={() => setPhase('submitted')}
            className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Abschnitt abschließen
          </button>
        )}
      </div>
    </div>
  );
}
