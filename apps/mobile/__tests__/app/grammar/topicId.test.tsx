import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

import { useLocalSearchParams, router } from 'expo-router';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

// Inline the fixture in the factory — jest.mock is hoisted above module-level
// const declarations, so any external variable reference would be undefined.
jest.mock('../../../src/data/grammar/A1_grammar.json', () => [
  {
    id: 1,
    level: 'A1',
    topic: 'Präsens — regelmäßige Verben',
    explanation: 'Regular verbs follow a predictable pattern.',
    examples: [
      'Ich lerne Deutsch.',
      'Du spielst Fußball.',
      'Er kommt aus Berlin.',
    ],
    exercises: [
      {
        type: 'fill_blank',
        prompt: 'Ich ___ (lernen) jeden Tag Deutsch.',
        correctAnswer: 'lerne',
        explanation: 'First person singular: lern + e',
      },
      {
        type: 'mcq',
        prompt: 'Wir ___ in einer kleinen Stadt.',
        correctAnswer: 'wohnen',
        explanation: 'First person plural: wohnen',
      },
      {
        type: 'reorder',
        prompt: 'kaufe / Ich / Brot / heute',
        correctAnswer: 'Ich kaufe heute Brot.',
        explanation: 'SVO order.',
      },
    ],
    orderIndex: 1,
  },
  {
    id: 2,
    level: 'A1',
    topic: 'Präsens — sein und haben',
    explanation: 'sein and haben are irregular.',
    examples: ['Ich bin Studentin.', 'Du bist sehr nett.'],
    exercises: [
      {
        type: 'fill_blank',
        prompt: 'Ich ___ (sein) 25 Jahre alt.',
        correctAnswer: 'bin',
        explanation: 'First person singular of sein is bin.',
      },
    ],
    orderIndex: 2,
  },
  {
    id: 3,
    level: 'A1',
    topic: 'Grundwortstellung',
    explanation: 'SVO word order.',
    examples: ['Ich kaufe Brot.'],
    exercises: [],
    orderIndex: 3,
  },
]);

import GrammarTopicScreen from '../../../src/app/grammar/[topicId]';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderTopic(topicId: string) {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ topicId });
  return render(<GrammarTopicScreen />);
}

