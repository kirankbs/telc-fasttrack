/**
 * Tests for the Listening section screen.
 *
 * These tests verify the part tab navigation, question rendering,
 * answer selection feedback (practice vs exam_sim), and the bottom bar
 * "Weiter / Abschnitt beenden" logic.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any imports that touch them
// ---------------------------------------------------------------------------

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ mockId: 'A1_mock_01' }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

// expo-audio stub — the real module requires native modules
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({
    playing: false,
    play: jest.fn(),
    pause: jest.fn(),
  }),
}));

// Stable session used across tests
const mockSetAnswer = jest.fn();
const mockCompleteSection = jest.fn();

const makeSession = (mode: 'exam_sim' | 'practice' = 'exam_sim') => ({
  mockId: 'A1_mock_01',
  level: 'A1',
  mode,
  answers: {} as Record<string, string>,
  exam: {
    id: 'A1_mock_01',
    level: 'A1',
    title: 'Übungstest 1',
    version: 1,
    sections: {
      listening: {
        totalTimeMinutes: 20,
        parts: [
          {
            partNumber: 1,
            instructions: 'Hören Sie die Gespräche.',
            instructionsTranslation: 'Listen to the conversations.',
            audioFile: 'assets/audio/A1/mock01/listening_part1.mp3',
            playCount: 2,
            questions: [
              {
                id: 'A1_m01_L1_q1',
                type: 'mcq' as const,
                questionText: 'Was kauft die Frau?',
                options: ['Brot', 'Milch', 'Käse'],
                correctAnswer: 'b',
                explanation: 'Die Frau kauft Milch.',
              },
            ],
          },
          {
            partNumber: 2,
            instructions: 'Richtig oder Falsch?',
            instructionsTranslation: 'True or false?',
            audioFile: 'assets/audio/A1/mock01/listening_part2.mp3',
            playCount: 1,
            questions: [
              {
                id: 'A1_m01_L2_q1',
                type: 'true_false' as const,
                questionText: 'Das Wetter ist schön.',
                correctAnswer: 'richtig',
                explanation: 'Ja, es ist sonnig.',
              },
            ],
          },
        ],
      },
      reading: { totalTimeMinutes: 25, parts: [] },
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
import ListeningScreen from '../../../src/app/exam/[mockId]/listening';

const mockRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>;

const mockUseExam = useExam as jest.MockedFunction<typeof useExam>;

function setupMock(mode: 'exam_sim' | 'practice' = 'exam_sim') {
  const session = makeSession(mode);
  // Mirror the real context shape
  mockUseExam.mockReturnValue({
    session,
    startExam: jest.fn(),
    setAnswer: mockSetAnswer,
    completeSection: mockCompleteSection,
    endExam: jest.fn(),
    resetExam: jest.fn(),
  });
  return session;
}

describe('ListeningScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Hören" section title', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('Hören')).toBeTruthy();
  });

  it('renders part tabs for each part', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('Teil 1')).toBeTruthy();
    expect(getByText('Teil 2')).toBeTruthy();
  });

  it('renders instructions for active part', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('Hören Sie die Gespräche.')).toBeTruthy();
    expect(getByText('Listen to the conversations.')).toBeTruthy();
  });

  it('renders MCQ question text', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('Was kauft die Frau?')).toBeTruthy();
  });

  it('renders MCQ options A, B, C', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
  });

  it('calls setAnswer when MCQ option is pressed', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    fireEvent.press(getByText('Milch'));
    expect(mockSetAnswer).toHaveBeenCalledWith('A1_m01_L1_q1', 'b');
  });

  it('shows "Weiter →" button on non-last part', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('Weiter →')).toBeTruthy();
  });

  it('advances to part 2 when "Weiter →" is pressed', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Richtig oder Falsch?')).toBeTruthy();
  });

  it('shows true/false buttons on part 2', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Richtig')).toBeTruthy();
    expect(getByText('Falsch')).toBeTruthy();
  });

  it('shows "Abschnitt beenden" on last part', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Abschnitt beenden')).toBeTruthy();
  });

  it('calls completeSection and navigates to reading on section end', () => {
    setupMock();
    const { getByText } = render(<ListeningScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Abschnitt beenden'));
    expect(mockCompleteSection).toHaveBeenCalledWith(
      'listening',
      expect.objectContaining({ max: 2 })
    );
    expect(mockRouterReplace).toHaveBeenCalledWith('/exam/A1_mock_01/reading');
  });

  it('renders timer text in exam_sim mode', () => {
    setupMock('exam_sim');
    const { getByText } = render(<ListeningScreen />);
    // Timer shows minutes:seconds — look for a colon-delimited time string
    const found = getByText(/^\d+:\d{2}$/);
    expect(found).toBeTruthy();
  });

  it('shows loading state when session is null', () => {
    mockUseExam.mockReturnValue({
      session: null,
      startExam: jest.fn(),
      setAnswer: jest.fn(),
      completeSection: jest.fn(),
      endExam: jest.fn(),
      resetExam: jest.fn(),
    });
    const { getByText } = render(<ListeningScreen />);
    expect(getByText('Lade Prüfung...')).toBeTruthy();
  });
});
