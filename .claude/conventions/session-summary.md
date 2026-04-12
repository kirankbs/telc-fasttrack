# Session Summary Convention

Show when work items fully shipped and closed (PR merged, CI green, sign-off done). Not after every task, but meaningful work blocks.

## Format

| | |
|---|---|
| **PR** | `feat(content): A1 mock exams 06-10 (#5)` — merged |
| **CI** | typecheck: pass, vitest: pass, playwright: pass |
| **Content** | 5 mock exams (06-10), topics: Arbeit, Freizeit, Gesundheit, Reisen, Einkaufen |
| **Quality** | pedagogy: PASS (1 rewrite), compliance: PASS, language: PASS |
| **Specs** | 5 spec files synced |
| **Sign-off** | product-owner approved — issue #5 moved to Done |
| **Backlog** | 3 items remaining: A1 grammar expansion, audio generation, flashcard UI |

## Rules

- Only include relevant rows (skip Content for pure feature PRs, skip Quality for infra PRs)
- CI row: list each check with pass/fail
- Always show issue numbers transitioning to Done
- Keep each value cell to one line
