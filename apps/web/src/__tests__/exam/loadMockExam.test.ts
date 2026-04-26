import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { MockExam } from '@fastrack/types';

// Stub next/navigation so notFound() doesn't throw in non-Next environments.
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

import { loadMockExam, parseMockId } from '../../lib/loadMockExam';

// loadMockExam reads CONTENT_DIR lazily per-call (not at module load time),
// so setting process.env.CONTENT_DIR in beforeAll is enough to redirect all
// file reads to our controlled temp directory.
const TEMP_DIR = join(tmpdir(), `fastrack-test-content-${process.pid}`);

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

beforeAll(() => {
  mkdirSync(join(TEMP_DIR, 'A1'), { recursive: true });
  mkdirSync(join(TEMP_DIR, 'B1'), { recursive: true });

  // mock_01 — valid exam
  writeFileSync(join(TEMP_DIR, 'A1', 'mock_01.json'), JSON.stringify(VALID_EXAM));
  // mock_02 — malformed JSON
  writeFileSync(join(TEMP_DIR, 'A1', 'mock_02.json'), '{ this is not json }');
  // mock_03 — valid JSON but missing sections (fails validateMockExam)
  writeFileSync(
    join(TEMP_DIR, 'A1', 'mock_03.json'),
    JSON.stringify({ id: 'A1_mock_03', level: 'A1', title: 'x', version: 1 }),
  );
  // mock_04 — JSON null at root
  writeFileSync(join(TEMP_DIR, 'A1', 'mock_04.json'), 'null');
  // mock_05 — JSON array at root
  writeFileSync(join(TEMP_DIR, 'A1', 'mock_05.json'), '[1, 2, 3]');

  // B1 valid mock for cross-level path check
  writeFileSync(
    join(TEMP_DIR, 'B1', 'mock_01.json'),
    JSON.stringify({ ...VALID_EXAM, id: 'B1_mock_01', level: 'B1' }),
  );

  process.env.CONTENT_DIR = TEMP_DIR;
});

afterAll(() => {
  delete process.env.CONTENT_DIR;
  rmSync(TEMP_DIR, { recursive: true, force: true });
});

describe('loadMockExam', () => {
  it('returns a parsed MockExam when the file is valid', async () => {
    const result = await loadMockExam('A1', 1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('A1_mock_01');
    expect(result?.level).toBe('A1');
  });

  it('returns null when the file does not exist (ENOENT)', async () => {
    const result = await loadMockExam('A1', 99);
    expect(result).toBeNull();
  });

  it('returns null when the file contains malformed JSON', async () => {
    const result = await loadMockExam('A1', 2);
    expect(result).toBeNull();
  });

  it('returns null when JSON is valid but fails schema validation (missing sections)', async () => {
    const result = await loadMockExam('A1', 3);
    expect(result).toBeNull();
  });

  it('returns null when JSON root is null', async () => {
    const result = await loadMockExam('A1', 4);
    expect(result).toBeNull();
  });

  it('returns null when JSON root is an array', async () => {
    const result = await loadMockExam('A1', 5);
    expect(result).toBeNull();
  });

  it('loads a B1 mock correctly (cross-level path resolution)', async () => {
    const result = await loadMockExam('B1', 1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('B1_mock_01');
  });

  it('returns null when the level directory does not exist', async () => {
    // C1 directory was not created in the temp dir
    const result = await loadMockExam('C1', 1);
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
