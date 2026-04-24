'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { SECTION_DURATIONS, calculateSectionScore } from '@fastrack/core';
import type { ReadingSection, ReadingPart, Level } from '@fastrack/types';
import type { ExamPhase } from '@/lib/examTypes';
import { saveSection } from '@/lib/examSession';
import { ExamRunnerHeader } from './ExamRunnerHeader';
import { SectionIntro } from './SectionIntro';
import { QuestionResultRow } from './QuestionResultRow';
import { AnswerOption } from './AnswerOption';
import { ExamSubmitButton } from './ExamSubmitButton';

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

  const totalQuestions = section.parts.reduce((n, p) => n + p.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? answeredCount / totalQuestions : 0;

  const part = section.parts[currentPart];
  const totalParts = section.parts.length;

  if (phase === 'intro') {
    return (
      <SectionIntro
        title="Lesen"
        Icon={FileText}
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
            score.passed ? 'border-pass bg-pass-surface' : 'border-fail bg-fail-surface'
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
            href={
              level === 'B1' || level === 'B2'
                ? `/exam/${mockId}/sprachbausteine`
                : `/exam/${mockId}/writing`
            }
            className="flex-1 rounded-xl bg-brand-600 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
          >
            {level === 'B1' || level === 'B2' ? 'Weiter: Sprachbausteine' : 'Weiter: Schreiben'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ExamRunnerHeader
        sectionName="Lesen"
        partLabel={`Teil ${currentPart + 1}`}
        totalSeconds={totalSeconds}
        isRunning={phase === 'active'}
        onExpire={handleExpire}
        exitHref={`/exam/${mockId}`}
        level={level}
        progress={progress}
      />

      <div className="space-y-6">
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
                    ? 'bg-brand-600 text-white'
                    : done
                      ? 'bg-pass-surface text-pass'
                      : 'border border-border bg-surface text-text-secondary hover:border-border-hover'
                }`}
              >
                Teil {p.partNumber}
              </button>
            );
          })}
        </div>

        <PartView part={part} answers={answers} onAnswer={handleAnswer} />

        <div className="flex items-center justify-between gap-3 pt-2">
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
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Nächster Teil
            </button>
          ) : (
            <div className="flex-1 pl-3">
              <ExamSubmitButton
                disabled={!allAnswered}
                onClick={() => setPhase('submitted')}
                label="Antworten abgeben"
              />
            </div>
          )}
        </div>
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
      <div className="rounded-lg border border-border bg-surface p-4">
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
              <div key={text.id} className="rounded-xl border border-border bg-surface p-5">
                {text.source && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
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
                <span className="mb-2 inline-block rounded bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
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
          <div key={q.id} className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 font-medium text-text-primary">
              {qi + 1}. {q.questionText}
            </p>

            {qType === 'true_false' && (
              <div className="space-y-2">
                {['richtig', 'falsch'].map((opt) => (
                  <AnswerOption
                    key={opt}
                    name={q.id}
                    value={opt}
                    selected={answers[q.id] === opt}
                    onChange={(v) => onAnswer(q.id, v)}
                    testId={`question-option-${q.id}-${opt}`}
                  >
                    <span className="capitalize">{opt}</span>
                  </AnswerOption>
                ))}
              </div>
            )}

            {qType === 'matching' && q.matchingSources && (
              <div className="space-y-2">
                {q.matchingSources.map((src) => (
                  <AnswerOption
                    key={src.id}
                    name={q.id}
                    value={src.label}
                    selected={answers[q.id] === src.label}
                    onChange={(v) => onAnswer(q.id, v)}
                    testId={`question-option-${q.id}-${src.label}`}
                  >
                    <span className="font-bold">{src.label}</span>
                  </AnswerOption>
                ))}
              </div>
            )}

            {qType === 'mcq' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const value = opt.split(')')[0].trim();
                  return (
                    <AnswerOption
                      key={opt}
                      name={q.id}
                      value={value}
                      selected={answers[q.id] === value}
                      onChange={(v) => onAnswer(q.id, v)}
                      testId={`question-option-${q.id}-${value}`}
                    >
                      {opt}
                    </AnswerOption>
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
