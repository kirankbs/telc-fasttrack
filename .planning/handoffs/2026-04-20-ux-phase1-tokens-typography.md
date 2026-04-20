# UX Phase 1 — Tokens + Typography Foundation

**Issue:** #50
**Branch:** `ui-upgrade-phase1-tokens-typography`
**Date:** 2026-04-20
**Agent:** ux-engineer

## What was built

Replaced the web design token layer and wired proper fonts via `next/font`.
No component visual redesign in this PR — this is the substrate phases 2–4
build against. Existing screens (`/`, `/exam`, `/vocab`, `/grammar`) continue
to render with the new palette applied.

## What changed

### `packages/config/src/theme.ts`

- Structured `colors` export: `brand` (11-step), `neutral` (13-step including the
  150 half-step), `level` (a1–c1 with `solid` / `surface` / `text` triple),
  `semantic` (success/warning/error/info/pass/fail/timer/streak/readiness),
  `text` (primary/secondary/tertiary/disabled/onBrand/onLevel), `surfaces`
  (background/surface/surfaceRaised/surfaceContainer/surfaceContainerHi),
  `borders` (default/hover/focus).
- Structured group names are `surfaces` / `borders` (plural) instead of
  `surface` / `border` — the singular names clash with the flat legacy keys
  that the mobile app reads (`colors.surface`, `colors.border`). Noted in
  the token file; the orchestrator can decide whether to migrate the mobile
  app off the flat keys later, which would free up the singular names.
- Legacy flat keys (`primary`, `primaryLight`, `levelA1`, `textPrimary`, etc.)
  kept and re-pointed at the new palette values — zero mobile breakage.
- `streakFire`, `streakText`, `streakBackground` marked `@deprecated` via
  JSDoc and remapped to brand-tint values (no more orange fire color).
- `typography.fontFamily` now references CSS variables
  (`var(--font-sans)` / `var(--font-display)` / `var(--font-mono)`).
- `typography.fontSize` gained named keys (`display`, `h1`, `h2`, …, `mono`)
  per tokens.md; legacy numeric keys retained for mobile.
- `typography.lineHeight` + `typography.letterSpacing` expanded per spec.
- `spacing` gained `2xs: 2` and `6xl: 80`.
- New exports: `shadow` (web CSS strings: `sm`/`md`/`lg`/`xl`),
  `duration` (motion tokens in ms), `easing` (cubic-bezier strings).
- `LEVEL_CONFIG` entries now also carry `surface` and `textColor` alongside
  the existing `color`.

### `apps/web/src/app/globals.css`

- Full `@theme` rewrite per tokens.md: all brand, neutral, level,
  surface, border, text, interactive, status, pass/fail, timer, streak,
  and readiness CSS variables declared.
- `--font-sans` / `--font-display` / `--font-mono` chains declared with
  system fallbacks. next/font exposes `--font-sans-var` etc. which feed
  into those chains, so Google Font failure still renders readably.
- Dark-mode block via `@media (prefers-color-scheme: dark)` — remaps
  semantic surface/text/border/interactive tokens, palette stays static.
  (No toggle in-product for Phase 1; system preference only.)
- `color-scheme: light dark` on `:root` so form controls track the scheme.
- German hyphenation: `[lang="de"] { hyphens: auto }`, headings opt out
  to prevent breaks in compound words.
- `.font-display` and `.font-mono` utility classes emitted.
- Legacy Tailwind tokens kept (`--color-brand-primary`,
  `--color-text-primary`, `--color-level-a1`, etc.) so existing utility
  classes across all components continue to resolve without component
  changes — just remapped to new hex values.

### `apps/web/src/app/layout.tsx`

- `DM_Sans` (weights 400/500/600), `Instrument_Serif` (400), and
  `JetBrains_Mono` (400) wired via `next/font/google`; all `display: 'swap'`.
- CSS variables `--font-sans-var` / `--font-display-var` / `--font-mono-var`
  applied to `<html>`.
- Hardcoded `bg-[#f5f5f5]` replaced with `bg-background` (resolves to the
  new `--color-background` = `#f7f7f8`).
- Hardcoded `border-[#e0e0e0]` on header and footer replaced with
  `border-border` (resolves to `--color-border` = `#d9d9db`).
