import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));

import { router } from 'expo-router';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

// Inline the fixture inside the factory — jest.mock is hoisted so any reference
// to module-level variables would be undefined at factory evaluation time.
jest.mock('../../../src/data/grammar/A1_grammar.json', () =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    level: 'A1',
    topic: `Thema ${i + 1}`,
    explanation: `Explanation for topic ${i + 1}`,
    examples: ['Example A', 'Example B', 'Example C'],
    exercises: [
      { type: 'fill_blank', prompt: 'Fill ___', correctAnswer: 'in', explanation: 'because' },
      { type: 'mcq', prompt: 'Choose', correctAnswer: 'option a', explanation: 'because' },
      { type: 'fill_blank', prompt: 'Another ___', correctAnswer: 'word', explanation: 'because' },
      { type: 'reorder', prompt: 'words / reorder / these', correctAnswer: 'Reorder these words.', explanation: 'because' },
      { type: 'mcq', prompt: 'Another MCQ', correctAnswer: 'option b', explanation: 'because' },
    ],
    orderIndex: i + 1,
  }))
);

import GrammarHubScreen from '../../../src/app/grammar/index';

// Local reference matching the inlined factory above — used for assertion loops
const TOPIC_NAMES = Array.from({ length: 12 }, (_, i) => `Thema ${i + 1}`);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GrammarHubScreen — header', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders "Grammatik" title', () => {
    const { getByText } = render(<GrammarHubScreen />);
    expect(getByText('Grammatik')).toBeTruthy();
  });

  it('renders A1 level badge', () => {
    const { getByText } = render(<GrammarHubScreen />);
    expect(getByText('A1')).toBeTruthy();
  });

  it('renders subtitle with topic count', () => {
    const { getByText } = render(<GrammarHubScreen />);
    expect(getByText(/12 Themen/)).toBeTruthy();
  });

  it('back arrow calls router.back', () => {
    const { getByTestId } = render(<GrammarHubScreen />);
    fireEvent.press(getByTestId('icon-arrow-left'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

describe('GrammarHubScreen — topic list', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all 12 topic names', () => {
    const { getByText } = render(<GrammarHubScreen />);
    TOPIC_NAMES.forEach((name) => {
      expect(getByText(name)).toBeTruthy();
    });
  });

  it('renders example and exercise counts — all 12 cards show 3 Beispiele · 5 Übungen', () => {
    const { getAllByText } = render(<GrammarHubScreen />);
    // all 12 topics share the same counts in our fixture
    expect(getAllByText('3 Beispiele · 5 Übungen')).toHaveLength(12);
  });

  it('renders order index numbers', () => {
    const { getByText } = render(<GrammarHubScreen />);
    // spot-check a few indices
    expect(getByText('1')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('tapping topic 1 navigates to /grammar/1', () => {
    const { getByText } = render(<GrammarHubScreen />);
    fireEvent.press(getByText('Thema 1'));
    expect(router.push).toHaveBeenCalledWith('/grammar/1');
  });

  it('tapping topic 7 navigates to /grammar/7', () => {
    const { getByText } = render(<GrammarHubScreen />);
    fireEvent.press(getByText('Thema 7'));
    expect(router.push).toHaveBeenCalledWith('/grammar/7');
  });
});
