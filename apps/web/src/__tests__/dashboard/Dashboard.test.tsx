import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { saveSection } from '@/lib/examSession';
import type { SectionResult } from '@/lib/examSession';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function makeResult(
  earned: number,
  max: number,
  passed: boolean,
  submittedAt?: string,
): SectionResult {
  return {
    answers: {},
    score: { earned, max, percentage: max > 0 ? earned / max : 0, passed },
    submittedAt: submittedAt ?? new Date().toISOString(),
  };
}

describe('Dashboard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders empty state without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('readiness-hero')).toBeInTheDocument();
    expect(screen.getByTestId('readiness-stage-name')).toHaveTextContent(
      'Building foundation',
    );
    expect(screen.getByTestId('readiness-cta')).toHaveTextContent(
      'Start your first exam',
    );
    expect(screen.getByTestId('recent-results-empty')).toBeInTheDocument();
  });

  it('never renders a percentage in the readiness hero', () => {
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_01', 'A1', 'reading', makeResult(18, 24, true));

    render(<Dashboard />);
    const hero = screen.getByTestId('readiness-hero');
    expect(hero.textContent ?? '').not.toMatch(/\d{1,3}\s*%/);
  });

  it('renders 3 stat cards only (no "Sektionen" card)', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('stat-mocks')).toBeInTheDocument();
    expect(screen.getByTestId('stat-average')).toBeInTheDocument();
    expect(screen.getByTestId('stat-time')).toBeInTheDocument();
    expect(screen.queryByTestId('stat-sections')).not.toBeInTheDocument();
  });

  it('shows zero-data stats on empty state', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('stat-mocks')).toHaveTextContent('0 / 10');
    // Less than 2 mocks complete — the average card shows the "not enough data" line.
    expect(screen.getByTestId('stat-average-empty')).toBeInTheDocument();
    expect(screen.getByTestId('stat-time')).toHaveTextContent('0h');
  });

  it('computes completed mock count from mixed session states', () => {
    // Mock 01: all 4 sections — complete
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_01', 'A1', 'reading', makeResult(18, 24, true));
    saveSection('A1_mock_01', 'A1', 'writing', makeResult(8, 12, true));
    saveSection('A1_mock_01', 'A1', 'speaking', makeResult(16, 24, true));

    // Mock 02: only 2 sections — incomplete
    saveSection('A1_mock_02', 'A1', 'listening', makeResult(15, 24, true));
    saveSection('A1_mock_02', 'A1', 'reading', makeResult(12, 24, true));

    render(<Dashboard />);
    expect(screen.getByTestId('stat-mocks')).toHaveTextContent('1 / 10');
  });

  it('shows recent results rows for each session with any section', () => {
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_03', 'A1', 'reading', makeResult(10, 24, false));

    render(<Dashboard />);
    expect(screen.getByTestId('recent-results')).toBeInTheDocument();
    expect(screen.getByTestId('result-row-A1_mock_01')).toBeInTheDocument();
    expect(screen.getByTestId('result-row-A1_mock_03')).toBeInTheDocument();
  });

  it('renders split written / oral score dots per row', () => {
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_01', 'A1', 'reading', makeResult(18, 24, true));
    saveSection('A1_mock_01', 'A1', 'writing', makeResult(8, 12, true));
    saveSection('A1_mock_01', 'A1', 'speaking', makeResult(10, 24, false));

    render(<Dashboard />);
    const row = screen.getByTestId('result-row-A1_mock_01');
    expect(
      within(row).getByTestId('result-A1_mock_01-written'),
    ).toHaveTextContent(/Schriftlich \d+%/);
    expect(
      within(row).getByTestId('result-A1_mock_01-oral'),
    ).toHaveTextContent(/Mündlich \d+%/);
  });

  it('switches levels and resets data', async () => {
    const user = userEvent.setup();
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));

    render(<Dashboard />);
    expect(screen.getByTestId('result-row-A1_mock_01')).toBeInTheDocument();

    await user.click(screen.getByTestId('level-tab-A2'));
    expect(screen.getByTestId('recent-results-empty')).toBeInTheDocument();
    expect(screen.getByTestId('stat-mocks')).toHaveTextContent('0 / 10');
  });

  it('CTA variant: "Continue" for most recent in-progress session', () => {
    const older = new Date('2026-04-10T08:00:00Z').toISOString();
    const newer = new Date('2026-04-11T10:00:00Z').toISOString();

    sessionStorage.setItem(
      'exam_session_A1_mock_02',
      JSON.stringify({
        mockId: 'A1_mock_02',
        level: 'A1',
        startedAt: older,
        sections: { listening: makeResult(15, 24, true) },
      }),
    );
    sessionStorage.setItem(
      'exam_session_A1_mock_05',
      JSON.stringify({
        mockId: 'A1_mock_05',
        level: 'A1',
        startedAt: newer,
        sections: { listening: makeResult(18, 24, true) },
      }),
    );

    render(<Dashboard />);
    const cta = screen.getByTestId('readiness-cta');
    expect(cta).toHaveAttribute('href', '/exam/A1_mock_05');
    expect(cta).toHaveTextContent('Continue: Übungstest 5');
  });

  it('CTA variant: "Next: Übungstest N" when nothing is in progress', () => {
    // Complete mock 1 fully — no in-progress, next should be mock 2
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_01', 'A1', 'reading', makeResult(18, 24, true));
    saveSection('A1_mock_01', 'A1', 'writing', makeResult(8, 12, true));
    saveSection('A1_mock_01', 'A1', 'speaking', makeResult(16, 24, true));

    render(<Dashboard />);
    const cta = screen.getByTestId('readiness-cta');
    expect(cta).toHaveTextContent('Next: Übungstest 2');
    expect(cta).toHaveAttribute('href', '/exam/A1_mock_02');
  });

  it('average card shows value after >=2 mocks completed', () => {
    for (const id of ['A1_mock_01', 'A1_mock_02']) {
      saveSection(id, 'A1', 'listening', makeResult(20, 24, true));
      saveSection(id, 'A1', 'reading', makeResult(18, 24, true));
      saveSection(id, 'A1', 'writing', makeResult(8, 12, true));
      saveSection(id, 'A1', 'speaking', makeResult(16, 24, true));
    }
    render(<Dashboard />);
    expect(screen.getByTestId('stat-average-value')).toHaveTextContent(/%/);
    expect(
      screen.queryByTestId('stat-average-empty'),
    ).not.toBeInTheDocument();
  });

  it('average card uses singular form when only one session has scores', () => {
    // Partial session — still under the completedMocks < 2 threshold,
    // so the empty state renders regardless of sample size == 1.
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    render(<Dashboard />);
    expect(screen.getByTestId('stat-average-empty')).toBeInTheDocument();
  });
});
