# Phase 3 — Mocks List + Section Hub + Exam Runner

**Issue:** #52
**Branch:** `ui-upgrade-phase3-mocks-runner`
**Blocked by:** #50 (Phase 1 tokens)
**Date:** 2026-04-20

## Intent

Redesign the mocks list cards to distinguish states (not-started / in-progress / completed), group section hub into Schriftlich + Mündlich blocks with threshold reminders, replace emoji icons with SVG, fix the exam timer so it **never turns red**, and refine answer-option selection style.

## Spec References

- `.planning/design-system/screens.md` §Screen 2 (Mocks List), §Screen 3 (Section Hub), §Screen 4 (Exam Runner)
- `.planning/design-system/stitch-prompts.md` Prompts 2 and 3
- `.planning/design-system/tokens.md`

## Acceptance Criteria

### Happy Path — Mocks List (`/exam`)

- [ ] Level info strip uses `--color-level-{n}-surface` background + `--color-level-{n}-text` text (no opacity hex hack)
- [ ] Card states:
  - **Not-started:** white bg, 1px border, level badge top-left, title, subtitle, empty footer, chevron visible only on hover
  - **In-progress:** white bg, 2px left accent bar in level color, "N von 4 Abschnitten" footer, 3px bottom progress track fills to sections completed
  - **Completed:** `--color-surface-container` bg (slightly receded), score pill top-right (`--color-pass-surface` + `--color-pass` text for ≥60% both aggregates, `--color-fail-surface` + `--color-fail` text otherwise), "Vollständig" footer in text-tertiary
  - **Coming soon (no content):** all text text-tertiary, badge desaturated, footer "Bald verfügbar", `cursor-default`, no hover state
- [ ] Empty state for levels without any mocks: single centered line "A2 Übungstests sind bald verfügbar." in text-secondary — no fake card skeletons, no illustrations

### Happy Path — Section Hub (`/exam/[mockId]`)

- [ ] Sections grouped into two labeled blocks:
  - "Schriftlich — min. 60% zum Bestehen" (Hören, Lesen, Sprachbausteine if B1+, Schreiben)
  - "Mündlich — min. 60% zum Bestehen" (Sprechen)
- [ ] Emoji section icons (🎧 📖 ✍️ 🗣️ 🧩) replaced with SVG icons (lucide-react `Headphones`, `FileText`, `Puzzle`, `Pencil`, `Mic` — add `lucide-react` to `apps/web/package.json` if not present)
- [ ] Status dot (not text badge) per row: `--color-text-tertiary` (not started), level color (in progress), `--color-pass` (completed)
- [ ] Button labels:
  - Not started: "Start" — filled in level color
  - In progress: "Continue" — filled in `--color-brand-500` (secondary emphasis)
  - Completed: "Review" — outline only
- [ ] CTA at bottom renamed from "Vollständige Prüfung starten" to **"Start with Hören"** (or "Continue with {next section}" if in progress)

### Happy Path — Exam Runner (all section runners)

- [ ] Header layout: `flex justify-between`, 56px height, 1px bottom border
  - Left: X icon (16px, text-secondary) + "Prüfung beenden" label (body-sm, text-secondary), click opens confirm dialog
  - Center: section name + Teil (e.g., "Hören — Teil 1") in DM Sans Medium 14px
  - Right: timer component
- [ ] Top 3px full-width progress bar directly below header, fills to active level color, `rounded-full`, no label
- [ ] Answer options:
  - Min-height 48px
  - Left-aligned radio button + answer text in 15px DM Sans Regular
  - Default: white bg, 1px border
  - **Selected state: 4px LEFT ACCENT in `--color-brand-500` + `--color-surface-container` bg — NEVER full background fill in brand color**
  - Post-submit (if correct selected): `--color-pass-surface` bg + 4px `--color-pass` left border, checkmark icon
  - Post-submit (if wrong selected): `--color-fail-surface` bg + 4px `--color-fail` left border — AND the correct answer gets its own pass-style highlight
- [ ] Submit button: full-width, 52px, filled brand.600, disabled until option selected

### Happy Path — Exam Timer (CRITICAL)

- [ ] Timer digits rendered in JetBrains Mono (font-mono class) with `font-variant-numeric: tabular-nums`
- [ ] Default state: `--color-surface-container` bg, `--color-text-secondary` text, 14px, small clock icon (12px), padding `4px 10px`, `rounded-md`
- [ ] Warning state (< 5 min remaining): `--color-warning-surface` bg, `--color-warning` text — amber only
- [ ] **Expired state: SAME AS WARNING (amber). The timer NEVER turns red. No `bg-error-light`, no `text-error`, no red anywhere on the timer component.** This is a hard gate — review the rendered component at 0:00 and confirm no red.
- [ ] Timer position: right of header, never center-aligned, never large (>16px)

### Empty / Edge Cases

- [ ] Mocks list for level with zero content (e.g., B2): renders empty state line, no broken grid cells
- [ ] Section hub for mock with all sections completed: each row shows `--color-pass` dot, CTA = "Review"
- [ ] Exam runner when user selects then deselects: submit button disables again
- [ ] Keyboard navigation: Tab moves through answer options, Space/Enter selects, Enter on submit submits

### Non-Negotiable Design Rules

- [ ] **Timer never displays red at any point during any section or at expiry**
- [ ] Selected answer uses left-accent pattern, not full-background-fill
- [ ] All emoji section icons replaced with consistent SVG icons (same size, same stroke weight, same icon library)
- [ ] `@import 'lucide-react'` does not add >30KB to the web bundle (tree-shaken)

### Quality Gates Required

- [ ] `pnpm typecheck && pnpm test && pnpm build` green
- [ ] Unit tests: ExamTimer at 30:00 (default), 4:59 (warning), 0:00 (expired) — all assert NO red color present
- [ ] Unit tests: mock card in all 4 states
- [ ] E2E: start a mock exam, answer one question, submit, verify feedback colors correct
- [ ] compliance-guardian baseline
- [ ] language-checker on new German strings

## Non-Goals

- Dashboard (Phase 2)
- Vocab / grammar / results (Phase 4)
- Mobile app

## Test Plan

- Start `pnpm dev:web`
- Open `/exam` at A1: verify each card state renders
- Open `/exam/A1_mock_01`: verify Schriftlich/Mündlich grouping, SVG icons, renamed CTA
- Start Hören section: verify timer at default color, then force timer under 5 min (can mock in test) — confirm amber
- Force timer to 0:00 — confirm STILL amber (not red)
- Answer a question, submit, verify left-accent feedback — not full fill
