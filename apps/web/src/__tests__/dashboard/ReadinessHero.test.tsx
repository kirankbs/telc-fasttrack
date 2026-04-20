import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadinessHero } from '@/components/dashboard/ReadinessHero';

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

describe('ReadinessHero', () => {
  it('renders the named stage in the display face, never a percentage', () => {
    render(
      <ReadinessHero
        activeLevel="A1"
        readiness="building"
        completedMocks={0}
        totalMocks={10}
        continueHref="/exam"
        ctaMockNumber={1}
        hasInProgress={false}
      />,
    );

    const stage = screen.getByTestId('readiness-stage-name');
    expect(stage).toHaveTextContent('Building foundation');
    expect(stage.tagName.toLowerCase()).toBe('h2');

    const hero = screen.getByTestId('readiness-hero');
    expect(hero.textContent ?? '').not.toMatch(/\d{1,3}\s*%/);
  });

  it('renders the 4-segment stage track', () => {
    render(
      <ReadinessHero
        activeLevel="A1"
        readiness="developing"
        completedMocks={3}
        totalMocks={10}
        continueHref="/exam/A1_mock_04"
        ctaMockNumber={4}
        hasInProgress={false}
      />,
    );

    expect(screen.getByTestId('stage-track')).toBeInTheDocument();
    expect(screen.getByTestId('stage-segment-building')).toHaveAttribute(
      'data-filled',
      'true',
    );
    expect(screen.getByTestId('stage-segment-developing')).toHaveAttribute(
      'data-filled',
      'true',
    );
    expect(screen.getByTestId('stage-segment-developing')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('stage-segment-almost')).toHaveAttribute(
      'data-filled',
      'false',
    );
    expect(screen.getByTestId('stage-segment-ready')).toHaveAttribute(
      'data-filled',
      'false',
    );
  });

  it('CTA text: not-started -> "Start your first exam"', () => {
    render(
      <ReadinessHero
        activeLevel="A1"
        readiness="building"
        completedMocks={0}
        totalMocks={10}
        continueHref="/exam"
        ctaMockNumber={1}
        hasInProgress={false}
      />,
    );
    expect(screen.getByTestId('readiness-cta')).toHaveTextContent(
      'Start your first exam',
    );
  });

  it('CTA text: in-progress -> "Continue: Übungstest N"', () => {
    render(
      <ReadinessHero
        activeLevel="A1"
        readiness="developing"
        completedMocks={2}
        totalMocks={10}
        continueHref="/exam/A1_mock_03"
        ctaMockNumber={3}
        hasInProgress
      />,
    );
    expect(screen.getByTestId('readiness-cta')).toHaveTextContent(
      'Continue: Übungstest 3',
    );
  });

  it('CTA text: not-started-but-some-completed -> "Next: Übungstest N"', () => {
    render(
      <ReadinessHero
        activeLevel="A1"
        readiness="developing"
        completedMocks={2}
        totalMocks={10}
        continueHref="/exam/A1_mock_03"
        ctaMockNumber={3}
        hasInProgress={false}
      />,
    );
    expect(screen.getByTestId('readiness-cta')).toHaveTextContent(
      'Next: Übungstest 3',
    );
  });

  it('uses level accent bar for the active level', () => {
    render(
      <ReadinessHero
        activeLevel="B2"
        readiness="almost"
        completedMocks={5}
        totalMocks={10}
        continueHref="/exam"
        ctaMockNumber={6}
        hasInProgress={false}
      />,
    );
    const accent = screen.getByTestId('readiness-hero-accent');
    expect(accent.className).toContain('bg-level-b2-solid');
  });

  it('all readiness variants render without any percentage', () => {
    for (const r of ['building', 'developing', 'almost', 'ready'] as const) {
      const { unmount } = render(
        <ReadinessHero
          activeLevel="A1"
          readiness={r}
          completedMocks={0}
          totalMocks={10}
          continueHref="/exam"
          ctaMockNumber={1}
          hasInProgress={false}
        />,
      );
      const hero = screen.getByTestId('readiness-hero');
      expect(hero.textContent ?? '').not.toMatch(/\d{1,3}\s*%/);
      unmount();
    }
  });

  it('stage name is rendered in font-display (Instrument Serif)', () => {
    render(
      <ReadinessHero
        activeLevel="A1"
        readiness="ready"
        completedMocks={10}
        totalMocks={10}
        continueHref="/exam/A1_mock_01"
        ctaMockNumber={1}
        hasInProgress={false}
      />,
    );
    expect(screen.getByTestId('readiness-stage-name').className).toContain(
      'font-display',
    );
  });
});
