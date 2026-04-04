/**
 * Tests for the Settings screen.
 *
 * Verifies level display, goal options, and that the reset confirmation
 * dialog fires correctly.
 */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const mockRunAsync = jest.fn().mockResolvedValue(undefined);
const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetDatabase = jest.fn().mockResolvedValue({
  runAsync: mockRunAsync,
  execAsync: mockExecAsync,
});

jest.mock('../../src/services/database', () => ({
  getUserSettings: jest.fn(),
  updateSelectedLevel: jest.fn().mockResolvedValue(undefined),
  getDatabase: () => mockGetDatabase(),
}));

import {
  getUserSettings,
  updateSelectedLevel,
} from '../../src/services/database';

const mockGetUserSettings = getUserSettings as jest.MockedFunction<typeof getUserSettings>;

import SettingsScreen from '../../src/app/(tabs)/settings';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserSettings.mockResolvedValue({
      selected_level: 'A1',
      daily_study_minutes: 30,
      notifications_enabled: 1,
      onboarding_complete: 0,
    });
  });

  it('renders "Settings" title', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  it('renders all 5 level options', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('A1')).toBeTruthy();
      expect(getByText('A2')).toBeTruthy();
      expect(getByText('B1')).toBeTruthy();
      expect(getByText('B2')).toBeTruthy();
      expect(getByText('C1')).toBeTruthy();
    });
  });

  it('renders all 4 daily goal options', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('15m')).toBeTruthy();
      expect(getByText('30m')).toBeTruthy();
      expect(getByText('45m')).toBeTruthy();
      expect(getByText('60m')).toBeTruthy();
    });
  });

  it('shows "Reset all progress" button', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('Reset all progress')).toBeTruthy();
    });
  });

  it('shows Alert.alert when A2 level is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('A2')).toBeTruthy();
    });

    fireEvent.press(getByText('A2'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Level locked',
      'Complete A1 content first to unlock higher levels.'
    );
  });

  it('shows reset confirmation dialog when reset button pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('Reset all progress')).toBeTruthy();
    });

    fireEvent.press(getByText('Reset all progress'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Reset all progress?',
      expect.stringContaining('cannot be undone'),
      expect.any(Array)
    );
  });

  it('calls updateSelectedLevel when A1 is re-pressed (no-op since already selected)', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('A1')).toBeTruthy();
    });

    fireEvent.press(getByText('A1'));
    // Already selected → should not call updateSelectedLevel
    expect(updateSelectedLevel).not.toHaveBeenCalled();
  });

  it('displays app version string', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('1.0.0')).toBeTruthy();
    });
  });
});
