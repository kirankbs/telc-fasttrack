# UX Phase 3 Handoff — Mocks List + Section Hub + Exam Runner

**Issue:** #52
**Branch:** `ui-upgrade-phase3-mocks-runner` (based on `ui-upgrade-phase1-tokens-typography`)
**Date:** 2026-04-20
**Agent:** ux-engineer

## What landed

### Critical: ExamTimer never turns red
`apps/web/src/components/exam/ExamTimer.tsx` now collapses warning (<5 min) and expired (0:00) into a single amber tone (`bg-warning-surface` + `text-warning`). Default is `bg-surface-container` + `text-text-secondary`. Icon swapped to `lucide-react Clock`. Tests explicitly assert no `bg-error`, `text-error`, `bg-fail`, `text-fail`, `red`, or red hex at any state.

### Mocks list `/exam`
- Level info strip now uses `bg-level-{n}-surface` + `text-level-{n}-text` (no hex-opacity hack).
- New `MockCard` component with 4 states, distinguished structurally (not by color alone):
  - **not-started:** white, 1px border, chevron on hover only.
  - **in-progress:** 2px left accent bar in level color, 3px bottom progress track, "N von 4 Abschnitten" footer.
  - **completed:** `bg-surface-container` recessed, score pill in `bg-pass-surface/text-pass` (passed) or `bg-fail-surface/text-fail` (failed), "Vollständig" footer.
  - **coming-soon:** renders as `<div>` not `<a>`, text-tertiary, desaturated badge, "Bald verfügbar", `cursor-default`.
- Empty state: single centered line `{Level} Übungstests sind bald verfügbar.` — no skeletons.
- Chevron: `lucide-react ChevronRight` with `opacity-0 group-hover:opacity-100`.

### Section hub `/exam/[mockId]`
- Sections split into labeled groups: **Schriftlich — min. 60% zum Bestehen** and **Mündlich — min. 60% zum Bestehen**.
- Emoji icons replaced with `lucide-react`: `Headphones` (Hören), `FileText` (Lesen), `Puzzle` (Sprachbausteine), `Pencil` (Schreiben), `Mic` (Sprechen). 20px @ strokeWidth 1.75.
- Status dot (not a text badge) per row: `bg-text-tertiary` (not started), level color (in progress), `bg-pass` (completed).
- Bottom CTA renamed from "Vollständige Prüfung starten" to **"Mit Hören starten"** / "Weiter mit {section}" when something in progress. `bg-brand-600`.

### Exam runner (all 5 *Exam.tsx components)
- Unified `ExamRunnerHeader` (56px flex row, 1px bottom border) — X icon + "Prüfung beenden" (opens confirm dialog), center section + Teil label, right-aligned amber-only `ExamTimer`.
- 3px progress bar below header, fills to level color.
- New `AnswerOption` component for MCQ/true-false/matching rows:
  - Default: 1px border, white bg.
  - Selected: 4px **left** accent in `border-l-brand-500` + `bg-surface-container` — explicitly **not** full brand-background fill.
  - Review correct: `bg-pass-surface` + `border-l-pass` + `Check` icon.
  - Review wrong: `bg-fail-surface` + `border-l-fail` + `X` icon. Correct option also highlighted.
- `ExamSubmitButton`: 52px full-width, `bg-brand-600`, disabled until selection.
- `SectionIntro` now takes a lucide `Icon` component prop instead of an emoji string.

## Design tokens used
All component-level styling uses Phase 1 tokens:
- `colors.brand[600]`, `border-l-brand-500`, `bg-brand-600`
- `colors.level.{n}.solid` / `surface` / `text` (no opacity-hex hack)
- `colors.semantic.warning` / `warningSurface`
- Tailwind utilities: `bg-warning-surface`, `bg-pass-surface`, `bg-fail-surface`, `border-l-pass`, `border-l-fail`, `text-pass`, `text-fail`, `font-mono`
- No hardcoded hex in touched components.

## Tests
- Unit: 182 vitest tests pass. New suites:
  - `ExamTimer.test.tsx` — 10 tests, including explicit **no-red** assertions at 30:00, 4:59, 0:00, and after countdown to 0.
  - `MockCard.test.tsx` — 5 tests, one per state.
  - `SectionHub.test.tsx` — 5 tests, covers A1 (no Sprachbausteine), B1 (with it), CTA default copy, status dot neutrality.
  - `AnswerOption.test.tsx` — 6 tests, covers default, selected, review correct/wrong/correctUnselected, click forwarding.
- Updated: `SectionIntro.test.tsx` (Icon prop), `ListeningExam.test.tsx` (data-state selector).
- Playwright: `exam-listening.spec.ts`, `exam-reading.spec.ts`, `exam-section-flow.spec.ts`, `exam-timer.spec.ts` updated for the new `data-state` attribute + amber-only assertions.

## CI
- `pnpm typecheck` — green.
- `pnpm --filter @fastrack/web test` — green (182/182).
- `pnpm --filter @fastrack/web build` — green; exam routes 3-5KB each.
- Mobile jest pre-existing failure on `main` unrelated to this ticket.

## Known follow-ups (out of scope for #52)
- Phase 4: vocab / grammar / results screen redesign.
- `SectionStatus.tsx` old `SectionActionButton` is still exported but no longer consumed — safe to delete in a cleanup PR.
- Section transition interstitial (screens.md §Screen 3, "Hören abgeschlossen — Gut gemacht") — specced but deferred.

## Files changed
- Added: `apps/web/src/components/exam/{AnswerOption,ExamRunnerHeader,ExamSubmitButton,MockCard,MockCardList,SectionHub}.tsx`
- Modified: `apps/web/src/components/exam/{ExamTimer,SectionIntro,PrepTimer,ListeningExam,ReadingExam,WritingExam,SpeakingExam,SprachbausteineExam,SectionStatus}.tsx`
- Modified: `apps/web/src/app/exam/page.tsx`, `apps/web/src/app/exam/[mockId]/page.tsx`
- Added tests: `apps/web/src/__tests__/exam/{MockCard,AnswerOption,SectionHub}.test.tsx`
- Updated tests: `apps/web/src/__tests__/exam/{ExamTimer,ListeningExam,SectionIntro}.test.tsx`
- Updated e2e: `apps/web/e2e/{exam-listening,exam-reading,exam-section-flow,exam-timer}.spec.ts`
- `apps/web/package.json` — added `lucide-react`.
