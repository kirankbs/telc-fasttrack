import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHub, type HubSection } from '../../components/exam/SectionHub';

const A1_WRITTEN: HubSection[] = [
  { key: 'listening', name: 'Hören', route: 'listening', durationSec: 20 * 60 },
  { key: 'reading', name: 'Lesen', route: 'reading', durationSec: 25 * 60 },
  { key: 'writing', name: 'Schreiben', route: 'writing', durationSec: 20 * 60 },
];

const B1_WRITTEN: HubSection[] = [
  { key: 'listening', name: 'Hören', route: 'listening', durationSec: 30 * 60 },
  { key: 'reading', name: 'Lesen', route: 'reading', durationSec: 45 * 60 },
  {
    key: 'sprachbausteine',
    name: 'Sprachbausteine',
    route: 'sprachbausteine',
    durationSec: 15 * 60,
  },
  { key: 'writing', name: 'Schreiben', route: 'writing', durationSec: 30 * 60 },
];

const ORAL: HubSection[] = [
  { key: 'speaking', name: 'Sprechen', route: 'speaking', durationSec: 15 * 60 },
];

describe('SectionHub', () => {
  beforeEach(() => {
    // Reset sessionStorage between tests so status dots start grey.
    sessionStorage.clear();
  });

  it('groups sections into Schriftlich and Mündlich blocks with pass-threshold reminder', () => {
    render(
      <SectionHub
        mockId="A1_mock_01"
        level="A1"
        written={A1_WRITTEN}
        oral={ORAL}
        hasContent
      />,
    );

    const schriftlich = screen.getByTestId('hub-group-schriftlich');
    const muendlich = screen.getByTestId('hub-group-mündlich');

    expect(schriftlich).toBeTruthy();
    expect(muendlich).toBeTruthy();
    expect(schriftlich.textContent).toMatch(/min\. 60% zum Bestehen/);
    expect(muendlich.textContent).toMatch(/min\. 60% zum Bestehen/);
  });

  it('A1 mock: no Sprachbausteine row in the written block', () => {
    render(
      <SectionHub
        mockId="A1_mock_01"
        level="A1"
        written={A1_WRITTEN}
        oral={ORAL}
        hasContent
      />,
    );
    expect(screen.queryByTestId('hub-section-sprachbausteine')).toBeNull();
    expect(screen.getByTestId('hub-section-listening')).toBeTruthy();
    expect(screen.getByTestId('hub-section-reading')).toBeTruthy();
    expect(screen.getByTestId('hub-section-writing')).toBeTruthy();
    expect(screen.getByTestId('hub-section-speaking')).toBeTruthy();
  });

  it('B1 mock: Sprachbausteine row appears in the written block', () => {
    render(
      <SectionHub
        mockId="B1_mock_01"
        level="B1"
        written={B1_WRITTEN}
        oral={ORAL}
        hasContent
      />,
    );
    const row = screen.getByTestId('hub-section-sprachbausteine');
    expect(row).toBeTruthy();
    // The Schriftlich block should contain it (not the oral block).
    const schriftlich = screen.getByTestId('hub-group-schriftlich');
    expect(schriftlich.contains(row)).toBe(true);
  });

  it('default CTA reads "Mit Hören starten" when nothing has been attempted', () => {
    render(
      <SectionHub
        mockId="A1_mock_01"
        level="A1"
        written={A1_WRITTEN}
        oral={ORAL}
        hasContent
      />,
    );
    const cta = screen.getByTestId('section-hub-cta');
    expect(cta.textContent).toMatch(/Mit Hören starten/);
  });

  it('status dot is grey (bg-text-tertiary) for not-started rows', () => {
    render(
      <SectionHub
        mockId="A1_mock_01"
        level="A1"
        written={A1_WRITTEN}
        oral={ORAL}
        hasContent
      />,
    );
    const dot = screen.getByTestId('hub-status-dot-listening');
    expect(dot.getAttribute('data-status')).toBe('not-started');
    expect(dot.className).toMatch(/bg-text-tertiary/);
  });
});
