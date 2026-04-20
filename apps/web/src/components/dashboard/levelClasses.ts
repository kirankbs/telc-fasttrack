import type { Level } from '@fastrack/types';

/**
 * Tailwind class maps per CEFR level. We hand-maintain these (rather than
 * passing a hex via `style`) so token values stay single-sourced in
 * `globals.css`/theme.ts — no hex literals leak into components.
 */
export const LEVEL_SOLID_BG: Record<Level, string> = {
  A1: 'bg-level-a1-solid',
  A2: 'bg-level-a2-solid',
  B1: 'bg-level-b1-solid',
  B2: 'bg-level-b2-solid',
  C1: 'bg-level-c1-solid',
};

export const LEVEL_SURFACE_BG: Record<Level, string> = {
  A1: 'bg-level-a1-surface',
  A2: 'bg-level-a2-surface',
  B1: 'bg-level-b1-surface',
  B2: 'bg-level-b2-surface',
  C1: 'bg-level-c1-surface',
};

export const LEVEL_TEXT: Record<Level, string> = {
  A1: 'text-level-a1-text',
  A2: 'text-level-a2-text',
  B1: 'text-level-b1-text',
  B2: 'text-level-b2-text',
  C1: 'text-level-c1-text',
};
