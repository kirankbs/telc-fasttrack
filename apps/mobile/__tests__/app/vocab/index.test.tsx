/**
 * Tests for the vocab hub screen (/vocab/index.tsx).
 *
 * Verifies stats display, the CTA button state, topic breakdown, and
 * navigation to the session route.
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
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

const mockSeedVocab = jest.fn().mockResolvedValue(undefined);
const mockGetStats = jest.fn();
jest.mock('../../../src/services/vocabularyService', () => ({
  seedVocabularyIfEmpty: (...args: unknown[]) => mockSeedVocab(...args),
  getVocabularyStats: (...args: unknown[]) => mockGetStats(...args),
}));

// Minimal vocab fixture — just enough to get topic breakdown working
jest.mock('../../../src/data/vocabulary/A1_vocabulary.json', () => [
  {
    id: 1, level: 'A1', german: 'der Name', english: 'name', article: 'der',
    topic: 'Persönliche Angaben', easeFactor: 2.5, intervalDays: 0, repetitions: 0,
    nextReviewDate: null, lastReviewedAt: null,
  },
  {
    id: 2, level: 'A1', german: 'das Haus', english: 'house', article: 'das',
    topic: 'Wohnen', easeFactor: 2.5, intervalDays: 0, repetitions: 0,
    nextReviewDate: null, lastReviewedAt: null,
  },
  {
    id: 3, level: 'A1', german: 'die Straße', english: 'street', article: 'die',
    topic: 'Wohnen', easeFactor: 2.5, intervalDays: 0, repetitions: 0,
    nextReviewDate: null, lastReviewedAt: null,
  },
]);

import VocabIndexScreen from '../../../src/app/vocab/index';
import { router } from 'expo-router';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATS_WITH_DUE = {
  total: 100,
  reviewed: 40,
  dueToday: 15,
  mastered: 8,
};

const STATS_ALL_DONE = {
  total: 100,
  reviewed: 100,
  dueToday: 0,
  mastered: 55,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VocabIndexScreen — header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockResolvedValue(STATS_WITH_DUE);
  });

  it('renders "Vokabeln" title and A1 badge', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(getByText('Vokabeln')).toBeTruthy();
      expect(getByText('A1')).toBeTruthy();
    });
  });

  it('back button calls router.back', async () => {
    const { getByTestId } = render(<VocabIndexScreen />);
    await waitFor(() => expect(getByTestId('icon-arrow-left')).toBeTruthy());
    fireEvent.press(getByTestId('icon-arrow-left'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});

describe('VocabIndexScreen — stats card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockResolvedValue(STATS_WITH_DUE);
  });

  it('displays total, reviewed, mastered, dueToday counts', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(getByText('100')).toBeTruthy();
      expect(getByText('40')).toBeTruthy();
      expect(getByText('8')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
    });
  });
});

describe('VocabIndexScreen — CTA when cards due', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockResolvedValue(STATS_WITH_DUE);
  });

  it('shows due-today CTA button', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(getByText('15 Karten heute fällig')).toBeTruthy();
    });
  });

  it('navigates to /vocab/session on CTA press', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => expect(getByText('15 Karten heute fällig')).toBeTruthy());
    fireEvent.press(getByText('15 Karten heute fällig'));
    expect(router.push).toHaveBeenCalledWith('/vocab/session?level=A1');
  });
});

describe('VocabIndexScreen — all done state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockResolvedValue(STATS_ALL_DONE);
  });

  it('shows "all done" message when dueToday is 0', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(
        getByText('Alle Karten erledigt! Nächste Wiederholung morgen.')
      ).toBeTruthy();
    });
  });

  it('does NOT show the CTA button', async () => {
    const { queryByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(queryByText(/Karten heute fällig/)).toBeNull();
    });
  });
});

describe('VocabIndexScreen — topic breakdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockResolvedValue(STATS_WITH_DUE);
  });

  it('renders topic rows from vocabulary JSON', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(getByText('Persönliche Angaben')).toBeTruthy();
      expect(getByText('Wohnen')).toBeTruthy();
    });
  });

  it('shows correct word count per topic', async () => {
    const { getByText } = render(<VocabIndexScreen />);
    await waitFor(() => {
      // Wohnen has 2 items in our fixture
      expect(getByText('2 Wörter')).toBeTruthy();
      // Persönliche Angaben has 1
      expect(getByText('1 Wörter')).toBeTruthy();
    });
  });
});

describe('VocabIndexScreen — seeding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStats.mockResolvedValue(STATS_WITH_DUE);
  });

  it('calls seedVocabularyIfEmpty on mount', async () => {
    render(<VocabIndexScreen />);
    await waitFor(() => {
      expect(mockSeedVocab).toHaveBeenCalledWith('A1', expect.any(Array));
    });
  });
});
