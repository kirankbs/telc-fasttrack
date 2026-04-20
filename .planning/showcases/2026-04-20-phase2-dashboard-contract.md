# Phase 2 — Dashboard Redesign

**Issue:** #51
**Branch:** `ui-upgrade-phase2-dashboard`
**Blocked by:** #50 (Phase 1 tokens must merge first)
**Date:** 2026-04-20

## Intent

Replace the readiness ring + percentage + uniform 4-card stats grid with a hero card (stage + CTA + horizontal stage track), 3-card stats row, weekly streak grid (no fire), split written/oral pass dots in recent results.

## Spec References

- `.planning/design-system/screens.md` §Screen 1: Dashboard
- `.planning/design-system/stitch-prompts.md` Prompt 1
- `.planning/design-system/tokens.md`
- `.planning/design-system/brand.md` (streak deprecation)

## Acceptance Criteria

### Happy Path

- [ ] Readiness display shows named stage only (e.g., "Building foundation", "Developing skills", "Nearly ready", "Exam ready") in Instrument Serif at h2 size. **NO percentage number visible anywhere on the dashboard.**
- [ ] Hero card layout:
  - Full-width white card, `rounded-xl`, 1px border `--color-border`, padding `28px`
  - 4px vertical accent bar on left in active CEFR level color (`level.{n}.solid`)
  - Left column (60%): label "Prüfungsbereitschaft" (uppercase caption, text-secondary) → stage name (Instrument Serif h2) → single contextual sentence (body-sm, text-secondary) → primary CTA button
  - Right column (40%): horizontal 4-segment stage track with current segment highlighted in active level color, remaining in `--color-surface-container-hi`
- [ ] Primary CTA text:
  - If mocks in progress: "Continue: Übungstest N"
  - If mocks completed but not all done: "Next: Übungstest N"
  - If none started: "Start your first exam"
- [ ] Stats row = 3 cards (not 4). Removed: "Sektionen bearbeitet".
  - Card 1: "Übungstests" label, "N / 10" value, inline 4px linear progress bar filled to active level color
  - Card 2: "Durchschnitt" label, "X%" value, subtitle "aus N Prüfungen" — hidden (card returns "Noch nicht genug Daten") if N < 2
  - Card 3: "Lernzeit" label, "Xh Ymin" value, subtitle "diese Woche" (NOT "geschätzt"). Inline 7-square week grid: filled squares = studied that day, brand.200 fill, surface-container-hi empty
- [ ] Recent results rows:
  - Level pill + "Übungstest N" + mock title
  - Two pass dots: Schriftlich X% • Mündlich Y%, each with small colored dot (`--color-pass` or `--color-fail`)
  - No aggregate percentage

### Empty States

- [ ] No mocks completed: hero card shows "Start your first exam" CTA, stage name "Building foundation"
- [ ] Stats row still renders with "0 / 10", "Noch nicht genug Daten" for average, "0h" for time — no hidden cards
- [ ] Recent results section replaced by single line: "Noch keine Ergebnisse — starte deinen ersten Übungstest!" + CTA "Übungstest starten"

### Edge Cases

- [ ] At least 1 mock complete: average score shown with "aus 1 Prüfung" — singular form
- [ ] Study time 0h: renders "0h" not error
- [ ] Week grid renders correctly on Sunday (week roll-over) and on Monday (fresh week)
- [ ] Mobile (`max-md`): hero card stacks (stage label on top, track below), stats row becomes single-column stack

### Error States

- [ ] Session storage missing/corrupt: dashboard renders with zero state, no uncaught exceptions

### Non-Negotiable Design Rules

- [ ] **Zero fire emoji, zero streakFire orange (#ff6d00) anywhere in rendered dashboard**
- [ ] **Zero percentage number in readiness display** (stage name only)
- [ ] Level tab pills use revised AA-passing level colors (no Material Design defaults)
- [ ] Keyboard focus ring visible on all interactive elements (pills, CTA, action cards, result rows)
- [ ] Touch targets min 44px height on all interactive elements

### Quality Gates Required

- [ ] `pnpm typecheck && pnpm test && pnpm build` green
- [ ] Unit tests for: hero card variants (not-started, in-progress, ready), stats row conditional rendering (N<2 case), week grid day-fill logic
- [ ] E2E (Playwright): dashboard renders, level tab switch works, CTA routes to first/next mock
- [ ] compliance-guardian baseline
- [ ] language-checker on new German strings

## Non-Goals

- Exam runner / mocks list (Phase 3 / #52)
- Flashcard / grammar / results (Phase 4 / #53)
- Mobile app

## Test Plan

- Start `pnpm dev:web`, visit `/`
- Verify zero state (session storage cleared): "Start your first exam" CTA, zero-state stats
- Seed session storage with mock completions; verify hero stage progression + stats values
- Toggle `prefers-reduced-motion`: stage track fill animation disables
- Resize to 375px width (iPhone SE); verify single-column stack
- Check axe: zero new AA violations
