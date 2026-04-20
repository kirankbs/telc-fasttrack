import { readFile } from 'fs/promises';
import path from 'path';
import type { GrammarTopic } from '@fastrack/types';

const GRAMMAR_DIR =
  process.env.GRAMMAR_DIR ??
  path.resolve(process.cwd(), '../mobile/src/data/grammar');

export async function loadGrammar(level: string): Promise<GrammarTopic[]> {
  const filePath = path.join(GRAMMAR_DIR, `${level}_grammar.json`);

  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return (data as GrammarTopic[]).sort((a, b) => a.orderIndex - b.orderIndex);
  } catch {
    return [];
  }
}
