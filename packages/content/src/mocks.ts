import type { Level, MockExam } from '@fastrack/types';
import { validateMockExam } from './validation';

// Static imports — bundler traces these at build time, no fs reads at request time.
// Root cause of #108: getMockExamOrNotFound called readFile() against a sibling-package
// path that Vercel does not trace into the Lambda bundle for nested dynamic routes,
// causing 8s hangs on all 6 /exam/[mockId]/* subroutes.
//
// Pattern mirrors packages/content/src/grammar.ts (PR #107 fix for /grammar routes).
import A1_mock_01 from '../../../apps/mobile/assets/content/A1/mock_01.json';
import A1_mock_02 from '../../../apps/mobile/assets/content/A1/mock_02.json';
import A1_mock_03 from '../../../apps/mobile/assets/content/A1/mock_03.json';
import A1_mock_04 from '../../../apps/mobile/assets/content/A1/mock_04.json';
import A1_mock_05 from '../../../apps/mobile/assets/content/A1/mock_05.json';
import A1_mock_06 from '../../../apps/mobile/assets/content/A1/mock_06.json';
import A1_mock_07 from '../../../apps/mobile/assets/content/A1/mock_07.json';
import A1_mock_08 from '../../../apps/mobile/assets/content/A1/mock_08.json';
import A1_mock_09 from '../../../apps/mobile/assets/content/A1/mock_09.json';
import A1_mock_10 from '../../../apps/mobile/assets/content/A1/mock_10.json';

import A2_mock_01 from '../../../apps/mobile/assets/content/A2/mock_01.json';
import A2_mock_02 from '../../../apps/mobile/assets/content/A2/mock_02.json';
import A2_mock_03 from '../../../apps/mobile/assets/content/A2/mock_03.json';
import A2_mock_04 from '../../../apps/mobile/assets/content/A2/mock_04.json';
import A2_mock_05 from '../../../apps/mobile/assets/content/A2/mock_05.json';
import A2_mock_06 from '../../../apps/mobile/assets/content/A2/mock_06.json';
import A2_mock_07 from '../../../apps/mobile/assets/content/A2/mock_07.json';
import A2_mock_08 from '../../../apps/mobile/assets/content/A2/mock_08.json';
import A2_mock_09 from '../../../apps/mobile/assets/content/A2/mock_09.json';
import A2_mock_10 from '../../../apps/mobile/assets/content/A2/mock_10.json';

import B1_mock_01 from '../../../apps/mobile/assets/content/B1/mock_01.json';
import B1_mock_02 from '../../../apps/mobile/assets/content/B1/mock_02.json';
import B1_mock_03 from '../../../apps/mobile/assets/content/B1/mock_03.json';
import B1_mock_04 from '../../../apps/mobile/assets/content/B1/mock_04.json';
import B1_mock_05 from '../../../apps/mobile/assets/content/B1/mock_05.json';
import B1_mock_06 from '../../../apps/mobile/assets/content/B1/mock_06.json';
import B1_mock_07 from '../../../apps/mobile/assets/content/B1/mock_07.json';
import B1_mock_08 from '../../../apps/mobile/assets/content/B1/mock_08.json';
import B1_mock_09 from '../../../apps/mobile/assets/content/B1/mock_09.json';
import B1_mock_10 from '../../../apps/mobile/assets/content/B1/mock_10.json';

import B2_mock_01 from '../../../apps/mobile/assets/content/B2/mock_01.json';
import B2_mock_02 from '../../../apps/mobile/assets/content/B2/mock_02.json';
import B2_mock_03 from '../../../apps/mobile/assets/content/B2/mock_03.json';
import B2_mock_04 from '../../../apps/mobile/assets/content/B2/mock_04.json';
import B2_mock_05 from '../../../apps/mobile/assets/content/B2/mock_05.json';
import B2_mock_06 from '../../../apps/mobile/assets/content/B2/mock_06.json';
import B2_mock_07 from '../../../apps/mobile/assets/content/B2/mock_07.json';
import B2_mock_08 from '../../../apps/mobile/assets/content/B2/mock_08.json';
import B2_mock_09 from '../../../apps/mobile/assets/content/B2/mock_09.json';
import B2_mock_10 from '../../../apps/mobile/assets/content/B2/mock_10.json';

import C1_mock_01 from '../../../apps/mobile/assets/content/C1/mock_01.json';
import C1_mock_02 from '../../../apps/mobile/assets/content/C1/mock_02.json';
import C1_mock_03 from '../../../apps/mobile/assets/content/C1/mock_03.json';
import C1_mock_04 from '../../../apps/mobile/assets/content/C1/mock_04.json';
import C1_mock_05 from '../../../apps/mobile/assets/content/C1/mock_05.json';
import C1_mock_06 from '../../../apps/mobile/assets/content/C1/mock_06.json';
import C1_mock_07 from '../../../apps/mobile/assets/content/C1/mock_07.json';
import C1_mock_08 from '../../../apps/mobile/assets/content/C1/mock_08.json';
import C1_mock_09 from '../../../apps/mobile/assets/content/C1/mock_09.json';
import C1_mock_10 from '../../../apps/mobile/assets/content/C1/mock_10.json';

