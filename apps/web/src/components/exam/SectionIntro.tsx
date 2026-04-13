'use client';

interface SectionIntroProps {
  title: string;
  icon: string;
  totalSeconds: number;
  description: string;
  extraInfo?: string;
  onStart: () => void;
}

export function SectionIntro({
  title,
  icon,
  totalSeconds,
  description,
  extraInfo,
  onStart,
}: SectionIntroProps) {
  const minutes = Math.round(totalSeconds / 60);

  return (
    <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
      <div className="text-5xl">{icon}</div>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6 text-left space-y-3">
        <p className="text-sm text-text-secondary">
          Sie haben{' '}
          <span className="font-semibold text-text-primary">{minutes} Minuten</span>.
          Starten Sie den Abschnitt, wenn Sie bereit sind.
        </p>
        {extraInfo && (
          <p className="text-sm text-text-secondary">{extraInfo}</p>
        )}
      </div>
      <button
        data-testid="section-start-btn"
        onClick={onStart}
        className="w-full rounded-xl bg-brand-primary py-4 text-lg font-semibold text-white hover:opacity-90"
      >
        Abschnitt starten
      </button>
    </div>
  );
}
