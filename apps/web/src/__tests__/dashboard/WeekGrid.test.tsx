import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeekGrid } from '@/components/dashboard/WeekGrid';

describe('WeekGrid', () => {
  it('renders exactly 7 squares', () => {
    render(<WeekGrid studiedDays={[false, false, false, false, false, false, false]} />);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`week-grid-day-${i}`)).toBeInTheDocument();
    }
  });

  it('fills squares for studied days with brand-200, empty with surface-container-hi', () => {
    render(<WeekGrid studiedDays={[true, false, true, true, false, false, false]} />);
    const studied = screen.getByTestId('week-grid-day-0');
    const empty = screen.getByTestId('week-grid-day-1');

    expect(studied).toHaveAttribute('data-studied', 'true');
    expect(studied.className).toContain('bg-brand-200');

    expect(empty).toHaveAttribute('data-studied', 'false');
    expect(empty.className).toContain('bg-surface-container-hi');
  });

  it('defensive: short array still renders 7 squares (filler = false)', () => {
    render(<WeekGrid studiedDays={[true, true]} />);
    expect(screen.getByTestId('week-grid-day-6')).toHaveAttribute(
      'data-studied',
      'false',
    );
  });
});
