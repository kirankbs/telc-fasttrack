import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudyStats } from '@/components/dashboard/StudyStats';

const STUDIED = [false, false, false, false, false, false, false] as const;

describe('StudyStats', () => {
  it('renders exactly 3 stat cards', () => {
    const { container } = render(
      <StudyStats
        activeLevel="A1"
        completedMocks={0}
        totalMocks={10}
        averageScore={0}
        averageSampleSize={0}
        estimatedMinutes={0}
        studiedDays={STUDIED}
      />,
    );
    expect(screen.getByTestId('stat-mocks')).toBeInTheDocument();
    expect(screen.getByTestId('stat-average')).toBeInTheDocument();
    expect(screen.getByTestId('stat-time')).toBeInTheDocument();
    expect(screen.queryByTestId('stat-sections')).not.toBeInTheDocument();
    // Sanity: exactly three grid children inside the grid.
    const grid = container.querySelector('[data-testid="study-stats"] > div');
    expect(grid?.children.length).toBe(3);
  });

  it('mocks card renders progress bar fill proportional to completion', () => {
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={3}
        totalMocks={10}
        averageScore={0.7}
        averageSampleSize={3}
        estimatedMinutes={120}
        studiedDays={STUDIED}
      />,
    );
    const fill = screen.getByTestId('stat-mocks-fill');
    expect(fill.getAttribute('style')).toMatch(/width:\s*30%/);
  });

  it('average card: shows "Noch nicht genug Daten" when completedMocks < 2', () => {
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={1}
        totalMocks={10}
        averageScore={0.7}
        averageSampleSize={1}
        estimatedMinutes={20}
        studiedDays={STUDIED}
      />,
    );
    expect(screen.getByTestId('stat-average-empty')).toBeInTheDocument();
    expect(screen.getByTestId('stat-average-empty')).toHaveTextContent(
      'Noch nicht genug Daten',
    );
    expect(screen.queryByTestId('stat-average-value')).not.toBeInTheDocument();
  });

  it('average card: shows value and singular "Prüfung" form', () => {
    // completedMocks >= 2 unlocks the value; sample size drives the label.
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={2}
        totalMocks={10}
        averageScore={0.74}
        averageSampleSize={1}
        estimatedMinutes={45}
        studiedDays={STUDIED}
      />,
    );
    const avg = screen.getByTestId('stat-average');
    expect(avg).toHaveTextContent('74%');
    expect(avg).toHaveTextContent('aus 1 Prüfung');
    expect(avg).not.toHaveTextContent('Prüfungen');
  });

  it('average card: shows plural "Prüfungen" for sample size > 1', () => {
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={3}
        totalMocks={10}
        averageScore={0.74}
        averageSampleSize={3}
        estimatedMinutes={120}
        studiedDays={STUDIED}
      />,
    );
    expect(screen.getByTestId('stat-average')).toHaveTextContent(
      'aus 3 Prüfungen',
    );
  });

  it('time card shows "diese Woche" subtitle (not "geschätzt")', () => {
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={0}
        totalMocks={10}
        averageScore={0}
        averageSampleSize={0}
        estimatedMinutes={0}
        studiedDays={STUDIED}
      />,
    );
    const card = screen.getByTestId('stat-time');
    expect(card).toHaveTextContent('diese Woche');
    expect(card).not.toHaveTextContent('geschätzt');
  });

  it('time card: formats 0 minutes as "0h"', () => {
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={0}
        totalMocks={10}
        averageScore={0}
        averageSampleSize={0}
        estimatedMinutes={0}
        studiedDays={STUDIED}
      />,
    );
    expect(screen.getByTestId('stat-time')).toHaveTextContent('0h');
  });

  it('time card: formats hours + minutes', () => {
    render(
      <StudyStats
        activeLevel="A1"
        completedMocks={0}
        totalMocks={10}
        averageScore={0}
        averageSampleSize={0}
        estimatedMinutes={260}
        studiedDays={STUDIED}
      />,
    );
    expect(screen.getByTestId('stat-time')).toHaveTextContent('4h 20min');
  });
});
