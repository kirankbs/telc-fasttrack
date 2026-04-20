# Activity Log

## 2026-04-20 — UX Phase 3: Mocks list + Section Hub + Exam Runner

**Agent:** ux-engineer
**Issue:** #52
**Branch:** `ui-upgrade-phase3-mocks-runner`
**Base:** `ui-upgrade-phase1-tokens-typography`

### Start
- Worktree created from `origin/ui-upgrade-phase1-tokens-typography`.
- Added `lucide-react` to `apps/web`.
- Read all exam runner components + screen specs + Phase 1 token API.

### Build
- ExamTimer rewritten: warning and expired states share amber treatment, no red anywhere. Tests assert absence of red/error/fail classes at every state.
- New shared components: `MockCard`, `MockCardList` (client), `SectionHub`, `ExamRunnerHeader`, `AnswerOption`, `ExamSubmitButton`.
- `/exam` page rebuilt: level info strip uses `level-surface` + `level-text` tokens (no opacity-hex hack); empty state for zero-content levels.
- `/exam/[mockId]` page rebuilt: sections grouped into Schriftlich / Mündlich blocks with 60% threshold reminder, lucide icons replacing emoji.
- All exam runners (Listening, Reading, Writing, Speaking, Sprachbausteine) now use the unified `ExamRunnerHeader` with the top 3px progress bar + amber-only timer.
- `AnswerOption` component enforces the left-accent selection pattern — explicitly NOT a full brand-background fill.

### Tests
- 182 vitest tests pass (up from 176). New suites: ExamTimer (10 tests, never-red gate), MockCard (5 states), SectionHub (5 cases incl. A1 no-Sprachbausteine vs B1+ with it), AnswerOption (6 review states).
- Updated SectionIntro test to pass `Icon` component prop.
- Updated `ListeningExam` Vitest + 4 Playwright specs for the new `data-state` attribute + left-accent selectors.

### CI
- `pnpm typecheck` — green.
- `pnpm --filter @fastrack/web test` — green.
- `pnpm --filter @fastrack/web build` — green; exam routes 3-5KB per route.
- Mobile jest suite fails pre-existing on main (expo-modules-core syntax error) — not in scope for web ticket.

### Handoff
- `.planning/handoffs/2026-04-20-ux-phase3-mocks-runner.md`