// Validate at module load (build time). Malformed JSON fails the build, never
// reaches runtime. C1 stubs have all required fields and pass validation cleanly.
function assertMockExam(data: unknown, id: string): MockExam {
  return validateMockExam(data, id);
}

const MOCK_DATA: Record<Level, MockExam[]> = {
  A1: [
    assertMockExam(A1_mock_01, 'A1_mock_01'),
    assertMockExam(A1_mock_02, 'A1_mock_02'),
    assertMockExam(A1_mock_03, 'A1_mock_03'),
    assertMockExam(A1_mock_04, 'A1_mock_04'),
    assertMockExam(A1_mock_05, 'A1_mock_05'),
    assertMockExam(A1_mock_06, 'A1_mock_06'),
    assertMockExam(A1_mock_07, 'A1_mock_07'),
    assertMockExam(A1_mock_08, 'A1_mock_08'),
    assertMockExam(A1_mock_09, 'A1_mock_09'),
    assertMockExam(A1_mock_10, 'A1_mock_10'),
  ],
  A2: [
    assertMockExam(A2_mock_01, 'A2_mock_01'),
    assertMockExam(A2_mock_02, 'A2_mock_02'),
    assertMockExam(A2_mock_03, 'A2_mock_03'),
    assertMockExam(A2_mock_04, 'A2_mock_04'),
    assertMockExam(A2_mock_05, 'A2_mock_05'),
    assertMockExam(A2_mock_06, 'A2_mock_06'),
    assertMockExam(A2_mock_07, 'A2_mock_07'),
    assertMockExam(A2_mock_08, 'A2_mock_08'),
    assertMockExam(A2_mock_09, 'A2_mock_09'),
    assertMockExam(A2_mock_10, 'A2_mock_10'),
  ],
  B1: [
    assertMockExam(B1_mock_01, 'B1_mock_01'),
    assertMockExam(B1_mock_02, 'B1_mock_02'),
    assertMockExam(B1_mock_03, 'B1_mock_03'),
    assertMockExam(B1_mock_04, 'B1_mock_04'),
    assertMockExam(B1_mock_05, 'B1_mock_05'),
    assertMockExam(B1_mock_06, 'B1_mock_06'),
    assertMockExam(B1_mock_07, 'B1_mock_07'),
    assertMockExam(B1_mock_08, 'B1_mock_08'),
    assertMockExam(B1_mock_09, 'B1_mock_09'),
    assertMockExam(B1_mock_10, 'B1_mock_10'),
  ],
  B2: [
    assertMockExam(B2_mock_01, 'B2_mock_01'),
    assertMockExam(B2_mock_02, 'B2_mock_02'),
    assertMockExam(B2_mock_03, 'B2_mock_03'),
    assertMockExam(B2_mock_04, 'B2_mock_04'),
    assertMockExam(B2_mock_05, 'B2_mock_05'),
    assertMockExam(B2_mock_06, 'B2_mock_06'),
    assertMockExam(B2_mock_07, 'B2_mock_07'),
    assertMockExam(B2_mock_08, 'B2_mock_08'),
    assertMockExam(B2_mock_09, 'B2_mock_09'),
    assertMockExam(B2_mock_10, 'B2_mock_10'),
  ],
  C1: [
    assertMockExam(C1_mock_01, 'C1_mock_01'),
    assertMockExam(C1_mock_02, 'C1_mock_02'),
    assertMockExam(C1_mock_03, 'C1_mock_03'),
    assertMockExam(C1_mock_04, 'C1_mock_04'),
    assertMockExam(C1_mock_05, 'C1_mock_05'),
    assertMockExam(C1_mock_06, 'C1_mock_06'),
    assertMockExam(C1_mock_07, 'C1_mock_07'),
    assertMockExam(C1_mock_08, 'C1_mock_08'),
    assertMockExam(C1_mock_09, 'C1_mock_09'),
    assertMockExam(C1_mock_10, 'C1_mock_10'),
  ],
};

const VALID_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Returns the MockExam for the given level and 1-based mock number, or null
 * if the level is invalid or the mock number is out of range (1–10).
 * Data is statically imported at build time — no fs reads at request time.
 */
export function getMockExam(level: Level, mockNumber: number): MockExam | null {
  if (!VALID_LEVELS.includes(level)) return null;
  if (mockNumber < 1 || mockNumber > 10) return null;
  return MOCK_DATA[level][mockNumber - 1];
}
