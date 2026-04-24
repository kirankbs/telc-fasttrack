import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GrammarPageClient } from '../../app/grammar/GrammarPageClient';

const levels = [
  { level: 'A1' as const, color: '#2d8a4e', label: 'Start Deutsch 1', topicCount: 12 },
  { level: 'B2' as const, color: '#c0390b', label: 'telc Deutsch B2', topicCount: 25 },
  { level: 'C1' as const, color: '#6b2fa0', label: 'telc Deutsch C1 Hochschule', topicCount: 0 },
];

describe('GrammarPageClient', () => {
  it('renders a level card for each level', () => {
    render(<GrammarPageClient levels={levels} />);

    expect(screen.getByTestId('level-card-A1')).toBeDefined();
    expect(screen.getByTestId('level-card-B2')).toBeDefined();
    expect(screen.getByTestId('level-card-C1')).toBeDefined();
  });

  it('Browse Topics button links to the level page when topics are available', () => {
    render(<GrammarPageClient levels={levels} />);

    const a1Btn = screen.getByTestId('browse-button-A1');
    expect(a1Btn.tagName).toBe('A');
    expect(a1Btn.getAttribute('href')).toBe('/grammar/A1');

    const b2Btn = screen.getByTestId('browse-button-B2');
    expect(b2Btn.tagName).toBe('A');
    expect(b2Btn.getAttribute('href')).toBe('/grammar/B2');
  });

  it('shows Coming Soon button (disabled) when no topics are available', () => {
    render(<GrammarPageClient levels={levels} />);

    const c1Btn = screen.getByTestId('browse-button-C1');
    expect(c1Btn.tagName).toBe('BUTTON');
    expect((c1Btn as HTMLButtonElement).disabled).toBe(true);
    expect(c1Btn.textContent).toContain('Coming Soon');
  });

  it('does not render an inline topic list', () => {
    render(<GrammarPageClient levels={levels} />);
    expect(screen.queryByTestId('topic-list')).toBeNull();
  });
});
