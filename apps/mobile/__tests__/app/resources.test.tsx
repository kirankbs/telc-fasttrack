/**
 * Tests for the Resources screen.
 *
 * Verifies all 4 resource entries are rendered and that Linking.openURL
 * is called when a card is tapped.
 */
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const mockCanOpenURL = jest.fn().mockResolvedValue(true);
const mockOpenURL = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-linking', () => ({
  canOpenURL: (url: string) => mockCanOpenURL(url),
  openURL: (url: string) => mockOpenURL(url),
}));

import ResourcesScreen from '../../src/app/(tabs)/resources';

describe('ResourcesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Resources" title', () => {
    const { getByText } = render(<ResourcesScreen />);
    expect(getByText('Resources')).toBeTruthy();
  });

  it('renders all 4 resource items', () => {
    const { getByText } = render(<ResourcesScreen />);
    expect(getByText('telc.net Official Mocks')).toBeTruthy();
    expect(getByText('Goethe A1 Wortliste')).toBeTruthy();
    expect(getByText("Deutsche Welle — Nico's Weg")).toBeTruthy();
    expect(getByText('Schubert Verlag Exercises')).toBeTruthy();
  });

  it('calls Linking.openURL when telc card is pressed', async () => {
    const { getByText } = render(<ResourcesScreen />);
    fireEvent.press(getByText('telc.net Official Mocks'));

    await waitFor(() => {
      expect(mockOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('telc.net')
      );
    });
  });

  it('does not call openURL when canOpenURL returns false', async () => {
    mockCanOpenURL.mockResolvedValueOnce(false);
    const { getByText } = render(<ResourcesScreen />);
    fireEvent.press(getByText('Goethe A1 Wortliste'));

    await waitFor(() => {
      expect(mockOpenURL).not.toHaveBeenCalled();
    });
  });

  it('renders the disclaimer text', () => {
    const { getByText } = render(<ResourcesScreen />);
    expect(
      getByText(/External links open in your browser/)
    ).toBeTruthy();
  });
});
