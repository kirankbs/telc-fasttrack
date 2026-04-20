import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockCard } from '../../components/exam/MockCard';

describe('MockCard', () => {
  it('not-started state: no accent bar, no progress, chevron hidden at rest', () => {
    render(
      <MockCard
        href="/exam/A1_mock_01"
        level="A1"
        mockNumber={1}
        title="Alltag"
        state="not-started"
        testId="card"
      />,
    );
    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-state')).toBe('not-started');
    expect(screen.getByTestId('mock-card-footer').textContent).toMatch(/Noch nicht begonnen/);
    expect(screen.queryByTestId('mock-card-progress')).toBeNull();
    expect(screen.queryByTestId('mock-card-score')).toBeNull();
  });

  it('in-progress state: shows progress bar filled to percentage + section count footer', () => {
    render(
      <MockCard
        href="/exam/A1_mock_02"
        level="A1"
        mockNumber={2}
        title="Familie"
        state="in-progress"
        progress={0.5}
        sectionsCompleted={2}
        totalSections={4}
        testId="card"
      />,
    );
    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-state')).toBe('in-progress');
    const bar = screen.getByTestId('mock-card-progress') as HTMLElement;
    expect(bar.style.width).toBe('50%');
    expect(screen.getByTestId('mock-card-footer').textContent).toMatch(/2 von 4 Abschnitten/);
  });

  it('completed + passed: surface-container bg + pass-colored score pill', () => {
    render(
      <MockCard
        href="/exam/A1_mock_03"
        level="A1"
        mockNumber={3}
        title="Wohnen"
        state="completed"
        score={0.78}
        passed
        testId="card"
      />,
    );
    const card = screen.getByTestId('card');
    expect(card.className).toMatch(/bg-surface-container/);
    const pill = screen.getByTestId('mock-card-score');
    expect(pill.textContent).toBe('78%');
    expect(pill.className).toMatch(/bg-pass-surface/);
    expect(pill.className).toMatch(/text-pass/);
    expect(screen.getByTestId('mock-card-footer').textContent).toMatch(/Vollständig/);
  });

  it('completed + failed: score pill uses fail-surface + text-fail', () => {
    render(
      <MockCard
        href="/exam/A1_mock_03"
        level="A1"
        mockNumber={3}
        title="Wohnen"
        state="completed"
        score={0.42}
        passed={false}
        testId="card"
      />,
    );
    const pill = screen.getByTestId('mock-card-score');
    expect(pill.className).toMatch(/bg-fail-surface/);
    expect(pill.className).toMatch(/text-fail/);
  });

  it('coming-soon: renders as a <div>, not an <a>; footer reads Bald verfügbar', () => {
    render(
      <MockCard
        href="/exam/A1_mock_09"
        level="A1"
        mockNumber={9}
        title="Reisen"
        state="coming-soon"
        testId="card"
      />,
    );
    const card = screen.getByTestId('card');
    expect(card.tagName.toLowerCase()).toBe('div');
    expect(card.className).toMatch(/cursor-default/);
    expect(screen.getByTestId('mock-card-footer').textContent).toMatch(/Bald verfügbar/);
  });
});
