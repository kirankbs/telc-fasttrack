'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { SECTION_DURATIONS, scoreSprachbausteine } from '@telc/core';
import type {
  SprachbausteineSection,
  SprachbausteinePart,
  SprachbausteineQuestion,
  Level,
} from '@telc/types';
import type { ExamPhase } from '@/lib/examTypes';
import { saveSection } from '@/lib/examSession';
import { ExamTimer } from './ExamTimer';
import { SectionIntro } from './SectionIntro';

interface SprachbausteineExamProps {
  mockId: string;
  level: Level;
  section: SprachbausteineSection;
}

// SECTION_DURATIONS is `as const` and only B1/B2 declare sprachbausteine.
// Fall back to 15 min for any level that does not define it explicitly.
function getTotalSeconds(level: Level): number {
  const durations = SECTION_DURATIONS[level] as { sprachbausteine?: number };
  return durations.sprachbausteine ?? 15 * 60;
}

export function answerKey(partNumber: number, blankNumber: number): string {
  return `sprachbausteine_${partNumber}_${blankNumber}`;
}

/**
 * Splits a text like "Liebe Sabine, __(1)__ Arbeit __(2)__." into ordered
 * segments: text chunks alternating with blank markers. Blank markers retain
 * their blankNumber so we can render the right dropdown inline.
 */
export type TextSegment =
  | { kind: 'text'; content: string }
  | { kind: 'blank'; blankNumber: number };

export function parseTextSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const re = /__\((\d+)\)__/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: 'blank', blankNumber: parseInt(match[1], 10) });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ kind: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