// ---------------------------------------------------------------------------
// Topic 1 — explanation and examples
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — explanation and examples', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders topic title', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Präsens — regelmäßige Verben')).toBeTruthy();
  });

  it('renders explanation text', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Regular verbs follow a predictable pattern.')).toBeTruthy();
  });

  it('renders all three example sentences', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Ich lerne Deutsch.')).toBeTruthy();
    expect(getByText('Du spielst Fußball.')).toBeTruthy();
    expect(getByText('Er kommt aus Berlin.')).toBeTruthy();
  });

  it('renders "Beispiele" section label', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Beispiele')).toBeTruthy();
  });

  it('renders "Übungen" section label when exercises exist', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Übungen')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Topic 1 — exercise counter
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — exercise counter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows "Übung 1 von 3" for first exercise', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Übung 1 von 3')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Topic 1 — fill_blank exercise
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — fill_blank exercise', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the fill_blank prompt', () => {
    const { getByText } = renderTopic('1');
    expect(getByText('Ich ___ (lernen) jeden Tag Deutsch.')).toBeTruthy();
  });

  it('Überprüfen button is disabled when input is empty', () => {
    const { getByText } = renderTopic('1');
    const btn = getByText('Überprüfen');
    // disabled prop is set — pressing should not trigger check
    fireEvent.press(btn);
    // checked state remains false — no feedback shown
    expect(() => getByText(/Richtig!/)).toThrow();
    expect(() => getByText(/Falsch/)).toThrow();
  });

  it('shows correct feedback after correct answer', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    // "Richtig! lerne" is the feedback line — distinct from the prompt text
    expect(getByText('Richtig! lerne')).toBeTruthy();
  });

  it('shows incorrect feedback after wrong answer', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lernt');
    fireEvent.press(getByText('Überprüfen'));
    // "Falsch. Richtig: lerne" is the feedback line
    expect(getByText('Falsch. Richtig: lerne')).toBeTruthy();
  });

  it('shows explanation after checking', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    expect(getByText('First person singular: lern + e')).toBeTruthy();
  });

  it('is case-insensitive for correct answer check', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'LERNE');
    fireEvent.press(getByText('Überprüfen'));
    expect(getByText(/Richtig!/)).toBeTruthy();
  });

  it('shows "Weiter" after checking a non-last exercise', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    expect(getByText('Weiter')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Topic 1 — navigation through exercises
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — exercise navigation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('advances to exercise 2 after pressing Weiter', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    fireEvent.press(getByText('Weiter'));
    expect(getByText('Übung 2 von 3')).toBeTruthy();
    // MCQ prompt visible
    expect(getByText('Wir ___ in einer kleinen Stadt.')).toBeTruthy();
  });

  it('shows completion card after checking the last exercise', () => {
    const { getByText, getByPlaceholderText } = renderTopic('1');
    // Ex 1
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    fireEvent.press(getByText('Weiter'));
    // Ex 2 — MCQ, select the correct option
    fireEvent.press(getByText('wohnen'));
    fireEvent.press(getByText('Überprüfen'));
    fireEvent.press(getByText('Weiter'));
    // Ex 3 (last — reorder): checking it triggers allDone → completion card shows
    expect(getByText('Übung 3 von 3')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'Ich kaufe heute Brot.');
    fireEvent.press(getByText('Überprüfen'));
    // Completion card replaces the exercise card immediately
    expect(getByText('Alle Übungen abgeschlossen!')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Topic 1 — MCQ exercise
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — mcq exercise (exercise 2)', () => {
  beforeEach(() => jest.clearAllMocks());

  function advanceToMcq() {
    const utils = renderTopic('1');
    const { getByText, getByPlaceholderText } = utils;
    // complete ex 1
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    fireEvent.press(getByText('Weiter'));
    return utils;
  }

  it('renders MCQ prompt on exercise 2', () => {
    const { getByText } = advanceToMcq();
    expect(getByText('Wir ___ in einer kleinen Stadt.')).toBeTruthy();
  });

  it('selecting an option and checking shows feedback', () => {
    const { getByText } = advanceToMcq();
    fireEvent.press(getByText('wohnen'));
    fireEvent.press(getByText('Überprüfen'));
    expect(getByText(/Richtig!/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Topic 1 — completion card
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — completion card', () => {
  beforeEach(() => jest.clearAllMocks());

  function completeAllExercises() {
    const utils = renderTopic('1');
    const { getByText, getByPlaceholderText } = utils;
    // Ex 1 — correct
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'lerne');
    fireEvent.press(getByText('Überprüfen'));
    fireEvent.press(getByText('Weiter'));
    // Ex 2 — MCQ correct
    fireEvent.press(getByText('wohnen'));
    fireEvent.press(getByText('Überprüfen'));
    fireEvent.press(getByText('Weiter'));
    // Ex 3 — reorder, wrong answer on purpose.
    // After checking the last exercise allDone becomes true, completion card renders immediately.
    fireEvent.changeText(getByPlaceholderText('Ihre Antwort...'), 'wrong answer');
    fireEvent.press(getByText('Überprüfen'));
    return utils;
  }

  it('shows "Alle Übungen abgeschlossen!" after all exercises', () => {
    const { getByText } = completeAllExercises();
    expect(getByText('Alle Übungen abgeschlossen!')).toBeTruthy();
  });

  it('shows correct score (2 of 3 correct)', () => {
    const { getByText } = completeAllExercises();
    expect(getByText(/2 von 3 richtig/)).toBeTruthy();
  });

  it('shows percentage', () => {
    const { getByText } = completeAllExercises();
    expect(getByText(/67%/)).toBeTruthy();
  });

  it('"Nächstes Thema" navigates to topic 2', () => {
    const { getByText } = completeAllExercises();
    fireEvent.press(getByText('Nächstes Thema'));
    expect(router.replace).toHaveBeenCalledWith('/grammar/2');
  });

  it('"Zurück zur Übersicht" calls router.back', () => {
    const { getByText } = completeAllExercises();
    fireEvent.press(getByText('Zurück zur Übersicht'));
    expect(router.back).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Prev/Next topic navigation in header
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — prev/next topic navigation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('prev arrow is disabled on topic 1', () => {
    // The icon is rendered with textDisabled color — test that pressing it
    // does NOT call router.replace
    const { getByTestId } = renderTopic('1');
    fireEvent.press(getByTestId('icon-chevron-left'));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('next arrow navigates to topic 2 from topic 1', () => {
    const { getByTestId } = renderTopic('1');
    fireEvent.press(getByTestId('icon-chevron-right'));
    expect(router.replace).toHaveBeenCalledWith('/grammar/2');
  });

  it('next arrow is disabled on last topic (topic 3 in fixture)', () => {
    const { getByTestId } = renderTopic('3');
    fireEvent.press(getByTestId('icon-chevron-right'));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('prev arrow navigates to topic 1 from topic 2', () => {
    const { getByTestId } = renderTopic('2');
    fireEvent.press(getByTestId('icon-chevron-left'));
    expect(router.replace).toHaveBeenCalledWith('/grammar/1');
  });
});

// ---------------------------------------------------------------------------
// Topic with no exercises
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — topic with no exercises', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not render "Übungen" section when exercises array is empty', () => {
    const { queryByText } = renderTopic('3');
    expect(queryByText('Übungen')).toBeNull();
  });

  it('still renders explanation and examples', () => {
    const { getByText } = renderTopic('3');
    expect(getByText('SVO word order.')).toBeTruthy();
    expect(getByText('Ich kaufe Brot.')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Unknown topicId
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — unknown topicId', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders error message for topicId not in data', () => {
    const { getByText } = renderTopic('99');
    expect(getByText('Thema nicht gefunden.')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Header navigation
// ---------------------------------------------------------------------------

describe('GrammarTopicScreen — back button', () => {
  beforeEach(() => jest.clearAllMocks());

  it('back arrow calls router.back', () => {
    const { getByTestId } = renderTopic('2');
    fireEvent.press(getByTestId('icon-arrow-left'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('shows nav counter "2/3" for topic 2', () => {
    const { getByText } = renderTopic('2');
    expect(getByText('2/3')).toBeTruthy();
  });
});
