/**
 * Tests for the Writing section screen.
 *
 * Covers form fill rendering, short message word count indicator,
 * self-assessment stepper, and navigation to speaking.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ mockId: 'A1_mock_01' }),
}));

const mockSetAnswer = jest.fn();
const mockCompleteSection = jest.fn();

const makeSession = () => ({
  mockId: 'A1_mock_01',
  level: 'A1',
  mode: 'exam_sim' as const,
  answers: {} as Record<string, string>,
  exam: {
    id: 'A1_mock_01',
    level: 'A1',
    title: 'Übungstest 1',
    version: 1,
    sections: {
      listening: { totalTimeMinutes: 20, parts: [] },
      reading: { totalTimeMinutes: 25, parts: [] },
      writing: {
        totalTimeMinutes: 20,
        tasks: [
          {
            taskNumber: 1,
            type: 'form_fill' as const,
            instructions: 'Füllen Sie das Formular aus.',
            instructionsTranslation: 'Fill in the form.',
            formFields: [
              { label: 'Name', correctAnswer: 'Max Mustermann', hint: 'Ihr Name' },
              { label: 'Adresse', correctAnswer: 'Musterstraße 1', hint: 'Ihre Adresse' },
            ],
            sampleAnswer: '',
            scoringCriteria: [{ criterion: 'Korrektheit', maxPoints: 6, description: '' }],
          },
          {
            taskNumber: 2,
            type: 'short_message' as const,
            instructions: '',
            instructionsTranslation: '',
            prompt: 'Schreiben Sie eine Nachricht an Ihren Freund.',
            promptTranslation: 'Write a message to your friend.',
            requiredPoints: ['Wo', 'Wann', 'Was'],
            wordCountMin: 30,
            wordCountMax: 40,
            sampleAnswer: '',
            scoringCriteria: [{ criterion: 'Aufgabe', maxPoints: 6, description: '' }],
          },
        ],
      },
      speaking: { totalTimeMinutes: 15, prepTimeMinutes: 0, parts: [] },
    },
  },
  attemptId: null,
  listeningComplete: false,
  readingComplete: false,
  writingComplete: false,
  speakingComplete: false,
  sectionScores: {},
  startedAt: '2026-04-03T10:00:00.000Z',
});

jest.mock('../../../src/context/ExamContext', () => ({
  useExam: jest.fn(),
}));

import { router } from 'expo-router';
import { useExam } from '../../../src/context/ExamContext';
import WritingScreen from '../../../src/app/exam/[mockId]/writing';

const mockRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>;

const mockUseExam = useExam as jest.MockedFunction<typeof useExam>;

function setup() {
  mockUseExam.mockReturnValue({
    session: makeSession(),
    startExam: jest.fn(),
    setAnswer: mockSetAnswer,
    completeSection: mockCompleteSection,
    endExam: jest.fn(),
    resetExam: jest.fn(),
  });
}

describe('WritingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Schreiben" section title', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Schreiben')).toBeTruthy();
  });

  it('renders form fill instructions', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Füllen Sie das Formular aus.')).toBeTruthy();
  });

  it('renders form field labels', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Adresse')).toBeTruthy();
  });

  it('renders the short message prompt', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Schreiben Sie eine Nachricht an Ihren Freund.')).toBeTruthy();
  });

  it('renders required writing points', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Schreiben Sie über:')).toBeTruthy();
  });

  it('shows "0 Wörter" initially in word count', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('0 Wörter')).toBeTruthy();
  });

  it('renders the self-assessment card', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Schreiben wird manuell bewertet')).toBeTruthy();
  });

  it('stepper starts at 0', () => {
    setup();
    const { getAllByText } = render(<WritingScreen />);
    // The stepper value "0" appears as the score display
    const zeros = getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('increments stepper on + press', () => {
    setup();
    const { getByLabelText, getByText } = render(<WritingScreen />);
    fireEvent.press(getByLabelText('Punkt hinzufügen'));
    expect(getByText('1')).toBeTruthy();
    expect(mockSetAnswer).toHaveBeenCalledWith('writing_task_1', '1');
  });

  it('does not go below 0 on – press', () => {
    setup();
    const { getByLabelText, getAllByText } = render(<WritingScreen />);
    fireEvent.press(getByLabelText('Punkt entfernen'));
    const zeros = getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('calls completeSection and navigates to speaking on finish', () => {
    setup();
    const { getByText } = render(<WritingScreen />);
    fireEvent.press(getByText('Abschnitt beenden'));
    expect(mockCompleteSection).toHaveBeenCalledWith(
      'writing',
      expect.objectContaining({ max: 12 })
    );
    expect(mockRouterReplace).toHaveBeenCalledWith('/exam/A1_mock_01/speaking');
  });

  it('shows loading when exam is null', () => {
    mockUseExam.mockReturnValue({
      session: null,
      startExam: jest.fn(),
      setAnswer: jest.fn(),
      completeSection: jest.fn(),
      endExam: jest.fn(),
      resetExam: jest.fn(),
    });
    const { getByText } = render(<WritingScreen />);
    expect(getByText('Lade Prüfung...')).toBeTruthy();
  });
});
