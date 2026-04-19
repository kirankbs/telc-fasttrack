import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { saveSection, clearSession } from '@/lib/examSession';
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
): SectionResult {
  return {
    answers: {},
    score: { earned, max, percentage: max > 0 ? earned / max : 0, passed },
    submittedAt: new Date().toISOString(),
  };
}

describe('Dashboard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders empty state without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('readiness-gauge')).toBeInTheDocument();
    expect(screen.getByTestId('readiness-label')).toHaveTextContent('Aufbau');
    expect(screen.getByTestId('readiness-percentage')).toHaveTextContent('0%');
    expect(screen.getByTestId('completed-mocks')).toHaveTextContent('0 / 10');
    expect(screen.getByTestId('recent-results-empty')).toBeInTheDocument();
  });

  it('shows zero stats on empty state', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('stat-mocks')).toHaveTextContent('0 / 10');
    expect(screen.getByTestId('stat-sections')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-average')).toHaveTextContent('0%');
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
    expect(screen.getByTestId('completed-mocks')).toHaveTextContent('1 / 10');
  });

  it('shows recent results for sessions with any completed section', () => {
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_03', 'A1', 'reading', makeResult(10, 24, false));

    render(<Dashboard />);
    expect(screen.getByTestId('recent-results')).toBeInTheDocument();
    expect(screen.getByTestId('result-row-A1_mock_01')).toBeInTheDocument();
    expect(screen.getByTestId('result-row-A1_mock_03')).toBeInTheDocument();
  });

  it('shows pass/fail badge only for complete mocks', () => {
    // Complete mock
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_01', 'A1', 'reading', makeResult(18, 24, true));
    saveSection('A1_mock_01', 'A1', 'writing', makeResult(8, 12, true));
    saveSection('A1_mock_01', 'A1', 'speaking', makeResult(16, 24, true));

    // Partial mock
    saveSection('A1_mock_02', 'A1', 'listening', makeResult(15, 24, true));

    render(<Dashboard />);
    expect(screen.getByTestId('result-badge-A1_mock_01')).toBeInTheDocument();
    expect(screen.queryByTestId('result-badge-A1_mock_02')).not.toBeInTheDocument();
  });

  it('switches levels and resets data', async () => {
    const user = userEvent.setup();
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));

    render(<Dashboard />);
    expect(screen.getByTestId('result-row-A1_mock_01')).toBeInTheDocument();

    await user.click(screen.getByTestId('level-tab-A2'));
    expect(screen.getByTestId('recent-results-empty')).toBeInTheDocument();
    expect(screen.getByTestId('completed-mocks')).toHaveTextContent('0 / 10');
  });

  it('"Weiter lernen" links to most recently started incomplete mock', () => {
    // Older incomplete
    const older = new Date('2026-04-10T08:00:00Z').toISOString();
    const newer = new Date('2026-04-11T10:00:00Z').toISOString();

    sessionStorage.setItem(
      'exam_session_A1_mock_02',
      JSON.stringify({
        mockId: 'A1_mock_02',
        level: 'A1',
        startedAt: older,
        sections: {
          listening: makeResult(15, 24, true),
        },
      }),
    );
    sessionStorage.setItem(
      'exam_session_A1_mock_05',
      JSON.stringify({
        mockId: 'A1_mock_05',
        level: 'A1',
        startedAt: newer,
        sections: {
          listening: makeResult(18, 24, true),
        },
      }),
    );

    render(<Dashboard />);
    const continueLink = screen.getByTestId('quick-action-continue');
    expect(continueLink).toHaveAttribute('href', '/exam/A1_mock_05');
  });

  it('"Weiter lernen" falls back to /exam when no incomplete mock', () => {
    render(<Dashboard />);
    const continueLink = screen.getByTestId('quick-action-continue');
    expect(continueLink).toHaveAttribute('href', '/exam');
  });

  it('computes study stats correctly', () => {
    saveSection('A1_mock_01', 'A1', 'listening', makeResult(20, 24, true));
    saveSection('A1_mock_01', 'A1', 'reading', makeResult(18, 24, true));

    render(<Dashboard />);
    expect(screen.getByTestId('stat-sections')).toHaveTextContent('2');
    // Average: (20/24 + 18/24) / 2 = (0.833 + 0.75) / 2 = 0.7917 => 79%
    expect(screen.getByTestId('stat-average')).toHaveTextContent('79%');
    // Time: listening 20min + reading 25min = 45min
    expect(screen.getByTestId('stat-time')).toHaveTextContent('45min');
  });
});