export function SprachbausteineExam({ mockId, level, section }: SprachbausteineExamProps) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentPart, setCurrentPart] = useState(0);
  const totalSeconds = getTotalSeconds(level);

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleExpire = useCallback(() => setPhase('submitted'), []);

  const score = useMemo(
    () => (phase === 'submitted' ? scoreSprachbausteine(answers, section) : null),
    [phase, answers, section],
  );

  // Per-part breakdown for the results screen.
  const partScores = useMemo(() => {
    return section.parts.map((p) => {
      let earned = 0;
      const total = p.questions.length;
      for (const q of p.questions) {
        const key = answerKey(p.partNumber, q.blankNumber);
        const answer = answers[key];
        if (
          answer !== undefined &&
          answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        ) {
          earned += 1;
        }
      }
      return { partNumber: p.partNumber, earned, max: total };
    });
  }, [section.parts, answers]);

  useEffect(() => {
    if (phase === 'submitted' && score) {
      saveSection(mockId, level, 'sprachbausteine', {
        answers,
        score,
        submittedAt: new Date().toISOString(),
      });
    }
  }, [phase, score, mockId, level, answers]);

  const allAnswered = useMemo(
    () =>
      section.parts.every((p) =>
        p.questions.every(
          (q) => answers[answerKey(p.partNumber, q.blankNumber)] !== undefined,
        ),
      ),
    [section.parts, answers],
  );

  const part = section.parts[currentPart];
  const totalParts = section.parts.length;
  const totalQuestions = section.parts.reduce((n, p) => n + p.questions.length, 0);

  if (phase === 'intro') {
    return (
      <SectionIntro
        title="Sprachbausteine"
        icon="🧩"
        totalSeconds={totalSeconds}
        description={`${totalParts} Teile · ${totalQuestions} Lücken`}
        extraInfo="Wählen Sie für jede Lücke die passende Antwort."
        onStart={() => setPhase('active')}
      />
    );
  }

  if (phase === 'submitted' && score) {
    return (
      <ResultsView
        mockId={mockId}
        section={section}
        answers={answers}
        score={score}
        partScores={partScores}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sprachbausteine</h1>
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
          const done = p.questions.every(
            (q) => answers[answerKey(p.partNumber, q.blankNumber)] !== undefined,
          );
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
  part: SprachbausteinePart;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
}) {
  const questionByBlank = useMemo(() => {
    const map = new Map<number, SprachbausteineQuestion>();
    for (const q of part.questions) map.set(q.blankNumber, q);
    return map;
  }, [part.questions]);

  const segments = useMemo(() => parseTextSegments(part.text), [part.text]);
  const answeredCount = part.questions.filter(
    (q) => answers[answerKey(part.partNumber, q.blankNumber)] !== undefined,
  ).length;

  // For word_bank Teil 2: track which options have been used across all gaps
  // in this part so dropdowns can grey them out. The currently selected value
  // in any gap is still shown as active in its own dropdown.
  const usedValues = useMemo(() => {
    const used = new Set<string>();
    for (const q of part.questions) {
      if (q.type !== 'word_bank') continue;
      const v = answers[answerKey(part.partNumber, q.blankNumber)];
      if (v !== undefined) used.add(v);
    }
    return used;
  }, [part.questions, part.partNumber, answers]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-white p-4">
        <p className="text-sm font-medium text-text-primary">{part.instructions}</p>
        <p className="mt-2 text-xs text-text-secondary">
          {answeredCount}/{part.questions.length} Lücken ausgefüllt
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="whitespace-pre-wrap font-sans text-[15px] leading-8 text-text-primary">
          {segments.map((seg, idx) => {
            if (seg.kind === 'text') {
              return <span key={`t-${idx}`}>{seg.content}</span>;
            }
            const q = questionByBlank.get(seg.blankNumber);
            if (!q) {
              return (
                <span key={`b-${idx}`} className="font-mono text-text-disabled">
                  __({seg.blankNumber})__
                </span>
              );
            }
            const key = answerKey(part.partNumber, q.blankNumber);
            const selected = answers[key] ?? '';
            return (
              <GapDropdown
                key={`b-${idx}`}
                partNumber={part.partNumber}
                question={q}
                selected={selected}
                usedValues={q.type === 'word_bank' ? usedValues : undefined}
                onChange={(value) => onAnswer(key, value)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function optionValue(option: string): string {
  // Options are formatted as "a) Dank" - value is "a". Falls back to trimmed option.
  const sep = option.indexOf(')');
  return sep > 0 ? option.slice(0, sep).trim() : option.trim();
}

function GapDropdown({
  partNumber,
  question,
  selected,
  usedValues,
  onChange,
}: {
  partNumber: number;
  question: SprachbausteineQuestion;
  selected: string;
  usedValues?: Set<string>;
  onChange: (value: string) => void;
}) {
  const gapLabel = `Lücke ${question.blankNumber}`;
  const testId = `gap-${partNumber}-${question.blankNumber}`;
  const isAnswered = selected !== '';

  return (
    <span className="relative inline-block align-baseline">
      <span className="sr-only">{gapLabel}: </span>
      <select
        data-testid={testId}
        aria-label={gapLabel}
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className={`mx-1 rounded-md border px-2 py-0.5 text-sm font-medium transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary ${
          isAnswered
            ? 'border-brand-primary bg-brand-primary-surface text-text-primary'
            : 'border-border bg-surface-container text-text-secondary hover:border-border-hover'
        }`}
      >
        <option value="">{`(${question.blankNumber}) …`}</option>
        {question.options.map((opt) => {
          const value = optionValue(opt);
          const isUsedElsewhere =
            usedValues !== undefined && value !== selected && usedValues.has(value);
          return (
            <option key={opt} value={value} disabled={isUsedElsewhere}>
              {opt}
              {isUsedElsewhere ? ' (bereits verwendet)' : ''}
            </option>
          );
        })}
      </select>
    </span>
  );
}

function ResultsView({
  mockId,
  section,
  answers,
  score,
  partScores,
}: {
  mockId: string;
  section: SprachbausteineSection;
  answers: Record<string, string>;
  score: { earned: number; max: number; percentage: number; passed: boolean };
  partScores: { partNumber: number; earned: number; max: number }[];
}) {
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

      <div className="grid gap-3 sm:grid-cols-2">
        {partScores.map((ps) => {
          const partPct = ps.max > 0 ? Math.round((ps.earned / ps.max) * 100) : 0;
          const partPassed = partPct >= 60;
          return (
            <div
              key={ps.partNumber}
              data-testid={`part-score-${ps.partNumber}`}
              className={`rounded-xl border p-4 text-center ${
                partPassed ? 'border-pass' : 'border-fail'
              }`}
            >
              <div className="text-sm font-medium text-text-secondary">Teil {ps.partNumber}</div>
              <div className={`text-2xl font-bold ${partPassed ? 'text-pass' : 'text-fail'}`}>
                {ps.earned}/{ps.max}
              </div>
              <div className={`text-sm ${partPassed ? 'text-pass' : 'text-fail'}`}>{partPct}%</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {section.parts.map((p) => (
          <ReviewPart key={p.partNumber} part={p} answers={answers} />
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

function ReviewPart({
  part,
  answers,
}: {
  part: SprachbausteinePart;
  answers: Record<string, string>;
}) {
  const questionByBlank = useMemo(() => {
    const map = new Map<number, SprachbausteineQuestion>();
    for (const q of part.questions) map.set(q.blankNumber, q);
    return map;
  }, [part.questions]);

  const segments = useMemo(() => parseTextSegments(part.text), [part.text]);

  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-4">
      <h3 className="font-semibold text-text-primary">Teil {part.partNumber}</h3>
      <div className="whitespace-pre-wrap font-sans text-[15px] leading-8 text-text-primary">
        {segments.map((seg, idx) => {
          if (seg.kind === 'text') {
            return <span key={`rt-${idx}`}>{seg.content}</span>;
          }
          const q = questionByBlank.get(seg.blankNumber);
          if (!q) return null;
          const userAnswer = answers[answerKey(part.partNumber, q.blankNumber)] ?? '';
          const isCorrect =
            userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          const displayUser = userAnswer || '—';
          return (
            <span
              key={`b-${idx}`}
              data-testid={`review-gap-${part.partNumber}-${q.blankNumber}`}
              className={`mx-1 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium ${
                isCorrect
                  ? 'border-success bg-success-light text-success'
                  : 'border-error bg-error-light text-error'
              }`}
            >
              <span className="font-mono text-xs text-text-disabled">({q.blankNumber})</span>
              <span>{isCorrect ? displayUser : `${displayUser} → ${q.correctAnswer}`}</span>
              <span aria-hidden>{isCorrect ? '✓' : '✗'}</span>
            </span>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        {part.questions.map((q) => {
          const userAnswer = answers[answerKey(part.partNumber, q.blankNumber)] ?? '';
          const isCorrect =
            userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          return (
            <details
              key={q.blankNumber}
              data-testid={`review-explanation-${part.partNumber}-${q.blankNumber}`}
              className={`rounded-lg border p-3 ${
                isCorrect ? 'border-success' : 'border-error'
              }`}
            >
              <summary className="cursor-pointer text-sm font-medium text-text-primary">
                Lücke {q.blankNumber}:{' '}
                <span className={isCorrect ? 'text-success' : 'text-error'}>
                  {userAnswer || '—'}
                </span>
                {!isCorrect && <span className="ml-1 text-success">→ {q.correctAnswer}</span>}
              </summary>
              <p className="mt-2 text-xs text-text-secondary">{q.explanation}</p>
            </details>
          );
        })}
      </div>
    </div>
  );
}
