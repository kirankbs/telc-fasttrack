import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamResults } from '@/components/exam/ExamResults';
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

describe('ExamResults', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows empty state when no session exists', () => {
    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    expect(screen.getByTestId('results-empty')).toBeInTheDocument();
    expect(screen.getByText('Keine Prüfungsdaten vorhanden')).toBeInTheDocument();
  });

  it('shows partial results with incomplete indicator', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    expect(screen.getByTestId('results-page')).toBeInTheDocument();
    expect(screen.getByText(/Unvollständig/)).toBeInTheDocument();
    const notDone = screen.getAllByText('Nicht bearbeitet');
    expect(notDone.length).toBe(2);
  });

  it('shows full results with pass verdict', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const verdict = screen.getByTestId('overall-verdict');
    expect(verdict).toBeInTheDocument();
    expect(verdict.textContent).toContain('Bestanden');
  });

  it('shows written and oral aggregates', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    expect(screen.getByTestId('written-aggregate')).toBeInTheDocument();
    expect(screen.getByTestId('oral-aggregate')).toBeInTheDocument();
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

  it('shows fail verdict when oral fails', () => {
    saveSection('A1_mock_01', 'A1', 'listening', listeningResult);
    saveSection('A1_mock_01', 'A1', 'reading', readingResult);
    saveSection('A1_mock_01', 'A1', 'writing', writingResult);
    const failSpeaking: SectionResult = {
      answers: {},
      score: { earned: 5, max: 24, percentage: 0.208, passed: false },
      submittedAt: '2026-04-12T10:15:00.000Z',
      selfAssessment: 21,
    };
    saveSection('A1_mock_01', 'A1', 'speaking', failSpeaking);

    render(<ExamResults mockId="A1_mock_01" level="A1" mockNumber={1} />);
    const verdict = screen.getByTestId('overall-verdict');
    expect(verdict.textContent).toContain('Nicht bestanden');
  });
});
