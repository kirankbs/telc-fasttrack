'use client';

interface StudyStatsProps {
  completedMocks: number;
  totalMocks: number;
  sectionsCompleted: number;
  averageScore: number;
  estimatedMinutes: number;
}

export function StudyStats({
  completedMocks,
  totalMocks,
  sectionsCompleted,
  averageScore,
  estimatedMinutes,
}: StudyStatsProps) {
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;
  const timeDisplay =
    hours > 0 ? `${hours}h ${mins > 0 ? `${mins}min` : ''}` : `${mins}min`;

  return (
    <div data-testid="study-stats" className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary">Lernstatistik</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          testId="stat-mocks"
          label="Übungstests"
          value={`${completedMocks} / ${totalMocks}`}
          sub="abgeschlossen"
        />
        <StatCard
          testId="stat-sections"
          label="Sektionen"
          value={String(sectionsCompleted)}
          sub="bearbeitet"
        />
        <StatCard
          testId="stat-average"
          label="Durchschnitt"
          value={`${Math.round(averageScore * 100)}%`}
          sub="Gesamtschnitt"
        />
        <StatCard
          testId="stat-time"
          label="Lernzeit"
          value={estimatedMinutes === 0 ? '0h' : timeDisplay}
          sub="geschätzt"
        />
      </div>
    </div>
  );
}

function StatCard({
  testId,
  label,
  value,
  sub,
}: {
  testId: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      data-testid={testId}
      className="rounded-xl border border-border bg-white p-4"
    >
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="mt-1 text-2xl font-bold text-text-primary">{value}</div>
      <div className="mt-0.5 text-xs text-text-secondary">{sub}</div>
    </div>
  );
}
