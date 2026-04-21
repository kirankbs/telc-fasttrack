# Fastrack Deutsch

German exam prep app for telc A1 through C1. "Spend X hours. Pass telc."

pnpm monorepo: web-first (Next.js 15) with mobile (Expo) sharing core packages.

## Monorepo Structure

```
apps/
  web/      — Next.js 15 App Router, Tailwind CSS 4, responsive (primary)
  mobile/   — Expo SDK 54, React Native 0.81, expo-router 6
packages/
  types/    — @fastrack/types: MockExam interfaces, all shared TypeScript types
  core/     — @fastrack/core: scoring engine, spaced repetition (SM-2), timer
  config/   — @fastrack/config: design tokens (colors, typography, spacing)
  content/  — @fastrack/content: exam catalog, validation, content metadata
```

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** Next.js 15 / React 19 / Tailwind CSS 4 / TypeScript
- **Mobile:** Expo SDK 54 / React Native 0.81 / React 19 / TypeScript
- **Database (mobile):** expo-sqlite 16 (offline-first, no backend)
- **State:** React Context + useReducer
- **Node:** 22+

## Commands

```bash
pnpm dev:web              # start Next.js dev server (port 3000)
pnpm dev:mobile           # start Expo dev server
pnpm typecheck            # typecheck all packages
pnpm test                 # run all tests
pnpm build                # build all packages
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/types/src/exam.ts` | MockExam TypeScript interfaces — canonical definition |
| `packages/config/src/theme.ts` | Design tokens — NEVER hardcode hex values |
| `packages/core/src/scoring.ts` | telc scoring logic (60% pass threshold per section) |
| `packages/core/src/spaced-repetition.ts` | SM-2 algorithm for vocabulary flashcards |
| `packages/core/src/timer.ts` | Section time limits per telc spec |
| `packages/content/src/catalog.ts` | Mock exam catalog metadata |
| `apps/web/src/app/layout.tsx` | Web app root layout |
| `apps/mobile/src/app/_layout.tsx` | Mobile app root layout (5 bottom tabs) |
| `apps/mobile/src/services/database.ts` | SQLite schema + migration support |
| `fastrack-deutsch-implementation-plan.md` | Full requirements doc |

## Shared Packages

All apps import shared logic via `workspace:*` protocol:
- **Types:** `import type { MockExam } from '@fastrack/types'`
- **Core:** `import { calculateExamScore } from '@fastrack/core'`
- **Config:** `import { colors, LEVEL_CONFIG } from '@fastrack/config'`
- **Content:** `import { getMocksForLevel } from '@fastrack/content'`

Mobile app has thin re-export shims in `apps/mobile/src/{types,utils,services}/` so existing relative imports still resolve.

## Content

- **Mock exams:** `apps/mobile/assets/content/{level}/mock_XX.json` — 10 per level
- **Vocabulary:** `apps/mobile/src/data/vocabulary/{level}_vocabulary.json`
- **Grammar:** `apps/mobile/src/data/grammar/{level}_grammar.json`

## Telc Exam Key Facts

- **Pass threshold:** 60% in BOTH written AND oral (applies to all levels)
- **A1:** 65 min written, 15 min oral
- **Sprachbausteine:** B1+ only (cloze exercises)
- **Speaking prep time:** 20 min for B1 and B2, 0 for A1/A2/C1
- **A1 vocab target:** 650 words (Goethe A1 Wortliste)

## Priority

**Web app is primary focus.** A1 content is most complete (10 mocks, 650 words).

## Agent Team

13 agents in `.claude/agents/`, all registered with full frontmatter. Orchestrated via the `/deep-work` skill.

Subagents with `Agent` tool access (implementation-lead, ux-engineer) can self-dispatch quality gates (language-checker, exam-tester, pedagogy-director, spec-tracker) — orchestrator doesn't need to serialize these anymore.

## Git

- **Orchestrator** (this session): Never run `git add`, `git commit`, or `git push` unless user says "ad-hoc" — otherwise provide the full command block for the user to execute
- **Subagents** (implementation-lead, ux-engineer): May run `git add`, `git commit`, `git push`, and `gh pr create` autonomously on feature branches. No permission needed.
- Never commit or push directly to `main`. All changes go through a branch and PR (except when user explicitly says "ad-hoc").
- Feature work goes in `.worktrees/<branch-name>` — run `git fetch origin && git pull origin main` first
- No Co-Authored-By or AI attribution in commits

## Multi-Agent Merge Hygiene (Learned 2026-04-21)

Parallel PRs are powerful but share-write hotspots create cascading merge conflicts. Rules:

1. **Never write to `.planning/ACTIVITY-LOG.md` from a feature branch.** Activity-log entries only append from `main` (orchestrator or post-merge script). Branches that touch it will conflict on every subsequent merge.

2. **When editing `packages/content/src/catalog.ts` (or any shared array), write the ENTIRE canonical level array to the final converged state — not just your slot.** Each mock PR must set all 10 B2 titles to their final values, not `titles.B2[N] = 'my mock'` with other slots stale. This guarantees every branch converges on the same end state, eliminating cross-PR conflicts.

3. **Handoff files are per-PR and date-stamped** — they never collide. Safe to write from feature branches.

4. **Per-mock SSML files are also per-PR** — `.planning/audio-prompts/B2_mock_NN_*.ssml` files don't collide across branches.

## Content-Strategy Pre-Advise

Before content-strategist advises "what to build next", it **must** cross-check actual shipped state with `gh pr list --state all --limit 30` + `git log --oneline -30`. Reading `.planning/content-roadmap.md` alone is not sufficient — the roadmap can lag behind recent PR merges. A stale roadmap caused a 1-hour misdirection on 2026-04-20.

## Rate-Limit Budget

Parallel dispatches (5+ simultaneous impl-lead agents) can exhaust Claude subscription quota mid-wave. Symptom: tasks return "You've hit your limit" with near-zero token count after partial authoring. Mitigation: orchestrator staggers waves (3-5 at a time, not 9), confirms one full wave completes before next.
