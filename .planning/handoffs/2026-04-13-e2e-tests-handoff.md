# Handoff — E2E Tests (#10)

**Date:** 2026-04-13
**Agent:** ux-engineer
**PR:** https://github.com/kirankbs/telc-fasttrack/pull/12
**Branch:** `e2e-exam-ui`

---

## What was done

6 Playwright E2E spec files, 23 tests, all passing locally against `localhost:3000`.

| File | Tests | Coverage |
|------|-------|----------|
| `exam-section-flow.spec.ts` | 4 | Intro→active→submit for all 4 sections |
| `exam-timer.spec.ts` | 1 | Warning threshold (5 min), auto-submit on expiry |
| `exam-listening.spec.ts` | 5 | MCQ selection classes, part tab progress, answer persistence |
| `exam-reading.spec.ts` | 4 | true_false, matching, submit-disabled gate |
| `exam-writing.spec.ts` | 4 | form_fill inputs, word count, Musterlösung toggle |
| `exam-navigation.spec.ts` | 5 | Full chain Hören→Lesen→Schreiben→Sprechen→overview |

Infrastructure added:
- `playwright.config.ts` at monorepo root (`testDir: apps/web/e2e/`)
- `@playwright/test` in `apps/web` devDependencies
- `pnpm test:e2e` script in root `package.json`

---

## Content/component discovery

Listening Part 2 in `mock_01.json` is `true_false` type with no MCQ options. The `ListeningExam` component only renders `(q.options ?? [])` — so Part 2 has no rendered radio buttons. Tests for the Hören full-flow use `page.clock.runFor()` to expire the timer and trigger auto-submit. This is the correct telc exam behavior and also exercises the `onExpire` callback path.

This content gap (Listening Part 2 having no options) should be addressed separately — either:
1. Add `type: 'true_false'` rendering to `ListeningExam` (like `ReadingExam` handles it)
2. Update `mock_01.json` Part 2 to use MCQ format

---

## CI status

- `@telc/web typecheck`: clean (no errors locally, web check in CI ran after mobile failure short-circuited the run)
- `@telc/mobile typecheck`: pre-existing failures on `main` branch (`MaterialCommunityIcons`, `timerService`) — NOT caused by this branch
- E2E CI check: pending/expected-fail until #9 is merged (Vercel preview URL fix)

---

## Dependencies

- Merge #9 first (playwright.yml Vercel URL fix) — then E2E CI will work against Vercel preview
- Mobile typecheck failures need to be resolved in a separate PR before the overall CI is clean
