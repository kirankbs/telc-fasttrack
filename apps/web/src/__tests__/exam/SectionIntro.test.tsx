import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionIntro } from '../../components/exam/SectionIntro';

describe('SectionIntro', () => {
  it('renders icon, title, and description', () => {
    render(
      <SectionIntro
        title="Hören"
        icon="🎧"
        totalSeconds={1200}
        description="3 Teile · 18 Aufgaben"
        onStart={() => {}}
      />,
    );

    expect(screen.getByText('🎧')).toBeTruthy();
    expect(screen.getByText('Hören')).toBeTruthy();
    expect(screen.getByText('3 Teile · 18 Aufgaben')).toBeTruthy();
  });

  it('shows time in minutes', () => {
    render(
      <SectionIntro
        title="Lesen"
        icon="📖"
        totalSeconds={1500}
        description="3 Teile"
        onStart={() => {}}
      />,
    );

    expect(screen.getByText('25 Minuten')).toBeTruthy();
  });

  it('calls onStart when button clicked', async () => {
    const onStart = vi.fn();
    render(
      <SectionIntro
        title="Schreiben"
        icon="✍️"
        totalSeconds={1200}
        description="2 Aufgaben"
        onStart={onStart}
      />,
    );

    await userEvent.click(screen.getByTestId('section-start-btn'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('renders optional extraInfo when provided', () => {
    render(
      <SectionIntro
        title="Sprechen"
        icon="🗣️"
        totalSeconds={900}
        description="3 Aufgaben"
        extraInfo="Vorbereitungszeit: 20 Minuten"
        onStart={() => {}}
      />,
    );

    expect(screen.getByText('Vorbereitungszeit: 20 Minuten')).toBeTruthy();
  });

  it('renders correctly when totalSeconds is 0', () => {
    render(
      <SectionIntro
        title="Test"
        icon="📝"
        totalSeconds={0}
        description="0 Aufgaben"
        onStart={() => {}}
      />,
    );

    expect(screen.getByText('0 Minuten')).toBeTruthy();
  });
});
