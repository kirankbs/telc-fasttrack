# Phase 1 — Tokens + Typography Foundation

**Issue:** #50
**Branch:** `ui-upgrade-phase1-tokens-typography`
**Scope:** `scope:ux`, `scope:web`
**Date:** 2026-04-20

## Intent

Rewrite the web design token layer and wire proper fonts via `next/font`. No component redesign in this PR. Foundation that phases 2–4 (issues #51, #52, #53) depend on. Every component visible change is gated on tokens being right first.

## Spec References

- `.planning/design-system/tokens.md` — authoritative palette, typography, spacing, radius, shadow, motion
- `.planning/design-system/brand.md` — brand adjectives, streak deprecation

## Acceptance Criteria

### Happy Path

- [ ] `apps/web/src/app/globals.css` `@theme` block replaced per `tokens.md`:
  - `--color-brand-{50…950}` defined (10 steps)
  - `--color-neutral-{0,50,100,150,200,300,400,500,600,700,800,900,950}` defined
  - `--color-level-{a1,a2,b1,b2,c1}-{solid,surface,text}` defined with the revised WCAG-AA-passing hex values from tokens.md
  - Semantic aliases: `--color-surface`, `--color-surface-container`, `--color-surface-container-hi`, `--color-border`, `--color-border-hover`, `--color-border-focus`, `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-text-disabled`, `--color-interactive-primary`, `--color-interactive-primary-hover`, `--color-success`, `--color-success-surface`, `--color-warning`, `--color-warning-surface`, `--color-error`, `--color-error-surface`, `--color-info`, `--color-info-surface`, `--color-pass`, `--color-pass-surface`, `--color-fail`, `--color-fail-surface`, `--color-timer-default`, `--color-timer-warning`, `--color-timer-warning-surface`, `--color-streak`, `--color-streak-surface`, `--color-readiness-building`, `--color-readiness-developing`, `--color-readiness-almost`, `--color-readiness-ready`
- [ ] Dark mode variants defined via `@media (prefers-color-scheme: dark)` OR `@variant dark { ... }`, remapping only semantic tokens (palette tokens stay static)
- [ ] `packages/config/src/theme.ts`:
  - `colors` export refreshed to match new palette (add brand scale, revised level hexes, replace `primaryLight` → `brand500` naming, update text colors to remove purple cast)
  - `typography.fontFamily` references `var(--font-sans)` / `var(--font-display)` / `var(--font-mono)`
  - `typography.fontSize` scale matches tokens.md (display 36, h1 30, h2 24, h3 20, h4 18, body 16, body-sm 14, caption 12, mono 14)
  - `spacing` adds `2xs: 2` (2px)
  - `shadow` web tokens added: `sm`, `md`, `lg`, `xl` using rgb() syntax from tokens.md
  - `duration` added: `instant: 0`, `fast: 120`, `base: 200`, `moderate: 300`, `slow: 500`, `deliberate: 800`
  - `easing` added: `standard`, `decelerate`, `accelerate`, `spring`
  - `streakFire` / `streakText` / `streakBackground` marked `@deprecated` JSDoc (retained for mobile backward compat — do not delete yet)
- [ ] `apps/web/src/app/layout.tsx` wires `next/font/google`:
  - DM Sans weights `400, 500, 600` as `--font-sans`
  - Instrument Serif weight `400` as `--font-display`
  - JetBrains Mono weight `400`, `subsets: ['latin']`, adjustFontFallback default OK — expose as `--font-mono`. Use `display: 'swap'` on all three.
  - CSS variable bindings applied to `<html>` or `<body>`
- [ ] `apps/web/src/app/globals.css` font-family chain:
  - `body { font-family: var(--font-sans), system-ui, sans-serif; }`
  - `.font-display { font-family: var(--font-display), Georgia, serif; }` class available
  - `.font-mono { font-family: var(--font-mono), ui-monospace, monospace; font-variant-numeric: tabular-nums; }`
- [ ] Hardcoded `bg-[#f5f5f5]` in `apps/web/src/app/layout.tsx` replaced with `bg-background` (or equivalent token class)

### Empty States

- [ ] No components visibly changed in this PR — each existing screen still renders
- [ ] No runtime errors in browser console for any existing route

### Edge Cases

- [ ] German text (ä ö ü ß) renders correctly in DM Sans — smoke-test on a mock exam page
- [ ] Font payload ≤ ~60 KB gzipped (only specified weights loaded)
- [ ] JetBrains Mono digits have no horizontal jitter when digit width changes (e.g., 1→8)

### Error States

- [ ] If Google Fonts fail to load, fallback font chain renders readably (not broken layout)

### Quality Gates Required

- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes (Next.js production build succeeds)
- [ ] compliance-guardian scan (baseline — no auth changes expected)
- [ ] language-checker (baseline — no new UI copy)

### Regression Checks

- [ ] Dashboard renders at `/` without console errors
- [ ] Exam list renders at `/exam`
- [ ] Vocabulary page renders at `/vocab`
- [ ] Grammar page renders at `/grammar`
- [ ] No visual regression expected beyond font swap + subtle color refinement

## Non-Goals

- ReadinessGauge redesign (Phase 2 / #51)
- Dashboard layout changes (Phase 2 / #51)
- Dark mode toggle UI (future phase)
- Mobile app changes (out of scope — web only)
- Component refactors beyond token consumption

## Test Plan

- Run `pnpm dev:web` locally; open `/`, `/exam`, `/exam/A1_mock_01`, `/vocab`, `/grammar`
- Inspect devtools Computed styles — confirm `font-family` includes DM Sans (not system-ui)
- Inspect CSS variable values match `tokens.md` hex values
- Run `axe` or Lighthouse accessibility audit on `/` — no new AA failures introduced
