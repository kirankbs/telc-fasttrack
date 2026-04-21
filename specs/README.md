# Specs Index

> **Last updated:** 2026-04-20

## Content Format

| Spec | Source | Summary |
|------|--------|---------|
| [`content-format/mock-exam-schema.md`](content-format/mock-exam-schema.md) | `packages/types/src/exam.ts` | TypeScript interfaces for all mock exam JSON files; edge cases for stubs, missing audio, word bank rendering |
| [`content-format/b2-mock-content-conventions.md`](content-format/b2-mock-content-conventions.md) | `apps/mobile/assets/content/B2/mock_01.json`, B2 SSML files | B2 structural rules, item counts, SSML conventions, calibration rules for mocks 02–10 |

## Services

| Spec | Source | Summary |
|------|--------|---------|
| [`services/content-catalog.md`](services/content-catalog.md) | `packages/content/src/catalog.ts` | Mock exam metadata catalog; title generation logic; known catalog/JSON title mismatch for B2 mock_01 |

## Coverage Gaps

The following source areas have no spec yet (bootstrap not yet run):

- `src/app/**/*.tsx` — screens (dashboard, practice, exam simulator, score report, resources, settings)
- `src/components/**/*.tsx` — all UI and exam components
- `src/services/database.ts` — SQLite schema and migrations
- `packages/core/src/scoring.ts` — telc scoring logic
- `packages/core/src/spaced-repetition.ts` — SM-2 algorithm
- `packages/core/src/timer.ts` — section time limits
