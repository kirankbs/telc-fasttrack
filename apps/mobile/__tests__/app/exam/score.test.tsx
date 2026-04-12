/**
 * Tests for the Score Report screen (/exam/[mockId]/score.tsx).
 *
 * Covers: pass/fail hero rendering, section breakdown table, partition summary,
 * the 60% rule reminder, and action button navigation.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn().mockReturnValue({ mockId: 'A1_mock_01' }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const mockEndExam = jest.fn();
const mockResetExam = jest.fn();
const mockSessionData = {
  mockId: 'A1_mock_01',
  level: 'A1',
  mode: 'practice' as const,
  exam: {} as any,
};

jest.mock('../../../src/context/ExamContext', () => ({
  useExam: () => ({
    session: mockSessionData,
    startExam: jest.fn(),
    setAnswer: jest.fn(),
    completeSection: jest.fn(),
    endExam: mockEndExam,
    resetExam: mockResetExam,
  }),
}));

import { router } from 'expo-router';
import ScoreScreen from '../../../src/app/exam/[mockId]/score';

const mockRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>;

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

type SectionResult = { earned: number; max: number; percentage: number; passed: boolean };

interface ExamScoreShape {
  listening: SectionResult;
  reading: SectionResult;
  writing: SectionResult;
  speaking: SectionResult;
  written: SectionResult;
  oral: SectionResult;
  overall: SectionResult;
  passed: boolean;
  sprachbausteine?: SectionResult;
}

function makeScore(overrides: Partial<ExamScoreShape> = {}): ExamScoreShape {
  return {
    listening: { earned: 18, max: 24, percentage: 0.75, passed: true },
    reading:   { earned: 16, max: 24, percentage: 0.667, passed: true },
    writing:   { earned: 8,  max: 12, percentage: 0.667, passed: true },
    speaking:  { earned: 14, max: 24, percentage: 0.583, passed: false },
    written:   { earned: 42, max: 60, percentage: 0.7,   passed: true },
    oral:      { earned: 14, max: 24, percentage: 0.583, passed: false },
    // 56/84 = 0.6666… → rounds to 67%
    overall:   { earned: 56, max: 84, percentage: 0.6667, passed: false },
    passed: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ScoreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEndExam.mockResolvedValue(makeScore());
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('NICHT BESTANDEN')).toBeTruthy();
    });
  });

  it('shows BESTANDEN when exam is passed', async () => {
    const passed = makeScore({
      speaking: { earned: 20, max: 24, percentage: 0.833, passed: true },
      oral:     { earned: 20, max: 24, percentage: 0.833, passed: true },
      overall:  { earned: 62, max: 84, percentage: 0.738, passed: true },
      passed: true,
    });
    mockEndExam.mockResolvedValue(passed);

    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('BESTANDEN')).toBeTruthy();
    });
  });

  it('shows correct overall percentage in the hero', async () => {
    const { getAllByText } = render(<ScoreScreen />);
    await waitFor(() => {
      // 56/84 → 67%; may also appear in section rows — at least one instance expected
      const matches = getAllByText('67%');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders all four section labels', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('Hören')).toBeTruthy();
      expect(getByText('Lesen')).toBeTruthy();
      expect(getByText('Schreiben')).toBeTruthy();
      expect(getByText('Sprechen')).toBeTruthy();
    });
  });

  it('renders section score fractions', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('18/24')).toBeTruthy();
      expect(getByText('16/24')).toBeTruthy();
      expect(getByText('8/12')).toBeTruthy();
      expect(getByText('14/24')).toBeTruthy();
    });
  });

  it('renders partition labels', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('Schriftlich')).toBeTruthy();
      expect(getByText('Mündlich')).toBeTruthy();
    });
  });

  it('shows the 60% rule reminder when failed', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(
        getByText(/60%.*schriftlich.*mündlich/i)
      ).toBeTruthy();
    });
  });

  it('does NOT show the 60% rule reminder when passed', async () => {
    const passed = makeScore({
      speaking: { earned: 20, max: 24, percentage: 0.833, passed: true },
      oral:     { earned: 20, max: 24, percentage: 0.833, passed: true },
      overall:  { earned: 62, max: 84, percentage: 0.738, passed: true },
      passed: true,
    });
    mockEndExam.mockResolvedValue(passed);

    const { queryByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(queryByText(/60%.*schriftlich.*mündlich/i)).toBeNull();
    });
  });

  it('calls endExam exactly once on mount', async () => {
    render(<ScoreScreen />);
    await waitFor(() => {
      expect(mockEndExam).toHaveBeenCalledTimes(1);
    });
  });

  it('"Erneut versuchen" navigates back to the exam start screen', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('Erneut versuchen')).toBeTruthy();
    });
    fireEvent.press(getByText('Erneut versuchen'));
    expect(mockRouterReplace).toHaveBeenCalledWith('/exam/A1_mock_01');
  });

  it('"Zur Übersicht" calls resetExam and navigates to exam tab', async () => {
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('Zur Übersicht')).toBeTruthy();
    });
    fireEvent.press(getByText('Zur Übersicht'));
    expect(mockResetExam).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/exam');
  });

  it('shows error fallback when endExam returns null', async () => {
    mockEndExam.mockResolvedValue(null);
    const { getByText } = render(<ScoreScreen />);
    await waitFor(() => {
      expect(getByText('Ergebnis konnte nicht geladen werden.')).toBeTruthy();
    });
  });
});
