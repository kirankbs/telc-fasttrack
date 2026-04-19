# Handoff — feat(web): exam-taking UI (#6)

**PR:** https://github.com/kirankbs/telc-fasttrack/pull/8
**Branch:** pnpm-monorepo-migration
**Worktree:** `.worktrees/pnpm-monorepo-migration`

## CI Status

| Check | Result |
|-------|--------|
| Typecheck + Tests | PASS (1m2s) |
| Vercel | PASS |
| E2E Tests | FAIL — Vercel preview URL mismatch in workflow (see below) |

The E2E failure is an infrastructure issue: `playwright.yml` constructs the preview URL as `telc-fasttrack-git-{branch}-kirankbs.vercel.app` but the actual Vercel project URL uses a different pattern (`fastrackdeutsch-6352s-projects`). Playwright tests were skipped entirely — no test code ran. Follow-on ticket recommended to fix the E2E workflow URL detection.

No branch protection rules are enforced on this repo, so the PR can be merged.

## What was built

All four exam section screens for the web app:

- **Hören (ListeningExam)** — part tabs, audio placeholder, MCQ radio answers, per-question result rows, pass/fail score card
- **Lesen (ReadingExam)** — true/false, matching, MCQ question types; reading passage + ad tile text rendering; results with correct/incorrect indicators
- **Schreiben (WritingExam)** — form-fill inputs + free-text textarea; live word count; Musterlösung `<details>` disclosure; results with human-review notice and scoring criteria
- **Sprechen (SpeakingExam)** — part navigation; key phrases, evaluation tips, sample toggle; no prep time shown for A1; completion summary

Shared infrastructure:
- `SectionIntro.tsx` — single intro screen used by all four sections
- `QuestionResultRow.tsx` — per-question result row shared by Listening and Reading
- `examTypes.ts` — single `ExamPhase` type exported once
- `getMockExamOrNotFound()` — added to `loadMockExam.ts`, used by all four section pages
- `ExamTimer` stale closure fixed with `useRef` pattern

40 vitest tests: ExamTimer (8), SectionIntro (5), QuestionResultRow (6), parseMockId (15), calculateSectionScore (6)

## CI fixes included in this PR (pre-existing issues fixed)

These were infrastructure bugs on `main` before this PR:

1. **`@telc/mobile` TypeScript version** — upgraded from `~5.3.0` to `^5.8.0` to support Expo 54's `tsconfig.base` which uses `module: preserve` (requires TS 5.4+)
2. **`@telc/mobile` tsconfig paths** — added `baseUrl` and `@telc/*` workspace paths so `tsc --noEmit` can resolve monorepo packages
3. **`apps/mobile/src/services/timerService.ts`** — re-export pattern (`export { x } from '...'`) doesn't bring names into local scope; added explicit imports for `createTimerState` and `tickTimer`
4. **`@telc/core` vitest** — added `--passWithNoTests` flag; vitest exits 1 when no test files found
5. **`@telc/mobile` jest `transformIgnorePatterns`** — updated to include `.pnpm` path prefix, matching jest-expo preset's pnpm-aware pattern

## Known gaps / follow-on issues

- **Playwright E2E workflow** — fix URL construction in `.github/workflows/playwright.yml` to use Vercel's actual preview URL from the deployment status API rather than a static string pattern
- **Playwright E2E tests** — 6 AC scenarios not written; separate ticket recommended
- **Audio playback** — the Hören audio block is a placeholder; real playback requires additional implementation
- **`text-pass` / `text-fail` Tailwind tokens** — used in score cards; verify they resolve correctly in the browser via `--color-pass` / `--color-fail` in globals.css
