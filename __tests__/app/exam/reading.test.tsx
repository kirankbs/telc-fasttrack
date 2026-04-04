/**
 * Tests for the Reading section screen.
 *
 * Covers part tab navigation, text card rendering, T/F question interaction,
 * matching dropdown, scoring, and navigation to writing.
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
      reading: {
        totalTimeMinutes: 25,
        parts: [
          {
            partNumber: 1,
            instructions: 'Lesen Sie den Text.',
            instructionsTranslation: 'Read the text.',
            texts: [
              {
                id: 'text_1',
                type: 'notice' as const,
                content: 'Das Museum ist täglich geöffnet.',
              },
            ],
            questions: [
              {
                id: 'A1_m01_R1_q1',
                type: 'true_false' as const,
                questionText: 'Das Museum ist immer geöffnet.',
                relatedTextId: 'text_1',
                correctAnswer: 'richtig',
                explanation: 'Ja, täglich.',
              },
            ],
          },
          {
            partNumber: 2,
            instructions: 'Ordnen Sie zu.',
            instructionsTranslation: 'Match the situations.',
            texts: [],
            questions: [
              {
                id: 'A1_m01_R2_q1',
                type: 'matching' as const,
                questionText: 'Sie suchen einen Arzt.',
                matchingSources: [
                  { id: 'a', label: 'Zahnarzt' },
                  { id: 'b', label: 'Hausarzt' },
                ],
                correctAnswer: 'b',
                explanation: 'Hausarzt ist richtig.',
              },
            ],
          },
        ],
      },
      writing: { totalTimeMinutes: 20, tasks: [] },
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
import ReadingScreen from '../../../src/app/exam/[mockId]/reading';

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

describe('ReadingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Lesen" section title', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    expect(getByText('Lesen')).toBeTruthy();
  });

  it('renders part tabs', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    expect(getByText('Teil 1')).toBeTruthy();
    expect(getByText('Teil 2')).toBeTruthy();
  });

  it('renders part 1 instructions', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    expect(getByText('Lesen Sie den Text.')).toBeTruthy();
  });

  it('renders the reading text card content', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    expect(getByText('Das Museum ist täglich geöffnet.')).toBeTruthy();
  });

  it('renders Richtig/Falsch buttons for T/F question', () => {
    setup();
    const { getAllByText } = render(<ReadingScreen />);
    expect(getAllByText('Richtig').length).toBeGreaterThan(0);
    expect(getAllByText('Falsch').length).toBeGreaterThan(0);
  });

  it('calls setAnswer when Richtig is pressed', () => {
    setup();
    const { getAllByText } = render(<ReadingScreen />);
    fireEvent.press(getAllByText('Richtig')[0]);
    expect(mockSetAnswer).toHaveBeenCalledWith('A1_m01_R1_q1', 'richtig');
  });

  it('navigates to part 2 on "Weiter →"', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Ordnen Sie zu.')).toBeTruthy();
  });

  it('renders matching dropdown for part 2 questions', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Sie suchen einen Arzt.')).toBeTruthy();
    expect(getByText('Auswahl...')).toBeTruthy();
  });

  it('opens matching dropdown and selects an option', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Auswahl...'));
    fireEvent.press(getByText('Hausarzt'));
    expect(mockSetAnswer).toHaveBeenCalledWith('A1_m01_R2_q1', 'b');
  });

  it('calls completeSection and navigates to writing on section end', () => {
    setup();
    const { getByText } = render(<ReadingScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Abschnitt beenden'));
    expect(mockCompleteSection).toHaveBeenCalledWith(
      'reading',
      expect.objectContaining({ max: 2 })
    );
    expect(mockRouterReplace).toHaveBeenCalledWith('/exam/A1_mock_01/writing');
  });

  it('shows loading when session is null', () => {
    mockUseExam.mockReturnValue({
      session: null,
      startExam: jest.fn(),
      setAnswer: jest.fn(),
      completeSection: jest.fn(),
      endExam: jest.fn(),
      resetExam: jest.fn(),
    });
    const { getByText } = render(<ReadingScreen />);
    expect(getByText('Lade Prüfung...')).toBeTruthy();
  });
});
