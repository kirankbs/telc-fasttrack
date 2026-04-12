/**
 * Tests for the Exam selection screen.
 *
 * Verifies the mock list renders correctly and that locked/unlocked state
 * is reflected based on the AVAILABLE_MOCKS set and the DB attempt records.
 */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('../../src/services/database', () => ({
  getRecentAttempts: jest.fn(),
}));

import { getRecentAttempts } from '../../src/services/database';
import { router } from 'expo-router';

const mockGetRecentAttempts = getRecentAttempts as jest.MockedFunction<typeof getRecentAttempts>;
const mockRouterPush = router.push as jest.MockedFunction<typeof router.push>;

import ExamScreen from '../../src/app/(tabs)/exam';

describe('ExamScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRecentAttempts.mockResolvedValue([]);
  });

  it('renders "Practice Exams" title', async () => {
    const { getByText } = render(<ExamScreen />);
    await waitFor(() => {
      expect(getByText('Practice Exams')).toBeTruthy();
    });
  });

  it('renders all 10 mock titles', async () => {
    const { getByText } = render(<ExamScreen />);
    await waitFor(() => {
      for (let i = 1; i <= 10; i++) {
        expect(getByText(`Übungstest ${i}`)).toBeTruthy();
      }
    });
  });

  it('shows "Coming soon" for mocks 2–10', async () => {
    const { getAllByText } = render(<ExamScreen />);
    await waitFor(() => {
      const locked = getAllByText('Coming soon');
      expect(locked).toHaveLength(9);
    });
  });

  it('shows "Not started" status for mock 1', async () => {
    const { getByText } = render(<ExamScreen />);
    await waitFor(() => {
      expect(getByText('Not started')).toBeTruthy();
    });
  });

  it('navigates to exam detail when mock_01 card is pressed', async () => {
    const { getByText } = render(<ExamScreen />);
    await waitFor(() => {
      expect(getByText('Übungstest 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Übungstest 1'));
    expect(mockRouterPush).toHaveBeenCalledWith('/exam/A1_mock_01');
  });

  it('shows "Passed" status when attempt is passed', async () => {
    mockGetRecentAttempts.mockResolvedValue([
      {
        id: 1,
        mock_id: 'A1_mock_01',
        total_score: 20,
        total_max: 30,
        passed: 1,
        completed_at: '2026-04-01T12:00:00',
      },
    ]);

    const { getByText } = render(<ExamScreen />);
    await waitFor(() => {
      expect(getByText('Passed')).toBeTruthy();
    });
  });
});
