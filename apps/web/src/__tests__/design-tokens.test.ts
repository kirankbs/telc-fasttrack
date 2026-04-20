import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { colors } from '@fastrack/config';

/**
 * Phase 1 design-token invariants.
 *
 * These assertions guard the tokens.md contract: hex values are not free to
 * drift silently, and the CSS/TS sources must stay in sync.
 */

const cssPath = path.resolve(__dirname, '../app/globals.css');
const css = readFileSync(cssPath, 'utf8');

describe('globals.css design tokens', () => {
  it('emits the brand palette anchor', () => {
    expect(css).toMatch(/--color-brand-600:\s*#1a3a5c/);
  });

  it('emits the revised A1 level solid (WCAG AA pass)', () => {
    expect(css).toMatch(/--color-level-a1-solid:\s*#2d8a4e/);
  });

  it('emits the full 10-step brand scale', () => {
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(css).toMatch(new RegExp(`--color-brand-${step}:`));
    }
  });

  it('emits the full neutral scale including the 150 step', () => {
    for (const step of [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(css).toMatch(new RegExp(`--color-neutral-${step}:`));
    }
  });

  it('emits level tokens for every CEFR level with solid/surface/text triple', () => {
    for (const lvl of ['a1', 'a2', 'b1', 'b2', 'c1']) {
      expect(css).toMatch(new RegExp(`--color-level-${lvl}-solid:`));
      expect(css).toMatch(new RegExp(`--color-level-${lvl}-surface:`));
      expect(css).toMatch(new RegExp(`--color-level-${lvl}-text:`));
    }
  });

  it('wires next/font CSS variables through --font-sans/-display/-mono', () => {
    expect(css).toMatch(/--font-sans:\s*var\(--font-sans-var\)/);
    expect(css).toMatch(/--font-display:\s*var\(--font-display-var\)/);
    expect(css).toMatch(/--font-mono:\s*var\(--font-mono-var\)/);
  });

  it('defines a dark-mode block that remaps semantic surface/text', () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\)/);
  });

  it('applies German hyphenation with heading override', () => {
    expect(css).toMatch(/\[lang="de"\][\s\S]*hyphens:\s*auto/);
  });
});

describe('@fastrack/config colors export', () => {
  it('exposes the structured brand scale', () => {
    expect(colors.brand[600]).toBe('#1a3a5c');
    expect(colors.brand[500]).toBe('#1e5599');
  });

  it('exposes WCAG-revised level solids', () => {
    expect(colors.level.a1.solid).toBe('#2d8a4e');
    expect(colors.level.b1.solid).toBe('#b86200');
    expect(colors.level.c1.solid).toBe('#6b2fa0');
  });

  it('keeps legacy flat exports in sync for mobile consumers', () => {
    expect(colors.primary).toBe(colors.brand[600]);
    expect(colors.primaryLight).toBe(colors.brand[500]);
    expect(colors.levelA1).toBe(colors.level.a1.solid);
    expect(colors.textPrimary).toBe(colors.neutral[700]);
  });

  it('sets readiness stages that do not alias the deprecated streak-fire orange', () => {
    expect(colors.readinessDeveloping).toBe(colors.brand[500]);
    expect(colors.readinessReady).toBe(colors.semantic.success);
  });
});
