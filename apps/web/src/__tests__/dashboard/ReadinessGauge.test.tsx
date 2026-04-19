import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadinessGauge } from '@/components/dashboard/ReadinessGauge';

describe('ReadinessGauge', () => {
  it('renders building level at 0%', () => {
    render(<ReadinessGauge level="building" percentage={0} />);
    expect(screen.getByTestId('readiness-label')).toHaveTextContent('Aufbau');
    expect(screen.getByTestId('readiness-percentage')).toHaveTextContent('0%');
  });

  it('renders developing level at 40%', () => {
    render(<ReadinessGauge level="developing" percentage={0.4} />);
    expect(screen.getByTestId('readiness-label')).toHaveTextContent('Entwicklung');
    expect(screen.getByTestId('readiness-percentage')).toHaveTextContent('40%');
  });

  it('renders almost level at 60%', () => {
    render(<ReadinessGauge level="almost" percentage={0.6} />);
    expect(screen.getByTestId('readiness-label')).toHaveTextContent('Fast bereit');
    expect(screen.getByTestId('readiness-percentage')).toHaveTextContent('60%');
  });

  it('renders ready level at 75%', () => {
    render(<ReadinessGauge level="ready" percentage={0.75} />);
    expect(screen.getByTestId('readiness-label')).toHaveTextContent('Prüfungsbereit');
    expect(screen.getByTestId('readiness-percentage')).toHaveTextContent('75%');
  });

  it('renders ready level at 100%', () => {
    render(<ReadinessGauge level="ready" percentage={1.0} />);
    expect(screen.getByTestId('readiness-percentage')).toHaveTextContent('100%');
    expect(screen.getByText('Du bist bereit für die Prüfung!')).toBeInTheDocument();
  });

  it('shows progress message when not yet ready', () => {
    render(<ReadinessGauge level="developing" percentage={0.5} />);
    expect(screen.getByText('Noch 25% bis Prüfungsbereit')).toBeInTheDocument();
  });
});
