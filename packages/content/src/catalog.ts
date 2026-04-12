import type { Level } from '@telc/types';

export interface MockExamEntry {
  id: string;
  level: Level;
  mockNumber: number;
  title: string;
}

function generateEntries(level: Level, count: number): MockExamEntry[] {
  const titles: Record<Level, string[]> = {
    A1: [
      'Alltag', 'Familie & Freunde', 'Wohnen', 'Essen & Trinken', 'Termine & Uhrzeit',
      'Arbeit & Beruf', 'Freizeit', 'Gesundheit', 'Reisen', 'Einkaufen',
    ],
    A2: [
      'Alltag', 'Familie', 'Wohnen', 'Essen', 'Termine',
      'Arbeit', 'Freizeit', 'Gesundheit', 'Reisen', 'Einkaufen',
    ],
    B1: [
      'Alltag', 'Beruf', 'Bildung', 'Medien', 'Umwelt',
      'Gesellschaft', 'Kultur', 'Gesundheit', 'Reisen', 'Konsum',
    ],
    B2: [
      'Wissenschaft', 'Beruf', 'Bildung', 'Medien', 'Umwelt',
      'Gesellschaft', 'Kultur', 'Wirtschaft', 'Politik', 'Technologie',
    ],
    C1: [
      'Wissenschaft', 'Forschung', 'Bildung', 'Medien', 'Umwelt',
      'Gesellschaft', 'Kultur', 'Wirtschaft', 'Politik', 'Technologie',
    ],
  };

  return Array.from({ length: count }, (_, i) => ({
    id: `${level}_mock_${String(i + 1).padStart(2, '0')}`,
    level,
    mockNumber: i + 1,
    title: `${level} Übungstest ${i + 1}: ${titles[level][i]}`,
  }));
}

export const MOCK_EXAM_CATALOG: MockExamEntry[] = [
  ...generateEntries('A1', 10),
  ...generateEntries('A2', 10),
  ...generateEntries('B1', 10),
  ...generateEntries('B2', 10),
  ...generateEntries('C1', 10),
];

export function getAvailableLevels(): Level[] {
  return ['A1', 'A2', 'B1', 'B2', 'C1'];
}

export function getMocksForLevel(level: Level): MockExamEntry[] {
  return MOCK_EXAM_CATALOG.filter((e) => e.level === level);
}
