'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { SECTION_DURATIONS } from '@fastrack/core';
import type { SectionScore } from '@fastrack/core';
import type { WritingSection, Level } from '@fastrack/types';
import type { ExamPhase } from '@/lib/examTypes';
import { saveSection } from '@/lib/examSession';
import { ExamRunnerHeader } from './ExamRunnerHeader';
import { SectionIntro } from './SectionIntro';
import { ExamSubmitButton } from './ExamSubmitButton';

interface WritingExamProps {
  mockId: string;
  level: Level;
  section: WritingSection;
}

export function WritingExam({ mockId, level, section }: WritingExamProps) {
  const [phase, setPhase] = useState<ExamPhase>('intro');
  // taskNumber → freetext or per-field answers
  const [taskAnswers, setTaskAnswers] = useState<Record<number, Record<string, string>>>({});
  const totalSeconds = SECTION_DURATIONS[level].writing;

  const [selfAssessment, setSelfAssessment] = useState<number | null>(null);
  const handleExpire = useCallback(() => setPhase('submitted'), []);

  const writingMax = useMemo(
    () => section.tasks.reduce((sum, t) => sum + t.scoringCriteria.reduce((s, c) => s + c.maxPoints, 0), 0),
    [section.tasks],
  );

  useEffect(() => {
    if (phase === 'submitted') {
      const score: SectionScore = selfAssessment !== null
        ? {
            earned: Math.round((selfAssessment / 100) * writingMax),
            max: writingMax,
            percentage: selfAssessment / 100,
            passed: selfAssessment >= 60,
          }
        : { earned: 0, max: writingMax, percentage: 0, passed: false };

      saveSection(mockId, level, 'writing', {
        answers: {},
        taskAnswers,
        score,
        submittedAt: new Date().toISOString(),
        selfAssessment: selfAssessment ?? undefined,
      });
    }
  }, [phase, selfAssessment, taskAnswers, mockId, level, writingMax]);

  const setFieldAnswer = (taskNum: number, field: string, value: string) => {
    setTaskAnswers((prev) => ({
      ...prev,
      [taskNum]: { ...(prev[taskNum] ?? {}), [field]: value },
    }));
  };

  if (phase === 'intro') {
    return (
      <SectionIntro
        title="Schreiben"
        Icon={Pencil}
        totalSeconds={totalSeconds}
        description={`${section.tasks.length} Aufgabe${section.tasks.length !== 1 ? 'n' : ''}`}
        extraInfo="Schreiben Sie vollständige, korrekte Antworten."
        onStart={() => setPhase('active')}
      />
    );
  }

  if (phase === 'submitted') {
    return (
      <WritingResults
        section={section}
        taskAnswers={taskAnswers}
        backHref={`/exam/${mockId}`}
        nextHref={`/exam/${mockId}/speaking`}
        selfAssessment={selfAssessment}
        onSelfAssessment={setSelfAssessment}
      />
    );
  }

  const totalTasks = section.tasks.length;
  const tasksTouched = Object.keys(taskAnswers).length;
  const progress = totalTasks > 0 ? tasksTouched / totalTasks : 0;

  return (
    <div>
      <ExamRunnerHeader
        sectionName="Schreiben"
        totalSeconds={totalSeconds}
        isRunning={phase === 'active'}
        onExpire={handleExpire}
        exitHref={`/exam/${mockId}`}
        level={level}
        progress={progress}
      />

      <div className="space-y-6">
        {section.tasks.map((task) => {
          const fields = taskAnswers[task.taskNumber] ?? {};

          return (
            <TaskCard
              key={task.taskNumber}
              task={task}
              fields={fields}
              onFieldChange={(field, value) => setFieldAnswer(task.taskNumber, field, value)}
            />
          );
        })}

        <ExamSubmitButton
          onClick={() => setPhase('submitted')}
          label="Aufgaben abgeben"
        />
      </div>
    </div>
  );
}

