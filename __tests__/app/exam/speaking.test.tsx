/**
 * Tests for the Speaking section screen.
 *
 * Covers part tabs, part type badge, prompt card, collapsible sample response,
 * self-assessment stepper on last part, and "Prüfung abschließen" navigation.
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
      writing: { totalTimeMinutes: 20, tasks: [] },
      speaking: {
        totalTimeMinutes: 15,
        prepTimeMinutes: 0,
        parts: [
          {
            partNumber: 1,
            type: 'introduce' as const,
            instructions: 'Stellen Sie sich vor.',
            instructionsTranslation: 'Introduce yourself.',
            prompt: 'Sagen Sie, wie Sie heißen und woher Sie kommen.',
            sampleResponse: 'Mein Name ist Maria. Ich komme aus Spanien.',
            evaluationTips: ['Sprechen Sie deutlich.'],
            keyPhrases: ['Ich heiße...', 'Ich komme aus...'],
          },
          {
            partNumber: 2,
            type: 'picture_cards' as const,
            instructions: 'Beschreiben Sie das Bild.',
            instructionsTranslation: 'Describe the picture.',
            prompt: 'Was sehen Sie auf dem Bild?',
            sampleResponse: 'Ich sehe einen Supermarkt.',
            evaluationTips: ['Verwenden Sie Adjektive.'],
            keyPhrases: ['Ich sehe...', 'Links ist...'],
          },
          {
            partNumber: 3,
            type: 'und_du' as const,
            instructions: 'Stellen Sie Fragen.',
            instructionsTranslation: 'Ask questions.',
            prompt: 'Fragen Sie Ihren Partner nach Hobbys.',
            sampleResponse: 'Was machst du in deiner Freizeit?',
            evaluationTips: ['Zeigen Sie Interesse.'],
            keyPhrases: ['Was machst du...?'],
          },
        ],
      },
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
import SpeakingScreen from '../../../src/app/exam/[mockId]/speaking';

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

describe('SpeakingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Sprechen" section title', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Sprechen')).toBeTruthy();
  });

  it('renders total time allowed', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('15 Minuten')).toBeTruthy();
  });

  it('renders part tabs for all 3 parts', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Teil 1')).toBeTruthy();
    expect(getByText('Teil 2')).toBeTruthy();
    expect(getByText('Teil 3')).toBeTruthy();
  });

  it('shows "Sich vorstellen" part type badge on part 1', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Sich vorstellen')).toBeTruthy();
  });

  it('renders part 1 instructions', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Stellen Sie sich vor.')).toBeTruthy();
    expect(getByText('Introduce yourself.')).toBeTruthy();
  });

  it('renders prompt card text', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(
      getByText('Sagen Sie, wie Sie heißen und woher Sie kommen.')
    ).toBeTruthy();
  });

  it('renders key phrases', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText(/Ich heiße/)).toBeTruthy();
    expect(getByText(/Ich komme aus/)).toBeTruthy();
  });

  it('renders evaluation tips', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText(/Sprechen Sie deutlich/)).toBeTruthy();
  });

  it('renders "Bildkarte" image placeholder', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Bildkarte')).toBeTruthy();
  });

  it('shows "Beispielantwort anzeigen" collapsible trigger', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Beispielantwort anzeigen')).toBeTruthy();
  });

  it('expands sample response on toggle press', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    fireEvent.press(getByText('Beispielantwort anzeigen'));
    expect(
      getByText('Mein Name ist Maria. Ich komme aus Spanien.')
    ).toBeTruthy();
  });

  it('shows "Weiter →" on non-last parts', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Weiter →')).toBeTruthy();
  });

  it('navigates to part 2 on "Weiter →"', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Bild und Wortkarte')).toBeTruthy();
  });

  it('shows self-assessment stepper on last part', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Sprechen wird manuell bewertet')).toBeTruthy();
  });

  it('shows "Prüfung abschließen" button on last part', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Weiter →'));
    expect(getByText('Prüfung abschließen')).toBeTruthy();
  });

  it('calls completeSection and navigates to score on finish', () => {
    setup();
    const { getByText } = render(<SpeakingScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Prüfung abschließen'));
    expect(mockCompleteSection).toHaveBeenCalledWith(
      'speaking',
      expect.objectContaining({ max: 24 })
    );
    expect(mockRouterReplace).toHaveBeenCalledWith('/exam/A1_mock_01/score');
  });

  it('increments speaking score stepper', () => {
    setup();
    const { getByText, getByLabelText } = render(<SpeakingScreen />);
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByText('Weiter →'));
    fireEvent.press(getByLabelText('Punkt hinzufügen'));
    expect(mockSetAnswer).toHaveBeenCalledWith('speaking_part_1', '1');
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
    const { getByText } = render(<SpeakingScreen />);
    expect(getByText('Lade Prüfung...')).toBeTruthy();
  });
});
