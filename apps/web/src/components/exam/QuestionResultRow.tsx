import { Check, X } from 'lucide-react';

interface QuestionResultRowProps {
  label: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  isCorrect: boolean;
}

export function QuestionResultRow({
  label,
  questionText,
  userAnswer,
  correctAnswer,
  explanation,
  isCorrect,
}: QuestionResultRowProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        isCorrect
          ? 'border-pass bg-pass-surface'
          : 'border-fail bg-fail-surface'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            isCorrect ? 'text-pass' : 'text-fail'
          }`}
        >
          {isCorrect ? (
            <Check size={16} strokeWidth={2.5} />
          ) : (
            <X size={16} strokeWidth={2.5} />
          )}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">
            {label}: {questionText}
          </p>
          <div className="mt-2 text-xs text-text-secondary">
            <span>
              Ihre Antwort:{' '}
              <span
                className={
                  isCorrect ? 'font-medium text-pass' : 'font-medium text-fail'
                }
              >
                {userAnswer || '—'}
              </span>
            </span>
            {!isCorrect && (
              <span className="ml-3">
                Richtig:{' '}
                <span className="font-medium text-pass">{correctAnswer}</span>
              </span>
            )}
          </div>
          {!isCorrect && explanation && (
            <p className="mt-2 text-xs text-text-secondary">{explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}