function TaskCard({
  task,
  fields,
  onFieldChange,
}: {
  task: WritingSection['tasks'][number];
  fields: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}) {
  // useMemo so word count doesn't recalculate on unrelated renders
  const wordCount = useMemo(
    () => (fields['_freetext'] ?? '').split(/\s+/).filter(Boolean).length,
    [fields['_freetext']],
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">
        Aufgabe {task.taskNumber}
      </h2>

      <div className="rounded-lg border border-border bg-white p-5">
        <p className="whitespace-pre-line text-sm text-text-primary">{task.instructions}</p>
        {task.instructionsTranslation && (
          <p className="mt-2 whitespace-pre-line text-xs text-text-secondary">
            {task.instructionsTranslation}
          </p>
        )}
      </div>

      {task.type === 'form_fill' && task.formFields && (
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="mb-4 text-sm font-medium text-text-secondary">Formular ausfüllen:</p>
          <div className="space-y-3">
            {task.formFields.map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={fields[field.label] ?? ''}
                  onChange={(e) => onFieldChange(field.label, e.target.value)}
                  placeholder={field.hint ?? ''}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {(task.type === 'short_message' || task.type === 'letter' || task.type === 'essay') && (
        <div className="rounded-xl border border-border bg-white p-5">
          <textarea
            value={fields['_freetext'] ?? ''}
            onChange={(e) => onFieldChange('_freetext', e.target.value)}
            rows={8}
            placeholder="Schreiben Sie Ihre Antwort hier..."
            className="w-full resize-y rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
          <p className="mt-2 text-right text-xs text-text-disabled">{wordCount} Wörter</p>
        </div>
      )}

      {task.sampleAnswer && (
        <details className="rounded-lg border border-border bg-surface-container">
          <summary
            data-testid="sample-answer-toggle"
            className="cursor-pointer px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Musterlösung anzeigen
          </summary>
          <div className="border-t border-border px-4 py-3">
            <pre className="whitespace-pre-wrap font-sans text-sm text-text-secondary">
              {task.sampleAnswer}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

function WritingResults({
  section,
  taskAnswers,
  backHref,
  nextHref,
  selfAssessment,
  onSelfAssessment,
}: {
  section: WritingSection;
  taskAnswers: Record<number, Record<string, string>>;
  backHref: string;
  nextHref: string;
  selfAssessment: number | null;
  onSelfAssessment: (value: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <div className="text-4xl">✍️</div>
        <h2 className="mt-3 text-xl font-bold text-text-primary">Schreiben eingereicht</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Schreibaufgaben werden von einem Prüfer bewertet. Vergleichen Sie Ihre Antworten mit
          den Musterlösungen unten.
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
            onChange={(e) => onSelfAssessment(Number(e.target.value))}
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

      {section.tasks.map((task) => {
        const fields = taskAnswers[task.taskNumber] ?? {};
        return (
          <div
            key={task.taskNumber}
            className="rounded-xl border border-border bg-white p-5 space-y-4"
          >
            <h3 className="font-semibold text-text-primary">Aufgabe {task.taskNumber}</h3>

            {task.type === 'form_fill' && task.formFields ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Ihre Antworten:
                </p>
                {task.formFields.map((field) => (
                  <div key={field.label} className="flex gap-3 text-sm">
                    <span className="w-32 shrink-0 font-medium text-text-secondary">
                      {field.label}:
                    </span>
                    <span className="text-text-primary">{fields[field.label] || '—'}</span>
                    <span
                      className={`ml-auto text-xs font-medium ${
                        (fields[field.label] ?? '').trim().toLowerCase() ===
                        field.correctAnswer.toLowerCase()
                          ? 'text-success'
                          : 'text-error'
                      }`}
                    >
                      {(fields[field.label] ?? '').trim().toLowerCase() ===
                      field.correctAnswer.toLowerCase()
                        ? '✓'
                        : `✗ → ${field.correctAnswer}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Ihre Antwort:
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-surface-container p-3 font-sans text-sm text-text-primary">
                  {fields['_freetext'] || '(keine Antwort)'}
                </pre>
              </div>
            )}

            {task.sampleAnswer && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Musterlösung:
                </p>
                <pre className="whitespace-pre-wrap rounded-lg border border-success bg-success-light p-3 font-sans text-sm text-text-primary">
                  {task.sampleAnswer}
                </pre>
              </div>
            )}

            {task.scoringCriteria && task.scoringCriteria.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Bewertungskriterien:
                </p>
                {task.scoringCriteria.map((c) => (
                  <div key={c.criterion} className="flex justify-between text-xs text-text-secondary">
                    <span>{c.criterion}</span>
                    <span className="font-medium">max. {c.maxPoints} Pkt.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex gap-3">
        <a
          href={backHref}
          className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-secondary hover:border-border-hover"
        >
          Zur Prüfungsübersicht
        </a>
        <a
          data-testid="next-section-link"
          href={nextHref}
          className="flex-1 rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white hover:opacity-90"
        >
          Weiter: Sprechen
        </a>
      </div>
    </div>
  );
}
