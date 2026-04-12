# Telc-FastTrack — Agent Instructions

---

## ORCHESTRATION GATE — THIS APPLIES BEFORE ANYTHING ELSE

**You MUST NOT write or edit any source file directly as the orchestrator.**

**What counts as coding directly:** Editing screens. Editing components. Editing mock exam content. Editing services, hooks, types, or config files. Any `Edit` or `Write` on any `.ts`, `.tsx`, `.json`, `.css`, or `.md` file in the codebase. All of it. Without exception.

**The escape hatch:** If the user said the word **`ad-hoc`** in their message, you may work directly. Without that word, you have no choice — dispatch `implementation-lead` or `ux-engineer`.

**Exempt from the gate (edit directly, no dispatch needed):**
- `.planning/` files — ACTIVITY-LOG.md, showcases, handoffs, contracts, any planning artifact
- `.claude/` files — agent definitions, settings.json, conventions, skills
- `CLAUDE.md` itself
- Tooling/config with zero user-facing impact: `eslint.config.*`, `tsconfig*.json`, `vitest.config.*`, `playwright.config.*`, `.gitignore`, `prettier.config.*`

**Mandatory flow for every coding task:**
1. Confirm a GitHub issue exists and is in the **In Progress** column of the project board — if not, create one and move it there first
2. If the issue has no AC: run `product-owner` pre-implementation mode to write AC as an issue comment before any code
3. Dispatch the right subagent based on label:
   - `scope:ux` → `ux-engineer` (implement mode) with: issue number, AC comment URL, branch name
   - Everything else → `implementation-lead` with: issue number, AC comment URL, branch name
4. Wait for it to return — it only returns when CI is green and handoff file is written
5. Run post-coding gates: `product-owner` sign-off

**Why this is non-negotiable:** Every time the orchestrator codes directly, the CI loop breaks, tests get skipped, and the user cleans up the mess. Keep implementation in the implementation-lead where tests, CI, and handoffs are enforced.

---

## Project Overview

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
pnpm test:e2e             # Playwright E2E tests
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

---

## Worktree Setup

Before any new task:
1. `git fetch origin && git pull origin main` in the repo root
2. `git worktree add .worktrees/<branch-name> -b <branch-name>`
3. All work happens inside `.worktrees/<branch-name>`

Branch names: kebab-case, meaningful, under 50 chars.

---

## Planning Files — Live in Repo Root, User Commits Them

Planning files (`.planning/`, `.claude/conventions/`, `specs/`) always live in the **repo root working directory**, never inside worktrees.

**Agents write planning files to the repo root.** When dispatching any agent, do NOT tell it to write planning files into the worktree path. The repo root `.planning/` is the right location.

**PRs contain source code only.** Planning artifacts (ACTIVITY-LOG.md, showcases, handoffs, AC contracts) are NOT committed as part of feature PRs. The user commits all planning file changes manually at the end of the session from the repo root.

| Source | Purpose |
|--------|---------|
| GitHub Issues | All work items — create with `gh issue create`, manage with `gh issue edit/close` |
| GitHub Project Board | Live board — columns: Backlog → Ready → In Progress → In Review → Done |
| `.planning/ACTIVITY-LOG.md` | Append-only log — every agent appends 2–4 lines on start and finish |
| `.planning/reports/` | Quality gate reports (exam-tester, pedagogy-director, compliance-guardian) |
| `.planning/showcases/` | product-owner sign-off files (also posted as issue comments) |
| `.planning/handoffs/` | implementation-lead and ux-engineer handoff files — one per PR, written after CI green |

---

## Gate: Content Work

Any PR adding or modifying mock exam content must run this sequence in order. No step can be skipped.

### Before writing content
- Confirm a GitHub issue exists and is in the **In Progress** column
- If none exists: `gh issue create --title "Title" --label "content,scope:content,PX"` then move to In Progress
- If no AC: run `product-owner` pre-implementation mode

### Implementation
- Dispatch `implementation-lead` — do NOT write content directly as orchestrator

### After content is written (implementation-lead handles these)
1. Run `spec-tracker` — mode: `sync`, `changed_files` = new content files
2. Run `exam-tester` — mode: `layer-a` (10 content checks), then `layer-b` (TypeScript + tests)
3. Run `pedagogy-director` — mode: `review`, level of changed content
4. Run `compliance-guardian` — mode: `scan`, `changed_files` = changed files
5. Run `language-checker` — check German accuracy + CEFR compliance

### Before merge
- Exam-tester Layer A + Layer B must be green
- Run `product-owner` in post-implementation sign-off mode
- Issue moves to **Done** column, sign-off posted as issue comment

---

## Gate: Feature / Bug Work

Any PR adding features or fixing bugs must follow this sequence.

### Before coding
- Confirm GitHub issue exists and is **In Progress**
- If no AC: run `product-owner` pre-implementation mode

### Implementation — dispatch based on label

Check the issue label: `gh issue view <number> --json labels --jq '.labels[].name'`

- `scope:ux` → dispatch `ux-engineer`
- Everything else → dispatch `implementation-lead`

Both are peers. Neither dispatches the other.

### After implementation (subagent handles these)
- Unit tests: new components, services, hooks (vitest for web, jest for mobile)
- E2E: observable browser changes (Playwright against Vercel preview)
- `compliance-guardian` if auth/PII touched
- `language-checker` if German content or UI strings changed

### Before merge
- CI must be green (typecheck + tests)
- Run `product-owner` sign-off

---

## Test Requirements

| Change type | Required tests |
|-------------|---------------|
| New UI component | Unit: render states, props, accessibility |
| New service/utility | Unit: logic, edge cases |
| Observable browser change | E2E: Playwright |
| Mock exam content | exam-tester Layer A + Layer B |
| Bug fix | Regression test proving the fix |

---

## Activity Log Format

Every agent appends to `.planning/ACTIVITY-LOG.md` on start and finish:

```
HH:MM | agent-name | START | work-item-id | what is being done
HH:MM | agent-name | DONE  | work-item-id | what was completed + output location
```

---

## Parallel Agent Waves

Only batch items touching **different source files**. If two waves share a file, run them sequentially.

---

## Git & PR Permissions

- Agents MAY commit and push to **branches** (never main directly)
- All changes reach main via PR
- PR must follow template in `.claude/conventions/pr-template.md`
- CI failure is BLOCKING — do not move to next item until current PR is green

**CI verification:**
1. `gh pr checks <number>` — all checks must pass
2. If any fail: read logs, fix, push, re-check
3. Repeat until 100% green
4. Only after green: write handoff, return to orchestrator

---

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

13 agents in `.claude/agents/`. Orchestrated via the `/deep-work` skill.

See `.claude/AGENTS-GUIDE.md` for the full trigger table and team overview.

## Git

- Never run `git add`, `git commit`, or `git push`
- Always provide the full command block at the end for the user to execute
- Feature work goes in `.worktrees/<branch-name>` — run `git fetch origin && git pull origin main` first
- No Co-Authored-By or AI attribution in commits
