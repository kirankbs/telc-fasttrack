'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { SECTION_DURATIONS, calculateSectionScore } from '@telc/core';
import type { ReadingSection, ReadingPart, Level } from '@telc/types';
import type { ExamPhase } from '@/lib/examTypes';
import { saveSection } from '@/lib/examSession';
import { ExamTimer } from './ExamTimer';
import { SectionIntro } from './SectionIntro';
import { QuestionResultRow } from './QuestionResultRow';

interface ReadingExamProps {
  mockId: string;
  level: Level;
  section: ReadingSection;
}

export function ReadingExam({ mockId, level, section }: ReadingExamProps) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentPart, setCurrentPart] = useState(0);
  const totalSeconds = SECTION_DURATIONS[level].reading;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleExpire = useCallback(() => setPhase('submitted'), []);

  const score = useMemo(
    () => (phase === 'submitted' ? calculateSectionScore(answers, section) : null),
    [phase, answers, section],
  );

  useEffect(() => {
    if (phase === 'submitted' && score) {
      saveSection(mockId, level, 'reading', {
        answers,
        score,
        submittedAt: new Date().toISOString(),
      });
    }
  }, [phase, score, mockId, level, answers]);

  const allAnswered = useMemo(
    () => section.parts.every((p) => p.questions.every((q) => answers[q.id] !== undefined)),
    [section.parts, answers],
  );

  const part = section.parts[currentPart];
  const totalParts = section.parts.length;
  const totalQuestions = section.parts.reduce((n, p) => n + p.questions.length, 0);

  if (phase === 'intro') {
    return (
      <SectionIntro
        title="Lesen"
        icon="📖"
        totalSeconds={totalSeconds}
        description={`${totalParts} Teile · ${totalQuestions} Aufgaben`}
        extraInfo="Lesen Sie die Texte sorgfältig."
        onStart={() => setPhase('active')}
      />
    );
  }

  if (phase === 'submitted' && score) {
    const pct = Math.round(score.percentage * 100);
    return (
      <div className="space-y-6">
        <div
          className={`rounded-xl border-2 p-6 text-center ${
            score.passed ? 'border-pass bg-pass-light' : 'border-fail bg-fail-light'
          }`}
        >
          <div className={`text-4xl font-bold ${score.passed ? 'text-pass' : 'text-fail'}`}>
            {score.earned}/{score.max}
          </div>
          <div className={`mt-1 text-lg font-medium ${score.passed ? 'text-pass' : 'text-fail'}`}>
            {pct}% — {score.passed ? 'Bestanden' : 'Nicht bestanden'}
          </div>
        </div>

        <div className="space-y-3">
          {section.parts.map((p) =>
            p.questions.map((q, qi) => {
              const userAns = answers[q.id] ?? '';
              const isCorrect = userAns.toLowerCase() === q.correctAnswer.toLowerCase();
              return (
                <QuestionResultRow
                  key={q.id}
                  label={`Teil ${p.partNumber}, Aufgabe ${qi + 1}`}
                  questionText={q.questionText}
                  userAnswer={userAns}
                  correctAnswer={q.correctAnswer}
                  explanation={q.explanation}
                  isCorrect={isCorrect}
                />
              );
            }),
          )}
        </div>

        <div className="flex gap-3">
          <a
            href={`/exam/${mockId}`}
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-secondary hover:border-border-hover"
          >
            Zur Prüfungsübersicht
          </a>
          <a
            data-testid="next-section-link"
            href={`/exam/${mockId}/writing`}
            className="flex-1 rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Weiter: Schreiben
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Lesen</h1>
          <p className="text-sm text-text-secondary">
            Teil {currentPart + 1} von {totalParts}
          </p>
        </div>
        <ExamTimer
          totalSeconds={totalSeconds}
          isRunning={phase === 'active'}
          onExpire={handleExpire}
        />
      </div>

      <div className="flex gap-2">
        {section.parts.map((p, i) => {
          const done = p.questions.every((q) => answers[q.id] !== undefined);
          return (
            <button
              key={p.partNumber}
              data-testid={`part-tab-${p.partNumber}`}
              onClick={() => setCurrentPart(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                i === currentPart
                  ? 'bg-brand-primary text-white'
                  : done
                    ? 'bg-success-light text-success'
                    : 'border border-border bg-white text-text-secondary hover:border-border-hover'
              }`}
            >
              Teil {p.partNumber}
            </button>
          );
        })}
      </div>

      <PartView part={part} answers={answers} onAnswer={handleAnswer} />

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
            Nächster Teil
          </button>
        ) : (
          <button
            data-testid="submit-btn"
            onClick={() => setPhase('submitted')}
            disabled={!allAnswered}
            className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90"
          >
            Abgeben
          </button>
        )}
      </div>
    </div>
  );
}

function PartView({
  part,
  answers,
  onAnswer,
}: {
  part: ReadingPart;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
}) {
  const firstQ = part.questions[0];
  const qType = firstQ?.type ?? 'true_false';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-white p-4">
        <p className="text-sm font-medium text-text-primary">{part.instructions}</p>
        {part.instructionsTranslation && (
          <p className="mt-1 text-xs text-text-secondary">{part.instructionsTranslation}</p>
        )}
      </div>

      {part.texts.filter((t) => t.type !== 'ad').length > 0 && (
        <div className="space-y-3">
          {part.texts
            .filter((t) => t.type !== 'ad')
            .map((text) => (
              <div key={text.id} className="rounded-xl border border-border bg-white p-5">
                {text.source && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-disabled">
                    {text.source}
                  </p>
                )}
                <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary">
                  {text.content}
                </pre>
              </div>
            ))}
        </div>
      )}

      {part.texts.filter((t) => t.type === 'ad').length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {part.texts
            .filter((t) => t.type === 'ad')
            .map((ad, i) => (
              <div key={ad.id} className="rounded-xl border border-border bg-surface-container p-4">
                <span className="mb-2 inline-block rounded bg-brand-primary px-2 py-0.5 text-xs font-bold text-white">
                  {String.fromCharCode(97 + i)}
                </span>
                <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary">
                  {ad.content}
                </pre>
              </div>
            ))}
        </div>
      )}

      <div className="space-y-4">
        {part.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-border bg-white p-5">
            <p className="mb-3 font-medium text-text-primary">
              {qi + 1}. {q.questionText}
            </p>

            {qType === 'true_false' && (
              <div className="flex gap-3">
                {['richtig', 'falsch'].map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <label
                      key={opt}
                      data-testid={`question-option-${q.id}-${opt}`}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-5 py-2.5 transition-colors ${
                        selected
                          ? 'border-brand-primary bg-brand-primary-surface'
                          : 'border-border bg-white hover:border-border-hover'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={selected}
                        onChange={() => onAnswer(q.id, opt)}
                        className="accent-brand-primary"
                      />
                      <span className="text-sm font-medium text-text-primary capitalize">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {qType === 'matching' && q.matchingSources && (
              <div className="flex flex-wrap gap-2">
                {q.matchingSources.map((src) => {
                  const selected = answers[q.id] === src.label;
                  return (
                    <label
                      key={src.id}
                      data-testid={`question-option-${q.id}-${src.label}`}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                        selected
                          ? 'border-brand-primary bg-brand-primary-surface'
                          : 'border-border bg-white hover:border-border-hover'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={src.label}
                        checked={selected}
                        onChange={() => onAnswer(q.id, src.label)}
                        className="accent-brand-primary"
                      />
                      <span className="text-sm font-bold text-text-primary">{src.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {qType === 'mcq' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const value = opt.split(')')[0].trim();
                  const selected = answers[q.id] === value;
                  return (
                    <label
                      key={opt}
                      data-testid={`question-option-${q.id}-${value}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        selected
                          ? 'border-brand-primary bg-brand-primary-surface'
                          : 'border-border bg-white hover:border-border-hover'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={value}
                        checked={selected}
                        onChange={() => onAnswer(q.id, value)}
                        className="accent-brand-primary"
                      />
                      <span className="text-sm text-text-primary">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