- Wordmark weight changed from `font-bold` to `font-semibold` per
  brand.md: "Fastrack" and "Deutsch" are equal partners in a single-
  weight wordmark. Full logo mark (fd monogram) is deferred to a later
  phase — brand.md explicitly says Phase 1 does not introduce the mark.

### Tests

- New `apps/web/src/__tests__/design-tokens.test.ts` — 12 assertions:
  - globals.css emits `--color-brand-600: #1a3a5c` (anchor)
  - globals.css emits `--color-level-a1-solid: #2d8a4e` (WCAG AA pass)
  - Full brand scale (50–950) present
  - Full neutral scale (0–950 including 150) present
  - Every CEFR level has `solid`/`surface`/`text`
  - `--font-sans` / `--font-display` / `--font-mono` chains wired
  - Dark-mode `@media` block present
  - German hyphenation rule present
  - `@fastrack/config` exports the structured brand / level colors
  - Legacy flat exports stay in sync (mobile compat)
  - Readiness stages use the brand scale, not the deprecated orange

## Files touched (6)

1. `packages/config/src/theme.ts`
2. `packages/config/src/index.ts`
3. `apps/web/src/app/globals.css`
4. `apps/web/src/app/layout.tsx`
5. `apps/web/src/__tests__/design-tokens.test.ts` (new)
6. `.planning/ACTIVITY-LOG.md`
7. `.planning/handoffs/2026-04-20-ux-phase1-tokens-typography.md` (this file)

## Verification

- `pnpm typecheck` — green
- `pnpm turbo run test --filter='!@fastrack/mobile'` — 164/164 passing
  (12 new + 152 existing)
- `pnpm --filter @fastrack/web build` — green, 7 routes prerendered,
  total first-load JS unchanged materially by font injection
- `pnpm --filter @fastrack/mobile test` — fails on both main and this
  branch with the same `expo-modules-core` ESM parse error. Pre-existing,
  and CI explicitly excludes mobile via `--filter='!@fastrack/mobile'`.

## Follow-ups discovered

1. **Tailwind utility renaming.** Current component call sites use legacy
   utility names like `bg-brand-primary`, `text-text-primary`, `bg-level-a1`.
   These still work because the legacy CSS variables are kept in `@theme`.
   A future PR can migrate call sites to the new structured names
   (`bg-brand-600`, `text-primary`, `bg-level-a1-solid`) and then remove
   the legacy aliases. Not urgent — no functional gain, only ergonomic.
2. **Mobile flat-key migration.** Mobile reads `colors.surface` and
   `colors.border` directly. Keeping these forces the structured groups
   to use plural `surfaces` / `borders`. Once mobile is migrated to a
   different access pattern, we can rename back to singular.
3. **Streak UI.** The streak visual (currently fire emoji + orange) still
   uses the deprecated tokens. Token values have been remapped to a calm
   brand tint, so the component looks different but still renders. The
   full redesign (calendar-grid treatment per brand.md) belongs in the
   next UI pass.
4. **`@variant dark` instead of media query.** tokens.md notes a class-
   based dark toggle would require `darkMode: 'class'` wiring and a UI
   switch. Phase 1 uses the media query for zero-wire-up. When the app
   gains a user preference toggle, swap in the `@variant` approach.
5. **Font payload budget.** JetBrains Mono is loaded as the full Latin
   subset, not digit-only. tokens.md recommended subsetting to
   `U+0030-0039, U+003A` for the timer. `next/font` doesn't support
   glyph-level subsetting out of the box; leaving as-is for now
   (~45–60 KB gzipped total, within the spec tolerance).

## Phases 2–4 unblocked

- Phase 2 (#51 dashboard redesign) can consume
  `bg-brand-50`, `text-brand-600`, `bg-level-a1-surface`,
  `text-level-a1-text`, `text-success`, `bg-readiness-ready`, etc.
  directly as Tailwind utilities.
- Phase 3 (#52 mocks runner) can use `text-timer-default`, the new
  `.font-mono` utility for the timer, and `bg-pass-surface` /
  `bg-fail-surface` for results.
- Phase 4 (#53 vocab + grammar + results) can use the `.font-display`
  utility for the results hero and the full level token triple for
  per-level theming.
- Motion constants (`duration.slow`, `easing.spring`) are now importable
  from `@fastrack/config` for the flashcard flip.
