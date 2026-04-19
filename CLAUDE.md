# Telc-FastTrack

German exam prep app for telc A1 through C1. "Spend X hours. Pass telc."

pnpm monorepo: web-first (Next.js 15) with mobile (Expo) sharing core packages.

## Monorepo Structure

```
apps/
  web/      — Next.js 15 App Router, Tailwind CSS 4, responsive (primary)
  mobile/   — Expo SDK 54, React Native 0.81, expo-router 6
packages/
  types/    — @telc/types: MockExam interfaces, all shared TypeScript types
  core/     — @telc/core: scoring engine, spaced repetition (SM-2), timer
  config/   — @telc/config: design tokens (colors, typography, spacing)
  content/  — @telc/content: exam catalog, validation, content metadata
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
| `telc-fasttrack-implementation-plan.md` | Full requirements doc |

## Shared Packages

All apps import shared logic via `workspace:*` protocol:
- **Types:** `import type { MockExam } from '@telc/types'`
- **Core:** `import { calculateExamScore } from '@telc/core'`
- **Config:** `import { colors, LEVEL_CONFIG } from '@telc/config'`
- **Content:** `import { getMocksForLevel } from '@telc/content'`

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

11 agents in `.claude/agents/`. Orchestrated via the `/deep-work` skill.

## Git

- **Orchestrator** (this session): Never run `git add`, `git commit`, or `git push` — always provide the full command block for the user to execute
- **Subagents** (implementation-lead, ux-engineer): May run `git add`, `git commit`, `git push`, and `gh pr create` autonomously on branches. No permission needed for these operations.
- Never commit or push directly to `main`. All changes go through a branch and PR.
- Feature work goes in `.worktrees/<branch-name>` — run `git fetch origin && git pull origin main` first
- No Co-Authored-By or AI attribution in commits
