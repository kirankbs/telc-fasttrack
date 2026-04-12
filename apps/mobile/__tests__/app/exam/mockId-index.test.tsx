/**
 * Tests for the Exam Start screen (/exam/[mockId]/index.tsx).
 *
 * Covers: loading state, section overview render, mode selector interaction,
 * past attempts display, and the start button navigation flow.
 */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const mockLoadMockExam = jest.fn();
jest.mock('../../../src/services/contentLoader', () => ({
  loadMockExam: (...args: unknown[]) => mockLoadMockExam(...args),
}));

const mockGetAllAsync = jest.fn().mockResolvedValue([]);
jest.mock('../../../src/services/database', () => ({
  getDatabase: jest.fn().mockResolvedValue({
    getAllAsync: (...args: unknown[]) => mockGetAllAsync(...args),
  }),
}));

const mockStartExam = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../src/context/ExamContext', () => ({
  useExam: () => ({
    session: null,
    startExam: mockStartExam,
    setAnswer: jest.fn(),
    completeSection: jest.fn(),
    endExam: jest.fn(),
    resetExam: jest.fn(),
  }),
}));

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('01. Apr 2026'),
}));

import { router, useLocalSearchParams } from 'expo-router';
import ExamStartScreen from '../../../src/app/exam/[mockId]/index';

const mockRouterPush = router.push as jest.MockedFunction<typeof router.push>;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

function buildExam() {
  return {
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
            instructions: '',
            instructionsTranslation: '',
            audioFile: '',
            playCount: 2,
            questions: [
              { id: 'L_q1', type: 'mcq', questionText: 'Q', options: ['a'], correctAnswer: 'a', explanation: '' },
            ],
          },
        ],
      },
      reading: {
        totalTimeMinutes: 25,
        parts: [
          {
            partNumber: 1,
            instructions: '',
            instructionsTranslation: '',
            texts: [],
            questions: [
              { id: 'R_q1', type: 'true_false', questionText: 'Q', correctAnswer: 'richtig', explanation: '' },
            ],
          },
        ],
      },
      writing: {
        totalTimeMinutes: 20,
        tasks: [
          {
            taskNumber: 1,
            type: 'short_message',
            instructions: '',
            instructionsTranslation: '',
            sampleAnswer: '',
            scoringCriteria: [{ criterion: 'Inhalt', maxPoints: 12, description: '' }],
          },
        ],
      },
      speaking: {
        totalTimeMinutes: 15,
        prepTimeMinutes: 0,
        parts: [
          {
            partNumber: 1,
            instructions: '',
            instructionsTranslation: '',
            type: 'introduce',
            prompt: '',
            sampleResponse: '',
            evaluationTips: [],
            keyPhrases: [],
          },
          {
            partNumber: 2,
            instructions: '',
            instructionsTranslation: '',
            type: 'picture_cards',
            prompt: '',
            sampleResponse: '',
            evaluationTips: [],
            keyPhrases: [],
          },
          {
            partNumber: 3,
            instructions: '',
            instructionsTranslation: '',
            type: 'und_du',
            prompt: '',
            sampleResponse: '',
            evaluationTips: [],
            keyPhrases: [],
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExamStartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ mockId: 'A1_mock_01' });
    mockLoadMockExam.mockResolvedValue(buildExam());
    mockGetAllAsync.mockResolvedValue([]);
    mockStartExam.mockResolvedValue(undefined);
  });

  it('renders without crashing while loading', () => {
    const { toJSON } = render(<ExamStartScreen />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders exam title after load', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Übungstest 1')).toBeTruthy();
    });
  });

  it('renders all four section rows', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Hören')).toBeTruthy();
      expect(getByText('Lesen')).toBeTruthy();
      expect(getByText('Schreiben')).toBeTruthy();
      expect(getByText('Sprechen')).toBeTruthy();
    });
  });

  it('shows correct section durations (at least one of each)', async () => {
    const { getAllByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      // Hören = 20 min, writing = 20 min — two occurrences expected
      expect(getAllByText('20 min').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('25 min').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('15 min').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders both mode cards', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Prüfungssimulation')).toBeTruthy();
      expect(getByText('Übungsmodus')).toBeTruthy();
    });
  });

  it('defaults to Übungsmodus (practice mode) subtitle', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Ohne Zeitdruck, sofortiges Feedback')).toBeTruthy();
    });
  });

  it('shows "Noch keine Versuche" when no past attempts', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Noch keine Versuche')).toBeTruthy();
    });
  });

  it('renders past attempt rows when DB returns data', async () => {
    mockGetAllAsync.mockResolvedValue([
      {
        id: 1,
        completed_at: '2026-04-01T10:00:00',
        total_score: 50,
        total_max: 84,
        passed: 1,
      },
    ]);
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Bestanden')).toBeTruthy();
    });
  });

  it('calls startExam with correct args on start button press', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Prüfung starten')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByText('Prüfung starten'));
    });

    expect(mockStartExam).toHaveBeenCalledWith(
      'A1_mock_01',
      'A1',
      expect.objectContaining({ id: 'A1_mock_01' }),
      'practice'
    );
  });

  it('navigates to listening screen after start', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Prüfung starten')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByText('Prüfung starten'));
    });

    expect(mockRouterPush).toHaveBeenCalledWith('/exam/A1_mock_01/listening');
  });

  it('shows error state for an invalid mockId', async () => {
    mockUseLocalSearchParams.mockReturnValue({ mockId: 'bad_id' });
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Ungültige Mock-ID')).toBeTruthy();
    });
  });

  it('shows error state when contentLoader throws', async () => {
    mockLoadMockExam.mockRejectedValue(new Error('File not found'));
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('Prüfung konnte nicht geladen werden.')).toBeTruthy();
    });
  });

  it('renders the A1 level badge', async () => {
    const { getByText } = render(<ExamStartScreen />);
    await waitFor(() => {
      expect(getByText('A1')).toBeTruthy();
    });
  });
});
