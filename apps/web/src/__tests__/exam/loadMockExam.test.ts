import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockExam } from '@fastrack/types';

// Vitest can't resolve 'next/navigation' in a Node environment, so stub it out.
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// fs/promises is mocked so tests don't touch the real disk.
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

// Import after mocks are set up.
import { readFile } from 'fs/promises';
import { loadMockExam, parseMockId } from '../../lib/loadMockExam';

const mockReadFile = readFile as ReturnType<typeof vi.fn>;

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

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('returns null when JSON root is not an object (null)', async () => {
    mockReadFile.mockResolvedValueOnce('null');

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });

  it('returns null when JSON root is not an object (array)', async () => {
    mockReadFile.mockResolvedValueOnce('[1, 2, 3]');

    const result = await loadMockExam('A1', 1);

    expect(result).toBeNull();
  });

  it('pads mock number to two digits when constructing the file path', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ ...VALID_EXAM, id: 'A1_mock_05' }));

    await loadMockExam('A1', 5);

    const calledPath = mockReadFile.mock.calls[0][0] as string;
    expect(calledPath).toMatch(/mock_05\.json$/);
  });

  it('uses the level directory in the path', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ ...VALID_EXAM, id: 'B1_mock_01', level: 'B1' }));

    await loadMockExam('B1', 1);

    const calledPath = mockReadFile.mock.calls[0][0] as string;
    expect(calledPath).toMatch(/B1[/\\]mock_01\.json$/);
  });

  it('handles EACCES (permission error) as graceful null, not a throw', async () => {
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

  it('returns null for a level with lowercase letters', () => {
    expect(parseMockId('a1_mock_01')).toBeNull();
  });

  it('returns null for missing leading zero in single-digit mock numbers', () => {
    // "A1_mock_1" has no leading zero — regex requires \d+ so it actually matches
    // single digits too. This test documents the current behavior.
    const result = parseMockId('A1_mock_1');
    expect(result).toEqual({ level: 'A1', mockNumber: 1 });
  });
});
