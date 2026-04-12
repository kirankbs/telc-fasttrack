/**
 * Tests for the Practice screen.
 *
 * Verifies vocabulary due count is displayed when words are pending,
 * the section drill cards are present, the vocab card navigates to /vocab,
 * and the "coming soon" alert fires for unbuilt section drills.
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

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../src/services/database', () => ({
  getVocabularyDueToday: jest.fn(),
}));

import { getVocabularyDueToday } from '../../src/services/database';
import { router } from 'expo-router';

const mockGetVocabDue = getVocabularyDueToday as jest.MockedFunction<
  typeof getVocabularyDueToday
>;

import PracticeScreen from '../../src/app/(tabs)/practice';

describe('PracticeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVocabDue.mockResolvedValue([]);
  });

  it('renders "Practice" title', async () => {
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('Practice')).toBeTruthy();
    });
  });

  it('shows vocab flashcard card', async () => {
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('Vocabulary Flashcards')).toBeTruthy();
    });
  });

  it('shows "No words due" when vocab list is empty', async () => {
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('No words due — check back tomorrow')).toBeTruthy();
    });
  });

  it('shows due word count when words are pending', async () => {
    mockGetVocabDue.mockResolvedValue(
      Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        german: `Wort${i}`,
        english: `word${i}`,
        article: null,
        topic: 'test',
      }))
    );

    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('7 words due today')).toBeTruthy();
    });
  });

  it('shows grammar topics card', async () => {
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('Grammar Topics')).toBeTruthy();
    });
  });

  it('shows all 3 section drill cards', async () => {
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('Listening Practice')).toBeTruthy();
      expect(getByText('Reading Practice')).toBeTruthy();
      expect(getByText('Writing Practice')).toBeTruthy();
    });
  });

  it('fires Alert.alert when a drill card is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => {
      expect(getByText('Listening Practice')).toBeTruthy();
    });

    fireEvent.press(getByText('Listening Practice'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Listening Practice',
      'Coming soon in the next update.'
    );
  });

  it('navigates to /vocab when Vocabulary Flashcards card is pressed', async () => {
    const { getByText } = render(<PracticeScreen />);
    await waitFor(() => expect(getByText('Vocabulary Flashcards')).toBeTruthy());
    fireEvent.press(getByText('Vocabulary Flashcards'));
    expect(router.push).toHaveBeenCalledWith('/vocab');
  });
});
