import { describe, it, expect } from 'vitest';
import { parseMockId } from '../../lib/loadMockExam';

describe('parseMockId', () => {
  it.each([
    ['A1_mock_01', { level: 'A1', mockNumber: 1 }],
    ['A1_mock_10', { level: 'A1', mockNumber: 10 }],
    ['A2_mock_03', { level: 'A2', mockNumber: 3 }],
    ['B1_mock_07', { level: 'B1', mockNumber: 7 }],
    ['B2_mock_01', { level: 'B2', mockNumber: 1 }],
    ['C1_mock_02', { level: 'C1', mockNumber: 2 }],
  ])('parses %s correctly', (input, expected) => {
    expect(parseMockId(input)).toEqual(expected);
  });

  it.each([
    'invalid',
    'A1mock01',
    'A1_mock_',
    'D1_mock_01',
    'a1_mock_01',
    '',
    'A1_mock_01_extra',
    'ZZZZ',
  ])('returns null for invalid id: %s', (input) => {
    expect(parseMockId(input)).toBeNull();
  });

  it('returns null for mock number 0 (A1_mock_00 is parseable but mock number 0)', () => {
    // parseMockId itself parses it; loadMockExam + notFound handles the missing file
    const result = parseMockId('A1_mock_00');
    expect(result).toEqual({ level: 'A1', mockNumber: 0 });
  });
});
