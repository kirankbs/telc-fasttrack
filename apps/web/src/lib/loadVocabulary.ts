import { readFile } from 'fs/promises';
import path from 'path';

export interface VocabularyWord {
  id: number;
  level: string;
  german: string;
  english: string;
  article: string | null;
  plural?: string | null;
  exampleSentence: string;
  topic: string;
  audioFile: string | null;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string | null;
  lastReviewedAt: string | null;
}

const VOCAB_DIR =
  process.env.VOCAB_DIR ??
  path.resolve(process.cwd(), '../mobile/src/data/vocabulary');

export async function loadVocabulary(level: string): Promise<VocabularyWord[]> {
  const filePath = path.join(VOCAB_DIR, `${level}_vocabulary.json`);

  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as VocabularyWord[];
  } catch {
    return [];
  }
}
