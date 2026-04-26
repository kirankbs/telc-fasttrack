import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MockExam } from '@fastrack/types';

// vi.mock is hoisted to the top of the file, so mockReadFile must be declared
// with vi.hoisted() to be accessible inside the factory.
const { mockReadFile } = vi.hoisted(() => ({ mockReadFile: vi.fn() }));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  return { ...actual, readFile: mockReadFile };
});

// Import the module under test after mocks are registered.
import { loadMockExam, parseMockId } from '../../lib/loadMockExam';

const VALID_EXAM: MockExam = {
  id: 'A1_mock_01',
  level: 'A1',
  title: 'Übungstest 1',
  version: 1,
  sections: {
    listening: { totalTimeMinutes: 20, parts: [] },
    reading: { totalTimeMinutes: 25, parts: [] },
    writing: { totalTimeMinutes: 20, tasks: [] },
    speaking: { totalTimeMinutes: 15, prepTimeMinutes: 0, parts: [] },
  },
};

describe('loadMockExam', () => {
  beforeEach(() => {
    mockReadFile.mockReset();
  });

  it('returns a parsed MockExam when the file is valid', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify(VALID_EXAM));

    const result = await loadMockExam('A1', 1);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('A1_mock_01');
    expect(result?.level).toBe('A1');
  });

  it('returns null when the file does not exist (ENOENT)', async () => {
    const err = Object.assign(new Error('no such file'), { code: 'ENOENT' });
    mockReadFile.mockRejectedValueOnce(err);

    const result = await loadMockExam('A1', 99);

    expect(result).toBeNull();
  });

  it('returns null when the file contains malformed JSON', async () => {
    mockReadFile.mockResolvedValueOnce('{ this is not json }');

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });

  it('returns null when JSON is valid but fails schema validation (missing sections)', async () => {
    const badExam = { id: 'A1_mock_01', level: 'A1', title: 'Test', version: 1 };
    mockReadFile.mockResolvedValueOnce(JSON.stringify(badExam));

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });

  it('returns null when JSON root is null', async () => {
    mockReadFile.mockResolvedValueOnce('null');

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });

  it('returns null when JSON root is an array', async () => {
    mockReadFile.mockResolvedValueOnce('[1, 2, 3]');

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });

  it('pads mock number to two digits in the file path', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ ...VALID_EXAM, id: 'A1_mock_05' }));

    await loadMockExam('A1', 5);

    const calledPath = mockReadFile.mock.calls[0][0] as string;
    expect(calledPath).toMatch(/mock_05\.json$/);
  });

  it('uses the correct level directory in the path', async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify({ ...VALID_EXAM, id: 'B1_mock_01', level: 'B1' }),
    );

    await loadMockExam('B1', 1);

    const calledPath = mockReadFile.mock.calls[0][0] as string;
    expect(calledPath).toMatch(/B1[/\\]mock_01\.json$/);
  });

  it('returns null on EACCES (permission denied), not a throw', async () => {
    const err = Object.assign(new Error('permission denied'), { code: 'EACCES' });
    mockReadFile.mockRejectedValueOnce(err);

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });
});

describe('parseMockId — supplemental edge cases', () => {
  it('correctly parses all five supported levels', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      const result = parseMockId(`${level}_mock_03`);
      expect(result).toEqual({ level, mockNumber: 3 });
    }
  });

  it('returns null for lowercase level', () => {
    expect(parseMockId('a1_mock_01')).toBeNull();
  });

  it('returns null for completely invalid shapes', () => {
    expect(parseMockId('not-a-mock-id')).toBeNull();
    expect(parseMockId('')).toBeNull();
    expect(parseMockId('A1_mock_')).toBeNull();
  });
});
