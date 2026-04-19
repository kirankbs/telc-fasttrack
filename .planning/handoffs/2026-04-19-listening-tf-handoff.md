# Handoff: ListeningExam true_false fix

**PR:** #17
**Branch:** `fix-listening-true-false`
**Issue:** #13

## What changed

`apps/web/src/components/exam/ListeningExam.tsx` — the question rendering block now dispatches on `q.type` instead of blindly rendering `q.options` for every question.

- `true_false` questions render richtig/falsch radio buttons (same pattern as ReadingExam)
- `mcq` questions render `q.options` radio labels (existing behavior, now gated behind type check)
- `allAnswered` computation unchanged — already spans all parts/questions regardless of type

## Files changed

| File | Change |
|------|--------|
| `apps/web/src/components/exam/ListeningExam.tsx` | Type-dispatched question rendering |
| `apps/web/src/__tests__/exam/ListeningExam.test.tsx` | 6 new vitest unit tests |
| `apps/web/e2e/exam-listening.spec.ts` | 3 new Playwright E2E tests for Part 2 true_false |

## Verification

- Typecheck: clean
- Unit tests: 46/46 pass (6 new)
- CI: all 4 checks green (Typecheck+Tests, E2E Tests, Vercel Deploy, Vercel Preview Comments)
