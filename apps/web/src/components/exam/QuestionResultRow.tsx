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
        isCorrect ? 'border-success bg-success-light' : 'border-error bg-error-light'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">{isCorrect ? '✓' : '✗'}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">
            {label}: {questionText}
          </p>
          <div className="mt-2 text-xs text-text-secondary">
            <span>
              Ihre Antwort:{' '}
              <span className={isCorrect ? 'font-medium text-success' : 'font-medium text-error'}>
                {userAnswer || '—'}
              </span>
            </span>
            {!isCorrect && (
              <span className="ml-3">
                Richtig:{' '}
                <span className="font-medium text-success">{correctAnswer}</span>
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
