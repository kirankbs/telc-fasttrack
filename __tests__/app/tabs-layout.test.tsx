/**
 * Smoke tests for the bottom tab layout.
 * Verifies the component tree renders without throwing and that
 * all 5 tabs are present in the rendered output.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// Mock expo-router Tabs — we only care that our layout renders, not the
// full navigation internals.
jest.mock('expo-router', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  function Tabs({ children }: { children: React.ReactNode }) {
    return <View testID="tabs">{children}</View>;
  }

  Tabs.Screen = function Screen({ name }: { name: string }) {
    return <Text testID={`tab-screen-${name}`}>{name}</Text>;
  };

  return { Tabs };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

import TabsLayout from '../../src/app/(tabs)/_layout';

describe('TabsLayout', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<TabsLayout />);
    expect(getByTestId('tabs')).toBeTruthy();
  });

  it('includes all 5 expected tab screens', () => {
    const { getByTestId } = render(<TabsLayout />);
    expect(getByTestId('tab-screen-index')).toBeTruthy();
    expect(getByTestId('tab-screen-practice')).toBeTruthy();
    expect(getByTestId('tab-screen-exam')).toBeTruthy();
    expect(getByTestId('tab-screen-resources')).toBeTruthy();
    expect(getByTestId('tab-screen-settings')).toBeTruthy();
  });
});
