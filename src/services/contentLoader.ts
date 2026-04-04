import type { MockExam } from '../types/exam';

// Static asset map — dynamic require() is not supported by Metro bundler.
// Add new entries here as mock JSON files are created.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_ASSET_MAP: Record<string, any> = {
  // A1
  A1_mock_01: require('../../assets/content/A1/mock_01.json'),
  A1_mock_02: require('../../assets/content/A1/mock_02.json'),
  A1_mock_03: require('../../assets/content/A1/mock_03.json'),
  A1_mock_04: require('../../assets/content/A1/mock_04.json'),
  A1_mock_05: require('../../assets/content/A1/mock_05.json'),
  A1_mock_06: require('../../assets/content/A1/mock_06.json'),
  A1_mock_07: require('../../assets/content/A1/mock_07.json'),
  A1_mock_08: require('../../assets/content/A1/mock_08.json'),
  A1_mock_09: require('../../assets/content/A1/mock_09.json'),
  A1_mock_10: require('../../assets/content/A1/mock_10.json'),
  // A2
  A2_mock_01: require('../../assets/content/A2/mock_01.json'),
  A2_mock_02: require('../../assets/content/A2/mock_02.json'),
  A2_mock_03: require('../../assets/content/A2/mock_03.json'),
  A2_mock_04: require('../../assets/content/A2/mock_04.json'),
  A2_mock_05: require('../../assets/content/A2/mock_05.json'),
  A2_mock_06: require('../../assets/content/A2/mock_06.json'),
  A2_mock_07: require('../../assets/content/A2/mock_07.json'),
  A2_mock_08: require('../../assets/content/A2/mock_08.json'),
  A2_mock_09: require('../../assets/content/A2/mock_09.json'),
  A2_mock_10: require('../../assets/content/A2/mock_10.json'),
  // B1
  B1_mock_01: require('../../assets/content/B1/mock_01.json'),
  B1_mock_02: require('../../assets/content/B1/mock_02.json'),
  B1_mock_03: require('../../assets/content/B1/mock_03.json'),
  B1_mock_04: require('../../assets/content/B1/mock_04.json'),
  B1_mock_05: require('../../assets/content/B1/mock_05.json'),
  B1_mock_06: require('../../assets/content/B1/mock_06.json'),
  B1_mock_07: require('../../assets/content/B1/mock_07.json'),
  B1_mock_08: require('../../assets/content/B1/mock_08.json'),
  B1_mock_09: require('../../assets/content/B1/mock_09.json'),
  B1_mock_10: require('../../assets/content/B1/mock_10.json'),
  // B2
  B2_mock_01: require('../../assets/content/B2/mock_01.json'),
  B2_mock_02: require('../../assets/content/B2/mock_02.json'),
  B2_mock_03: require('../../assets/content/B2/mock_03.json'),
  B2_mock_04: require('../../assets/content/B2/mock_04.json'),
  B2_mock_05: require('../../assets/content/B2/mock_05.json'),
  B2_mock_06: require('../../assets/content/B2/mock_06.json'),
  B2_mock_07: require('../../assets/content/B2/mock_07.json'),
  B2_mock_08: require('../../assets/content/B2/mock_08.json'),
  B2_mock_09: require('../../assets/content/B2/mock_09.json'),
  B2_mock_10: require('../../assets/content/B2/mock_10.json'),
  // C1
  C1_mock_01: require('../../assets/content/C1/mock_01.json'),
  C1_mock_02: require('../../assets/content/C1/mock_02.json'),
  C1_mock_03: require('../../assets/content/C1/mock_03.json'),
  C1_mock_04: require('../../assets/content/C1/mock_04.json'),
  C1_mock_05: require('../../assets/content/C1/mock_05.json'),
  C1_mock_06: require('../../assets/content/C1/mock_06.json'),
  C1_mock_07: require('../../assets/content/C1/mock_07.json'),
  C1_mock_08: require('../../assets/content/C1/mock_08.json'),
  C1_mock_09: require('../../assets/content/C1/mock_09.json'),
  C1_mock_10: require('../../assets/content/C1/mock_10.json'),
};

export function getMockId(level: string, mockNumber: number): string {
  const padded = String(mockNumber).padStart(2, '0');
  return `${level}_mock_${padded}`;
}

function validateMockExam(data: unknown, mockId: string): MockExam {
  if (data === null || typeof data !== 'object') {
    throw new Error(`Mock exam ${mockId}: JSON root must be an object`);
  }

  const d = data as Record<string, unknown>;

  if (typeof d.id !== 'string') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "id" field`);
  }
  if (typeof d.level !== 'string') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "level" field`);
  }
  if (typeof d.title !== 'string') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "title" field`);
  }
  if (typeof d.version !== 'number') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "version" field`);
  }
  if (d.sections === null || typeof d.sections !== 'object') {
    throw new Error(`Mock exam ${mockId}: missing or invalid "sections" object`);
  }

  const sections = d.sections as Record<string, unknown>;

  for (const required of ['listening', 'reading', 'writing', 'speaking']) {
    if (sections[required] === null || typeof sections[required] !== 'object') {
      throw new Error(`Mock exam ${mockId}: missing required section "${required}"`);
    }
  }

  return d as unknown as MockExam;
}

/**
 * Loads a single mock exam from the bundled asset map.
 * mockNumber is 1-indexed (1–10).
 */
export async function loadMockExam(level: string, mockNumber: number): Promise<MockExam> {
  const mockId = getMockId(level, mockNumber);

  const raw: unknown = MOCK_ASSET_MAP[mockId];

  if (raw === undefined || raw === null) {
    throw new Error(
      `Mock exam not found: ${mockId}. ` +
        `Either the JSON file doesn't exist yet or it's missing from MOCK_ASSET_MAP.`
    );
  }

  return validateMockExam(raw, mockId);
}

/**
 * Returns the list of mock IDs available for a given level.
 * Checks the static asset map rather than probing the filesystem — safe for Metro bundler.
 */
export async function listAvailableMocks(level: string): Promise<string[]> {
  const available: string[] = [];

  for (let n = 1; n <= 10; n++) {
    const mockId = getMockId(level, n);
    if (MOCK_ASSET_MAP[mockId] !== undefined && MOCK_ASSET_MAP[mockId] !== null) {
      available.push(mockId);
    }
  }

  return available;
}
