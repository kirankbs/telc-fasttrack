import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamResults } from '@/components/exam/ExamResults';
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

const listeningResult: SectionResult = {
  answers: { q1: 'a' },
  score: { earned: 20, max: 24, percentage: 0.833, passed: true },
  submittedAt: '2026-04-12T10:00:00.000Z',
};

const readingResult: SectionResult = {
  answers: { q1: 'b' },
  score: { earned: 18, max: 24, percentage: 0.75, passed: true },
  submittedAt: '2026-04-12T10:05:00.000Z',
};

const writingResult: SectionResult = {
  answers: {},
  taskAnswers: { 1: { _freetext: 'Test' } },
  score: { earned: 8, max: 12, percentage: 0.667, passed: true },
  submittedAt: '2026-04-12T10:10:00.000Z',
  selfAssessment: 67,
};

const speakingResult: SectionResult = {
  answers: {},
  score: { earned: 16, max: 24, percentage: 0.667, passed: true },
  submittedAt: '2026-04-12T10:15:00.000Z',
  selfAssessment: 67,
};

const failingListening: SectionResult = {
  answers: { q1: 'a' },
  score: { earned: 5, max: 24, percentage: 0.208, passed: false },
  submittedAt: '2026-04-12T10:00:00.000Z',
};

const failingSpeaking: SectionResult = {
  answers: {},
  score: { earned: 5, max: 24, percentage: 0.208, passed: false },
  submittedAt: '2026-04-12T10:15:00.000Z',
  selfAssessment: 21,
};

describe('ExamResults', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows empty state when no session exists', () => {
    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    expect(screen.getByTestId('results-empty')).toBeInTheDocument();
    expect(screen.getByText('Keine Prüfungsdaten vorhanden')).toBeInTheDocument();
  });

  it('shows partial results without hiding the page, surfaces the "noch nicht bearbeitet" hint', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    expect(screen.getByTestId('results-page')).toBeInTheDocument();

    // Section rows for un-attempted sections render "Nicht bearbeitet"
    const notDone = screen.getAllByText('Nicht bearbeitet');
    expect(notDone.length).toBeGreaterThanOrEqual(2);

    // Score headline still surfaces an honest summary, not an error
    expect(screen.getByTestId('score-headline')).toHaveTextContent(
      /noch nicht bearbeitet/i,
    );
  });

  it('leads with the absolute score, never with "Nicht bestanden", for a failing session', () => {
    // Full failing attempt: all sections present, but several below threshold
    saveSection('A1_mock_01', 'A1', 'listening', failingListening);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', failingSpeaking);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);

    // 1. The first visible heading must be about the Übungstest itself
    const header = screen.getByTestId('results-header');
    expect(header.textContent ?? '').toMatch(/Übungstest|Ergebnisse/);
    expect(header.textContent ?? '').not.toMatch(/Nicht bestanden/);

    // 2. The score headline leads with the absolute score, not the verdict
    const headline = screen.getByTestId('score-headline');
    expect(headline.textContent ?? '').toMatch(/Du hast .* von .* Punkten erreicht/);
    expect(headline.textContent ?? '').not.toMatch(/Nicht bestanden/);

    // 3. "Nicht bestanden" appears somewhere (pass/fail dots + aggregate card)
    //    but NOT in the score headline.
    expect(
      screen.getAllByText((_, node) =>
        !!node && node.textContent?.includes('Nicht bestanden') === true,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('renders the recommendations section with at least one item per failing section', () => {
    saveSection('A1_mock_01', 'A1', 'listening', failingListening);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', failingSpeaking);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const recs = screen.getByTestId('recommendations');
    expect(recs).toBeInTheDocument();

    // Exactly one recommendation per failing section (Hören + Sprechen)
    expect(within(recs).getByTestId('recommendation-listening')).toBeInTheDocument();
    expect(within(recs).getByTestId('recommendation-speaking')).toBeInTheDocument();
    // Passing sections shouldn't appear
    expect(within(recs).queryByTestId('recommendation-reading')).toBeNull();
    expect(within(recs).queryByTestId('recommendation-writing')).toBeNull();
  });

  it('renders a single positive line when all sections pass', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const recs = screen.getByTestId('recommendations');
    const items = within(recs).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toMatch(/Gut gemacht/);
  });

  it('shows pass verdict as small dot line, not a hero box', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const verdict = screen.getByTestId('overall-verdict');
    expect(verdict).toBeInTheDocument();
    expect(verdict.textContent).toContain('Bestanden');
    // Must NOT carry hero-box styling
    expect(verdict.className).not.toMatch(/border-2/);
    expect(verdict.className).not.toMatch(/bg-fail-light|bg-fail-surface/);
  });

  it('shows written and oral aggregates with threshold context', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const written = screen.getByTestId('written-aggregate');
    const oral = screen.getByTestId('oral-aggregate');
    expect(written).toBeInTheDocument();
    expect(oral).toBeInTheDocument();

    expect(written.textContent ?? '').toMatch(
      /60% Mindestpunktzahl — Du hast .*% erreicht\./,
    );
    expect(oral.textContent ?? '').toMatch(
      /60% Mindestpunktzahl — Du hast .*% erreicht\./,
    );
  });

  it('shows self-assessment note for writing and speaking', () => {
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const assessmentNotes = screen.getAllByText(/Selbsteinschätzung: 67%/);
    expect(assessmentNotes.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Prüferbewertung ausstehend" when no self-assessment', () => {
    const noAssessment: SectionResult = {
      answers: {},
      score: { earned: 0, max: 12, percentage: 0, passed: false },
      submittedAt: '2026-04-12T10:10:00.000Z',
    };
    saveSection('A1_mock_01', 'A1', 'writing', noAssessment);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    expect(screen.getByText('Prüferbewertung ausstehend')).toBeInTheDocument();
  });

  it('has restart button that clears session', async () => {
    const user = userEvent.setup();
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const btn = screen.getByTestId('restart-btn');
    await user.click(btn);

    expect(sessionStorage.getItem('exam_session_A1_mock_01')).toBeNull();
  });

  it('does not wrap "Nicht bestanden" in a large red hero box', () => {
    saveSection('A1_mock_01', 'A1', 'listening', failingListening);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', failingSpeaking);

    const { container } = render(
      <ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />,
    );

    // The old hero had classes like border-fail bg-fail-light on a large box;
    // none of those combinations should exist on the results page wrapper chain.
    const html = container.innerHTML;
    expect(html).not.toMatch(/border-2\s+border-fail\s+bg-fail/);
    expect(html).not.toMatch(/border-fail\s+bg-fail-light/);
  });
});
