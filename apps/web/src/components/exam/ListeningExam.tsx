'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { SECTION_DURATIONS, calculateSectionScore } from '@telc/core';
import type { ListeningSection, Level } from '@telc/types';
import type { ExamPhase } from '@/lib/examTypes';
import { saveSection } from '@/lib/examSession';
import { ExamTimer } from './ExamTimer';
import { SectionIntro } from './SectionIntro';
import { QuestionResultRow } from './QuestionResultRow';
import { AudioPlayer } from './AudioPlayer';

interface ListeningExamProps {
  mockId: string;
  level: Level;
  mockNumber: number;
  section: ListeningSection;
}

export function ListeningExam({ mockId, level, section }: ListeningExamProps) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentPart, setCurrentPart] = useState(0);
  const totalSeconds = SECTION_DURATIONS[level].listening;

  const handleStart = () => setPhase('active');
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  const handleSubmit = () => setPhase('submitted');
  const handleExpire = useCallback(() => setPhase('submitted'), []);

  const score = useMemo(
    () => (phase === 'submitted' ? calculateSectionScore(answers, section) : null),
    [phase, answers, section],
  );

  useEffect(() => {
    if (phase === 'submitted' && score) {
      saveSection(mockId, level, 'listening', {
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
        title="Hören"
        icon="🎧"
        totalSeconds={totalSeconds}
        description={`${totalParts} Teile · ${totalQuestions} Aufgaben`}
        onStart={handleStart}
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
          <div className="mt-1 text-sm text-text-secondary">
            Mindestens 60% für das Bestehen erforderlich
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

        <div className="flex gap-3 pt-2">
          <a
            href={`/exam?level=${level}`}
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-secondary hover:border-border-hover"
          >
            Zurück zur Übersicht
          </a>
          <a
            data-testid="next-section-link"
            href={`/exam/${mockId}/reading`}
            className="flex-1 rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            Weiter: Lesen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Hören</h1>
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
          const partDone = p.questions.every((q) => answers[q.id] !== undefined);
          return (
            <button
              key={p.partNumber}
              data-testid={`part-tab-${p.partNumber}`}
              onClick={() => setCurrentPart(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                i === currentPart
                  ? 'bg-brand-primary text-white'
                  : partDone
                    ? 'bg-success-light text-success'
                    : 'border border-border bg-white text-text-secondary hover:border-border-hover'
              }`}
            >
              Teil {p.partNumber}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <p className="text-sm font-medium text-text-primary">{part.instructions}</p>
        {part.instructionsTranslation && (
          <p className="mt-1 text-xs text-text-secondary">{part.instructionsTranslation}</p>
        )}
      </div>

      <AudioPlayer
        key={`audio-part-${part.partNumber}`}
        audioFile={part.audioFile}
        playCount={part.playCount}
        transcript={
          part.audioTranscript ??
          [part.instructions, ...part.questions.map((q) => q.questionText)].join('. ')
        }
      />

      <div className="space-y-4">
        {part.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-border bg-white p-5">
            <p className="mb-3 font-medium text-text-primary">
              {qi + 1}. {q.questionText}
            </p>

            {q.type === 'true_false' && (
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
                        onChange={() => handleAnswer(q.id, opt)}
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

            {q.type === 'mcq' && (
              <div className="space-y-2">
                {(q.options ?? []).map((opt) => {
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
                        onChange={() => handleAnswer(q.id, value)}
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
            onClick={handleSubmit}
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
