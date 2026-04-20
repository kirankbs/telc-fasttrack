# Handoff — UI Upgrade Phase 2: Dashboard Redesign

**Date:** 2026-04-20
**Agent:** ux-engineer
**Issue:** #51
**Branch:** `ui-upgrade-phase2-dashboard` (base: `ui-upgrade-phase1-tokens-typography`)
**Worktree:** `.worktrees/ui-upgrade-phase2-dashboard/`

## What shipped

Full dashboard redesign per `.planning/showcases/2026-04-20-phase2-dashboard-contract.md`.

- **Hero row** — `ReadinessHero` replaces the SVG ring gauge entirely. Full-width card, 4px vertical accent bar on the left in the active level's solid color, label → named stage (Instrument Serif, h2) → contextual nudge → primary CTA. Right column houses a 4-segment `StageTrack` with current segment highlighted.
- **Stage track** — horizontal, 4 labelled stages (Aufbau / Entwicklung / Fast bereit / Prüfungsbereit); mobile collapses labels and keeps the bar-only row.
- **Stats row** — 3 cards (Übungstests / Durchschnitt / Lernzeit). Dropped "Sektionen bearbeitet". Mocks card has inline 4px linear progress bar filling to level color. Average card renders "Noch nicht genug Daten" when `completedMocks < 2`; otherwise shows "X%" + singular/plural "aus N Prüfung(en)". Time card swaps "geschätzt" for "diese Woche" and sits alongside `WeekGrid` (7 Mon-Sun squares, studied = `bg-brand-200`, empty = `bg-surface-container-hi`).
- **Recent results** — row layout: level pill + "Übungstest N" on the left, split `Schriftlich X% • Mündlich Y%` with pass/fail colored dots on the right. Empty state is a single sentence + quiet secondary CTA.
- **QuickActions removed entirely.** Primary CTA now lives inside the hero ("Continue:", "Next:", or "Start your first exam"); vocab/grammar links are in the existing nav header and no longer need a duplicate dashboard card.
- **Level pills** — use `bg-level-{n}-solid + text-white` when active; `border + text-level-{n}-text` when idle. Every interactive element has `focus-visible:ring-2 ring-brand-500 ring-offset-2` and >= 44px touch targets.

## Files

**Added (8):**
- `apps/web/src/components/dashboard/ReadinessHero.tsx`
- `apps/web/src/components/dashboard/StageTrack.tsx`
- `apps/web/src/components/dashboard/WeekGrid.tsx`
- `apps/web/src/components/dashboard/levelClasses.ts`
- `apps/web/src/__tests__/dashboard/ReadinessHero.test.tsx`
- `apps/web/src/__tests__/dashboard/StudyStats.test.tsx`
- `apps/web/src/__tests__/dashboard/WeekGrid.test.tsx`
- `apps/web/e2e/dashboard.spec.ts`

**Modified (4):**
- `apps/web/src/components/dashboard/Dashboard.tsx` (rewired composition; added CTA + week-grid computation)
- `apps/web/src/components/dashboard/RecentResults.tsx` (split written / oral pass dots)
- `apps/web/src/components/dashboard/StudyStats.tsx` (3-card layout, conditional average, inline week grid)
- `apps/web/src/__tests__/dashboard/Dashboard.test.tsx` (rewritten against new test IDs)

**Deleted (4):**
- `apps/web/src/components/dashboard/QuickActions.tsx`
- `apps/web/src/components/dashboard/ReadinessGauge.tsx`
- `apps/web/src/__tests__/dashboard/QuickActions.test.tsx`
- `apps/web/src/__tests__/dashboard/ReadinessGauge.test.tsx`

## Tests

| Suite | Count |
|-------|-------|
| Web unit (vitest) | 178 pass / 178 |
| Dashboard-specific new | 30 |
| E2E (Playwright) | 3 new specs in `dashboard.spec.ts` (CI run expected) |

**Notable assertions:**
- `ReadinessHero` subtree must not match `/\d{1,3}\s*%/` in any readiness variant.
- `StudyStats` grid has exactly 3 children (guards against re-adding a 4th card).
- `WeekGrid` renders 7 squares even when input array is shorter.
- CTA text tests cover all three variants (`Start your first exam`, `Continue: Übungstest N`, `Next: Übungstest N`).

## Quality gates run locally

- `pnpm typecheck` — green
- `pnpm test` — 178/178
- `pnpm build` — green

## Non-negotiable rules verified

- Zero percentage number anywhere in `ReadinessHero` (enforced by regex-scan test across all 4 stage variants).
- Zero fire emoji in any dashboard component (grep clean).
- Zero `#ff6d00` or any hex literal in dashboard components — only Tailwind token classes (`bg-level-a1-solid`, `bg-brand-600`, `bg-brand-200`, `bg-pass`, `bg-fail`, `bg-surface-container-hi`, etc.).
- AA-safe level pills via Phase 1 tokens (white text on `level.{n}.solid`).
- Touch targets ≥ 44px (CTA button `h-11`; level pills `h-11`; result row padding).
- Keyboard focus visible on level pills, CTA, result rows, and empty-state CTA.

## Known non-goals (deferred to later phases)

- Mock exams list (`/exam`) redesign → Phase 3 (#52).
- Flashcard / grammar / results redesign → Phase 4 (#53).
- Mobile app — out of scope (web-only phase).

## Follow-ups

- Once Phase 1 PR (#54) merges to `main`, rebase this branch onto `main` before merge.
- Axe baseline: should be run against `pnpm dev:web` → `/` in a follow-up verification pass. Given the component uses tokens that were themselves AA-checked in Phase 1, no new contrast violations are expected.
