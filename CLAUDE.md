# Telc-FastTrack — Agent Instructions

---

## ⛔ ORCHESTRATION GATE — THIS APPLIES BEFORE ANYTHING ELSE

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

## Orchestration Rule — Summary

All coding is delegated to specialized subagents. Route by issue label:
- `scope:ux` → dispatch `ux-engineer`
- Everything else → dispatch `implementation-lead`

Both are peers. Neither dispatches the other.

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
- Confirm a GitHub issue exists and is in the **In Progress** column of the project board
- If none exists: `gh issue create --title "Title" --label "content,scope:content,PX"` then move to In Progress
- If the issue has no Acceptance Criteria: run `product-owner` in pre-implementation mode — AC goes as an issue comment before implementation begins

### Implementation
- Dispatch `implementation-lead` — do NOT write content directly as orchestrator

### After content is written (implementation-lead handles these)
1. Run `spec-tracker` — mode: `sync`, `changed_files` = new content files
2. Run `exam-tester` — mode: `layer-a` (10 content checks), then `layer-b` (TypeScript + Jest)
   - Fix ALL critical failures from Layer A before continuing
3. Run `pedagogy-director` — mode: `review`, level of changed content
   - Fix ALL BLOCK findings before continuing
4. Run `compliance-guardian` — mode: `scan`, `changed_files` = changed files
5. Run `language-checker` — check German accuracy + CEFR compliance

### Before merge
- Exam-tester Layer A + Layer B must be green
- Run `product-owner` in post-implementation sign-off mode
- `product-owner` must: move issue to **Done** column, post sign-off as issue comment, update `ACTIVITY-LOG.md`, and create a showcase file in `.planning/showcases/`

---

## Gate: Feature / Bug Work

Any PR adding features or fixing bugs must follow this sequence.

### Before coding
- Confirm a GitHub issue exists and is in the **In Progress** column of the project board
- If none exists: `gh issue create --title "Title" --label "TYPE,scope:SCOPE,PX"` then add to board and move to In Progress
- If the issue has no Acceptance Criteria: run `product-owner` in pre-implementation mode

### Implementation — dispatch based on label

**Check the issue label first:**
```bash
gh issue view <number> --json labels --jq '.labels[].name'
```

**If `scope:ux` label present → dispatch `ux-engineer` (implement mode):**
`ux-engineer` is responsible for:
- All visual/UI code changes
- Unit tests for every new/modified component
- Calling `visual-asset-designer` sub-agent if visual assets needed
- Running `compliance-guardian` if sensitive content touched
- Staying in CI loop until green
- Writing handoff notes to `.planning/handoffs/{date}-ux-{slug}.md` in the **repo root**

**Otherwise → dispatch `implementation-lead`:**
`implementation-lead` is responsible for:
- All code changes
- Unit tests for every new exported component or function
- Running `compliance-guardian` if touching PII or sensitive data
- Staying in CI loop until green
- Writing handoff notes to `.planning/handoffs/{date}-impl-{slug}.md` in the **repo root**

### After implementation — orchestrator checks
- CI is green (implementation-lead confirms before returning)
- Run `product-owner` in sign-off mode — BLOCKING, do not start next item until complete

---

## Test Requirements

| Change type | Unit tests | E2E tests |
|-------------|-----------|-----------|
| New UI component | Required — render states, interaction logic | Required (Phase 2 — web app) |
| Bug fix | If logic extracted | Required — fixed behaviour |
| New service/utility | Required | Optional |
| Mock exam content | Via exam-tester Layer A | Via exam-tester Layer B |

Tests are written BEFORE the PR is opened — not retroactively.

---

## GitHub Project Board

**Project:** kirankbs/telc-fasttrack project board (fill in after creation)

### Column lifecycle:
| Column | Who moves here | When |
|--------|---------------|------|
| Backlog | Orchestrator / user | Item exists but not yet prioritised |
| Ready | product-owner | AC written as issue comment |
| In Progress | Orchestrator / impl-lead | Work started, worktree created |
| In Review | impl-lead | PR opened |
| Done | product-owner | PR merged, CI green, sign-off complete |

### Key commands for agents:

**Create an issue:**
```bash
gh issue create --title "Title" --label "feature,scope:content,P2" --body "Scope"
```

**Add to project board and move to column:**
```bash
# Add to board — capture returned item ID (PVTI_...)
gh project item-add <PROJECT_NUMBER> --owner kirankbs \
  --url "https://github.com/kirankbs/telc-fasttrack/issues/N" --format json

# Move to a column
gh project item-edit \
  --project-id <PROJECT_ID> \
  --id <PVTI_id> \
  --field-id <FIELD_ID> \
  --single-select-option-id <OPTION_ID>
```

**Status option IDs** (fill in after board creation):
| Column | Option ID |
|--------|-----------|
| Backlog | `TBD` |
| Ready | `TBD` |
| In Progress | `TBD` |
| In Review | `TBD` |
| Done | `TBD` |

---

## Activity Log Format

Every agent appends to `.planning/ACTIVITY-LOG.md` (repo root) on start and finish:

```
### HH:MM — {agent-name} — {action-type} — {issue-number or branch}
- One-line summary of what was done / found
- Verdict or status
- Report path if applicable
```

Newest entries go at the top of the current date block.

---

## Parallel Agent Waves — File Ownership Rule

When dispatching multiple agents in parallel, only batch items that touch **different source files**. Two branches modifying the same file will conflict on merge.

**Safe to parallelize:** items on different screens/components or content mocks. A `ux-engineer` wave and an `implementation-lead` wave can run in parallel if they touch different files.

**Must be sequential:** items that both modify the same file.

---

## Git & PR Permissions

Agents may run `git add`, `git commit`, `git push`, and `gh pr create` autonomously on **branches**. No permission needed for these operations.

**Never commit or push directly to `main`.** All changes must go through a branch and PR. When a PR is CI-green and ready, notify the user and wait for explicit approval before merging.

### PR Description Format

Every PR must follow `.claude/conventions/pr-template.md`. The format is:
- **Summary**: one bullet per issue with specific description
- **Quality Gates**: table of gates run with actual results — never write PASS for a gate you didn't run
- **Test plan**: CI checkbox + product-owner sign-off checkbox

### Session Summary Format

After a work item (or group) is fully shipped — PR merged, CI green, product-owner signed off — show a summary table following `.claude/conventions/session-summary.md`. Only after sign-off, not before.

### CI failure loop

This loop is BLOCKING. Do not move on to other work until the current PR is green.

If CI fails on a PR:
1. Read the failure logs immediately: `gh run view <run-id> --log-failed`
2. Diagnose the root cause — read the actual error, do not guess
3. Fix the root cause in the worktree — not the tests unless the test is wrong
4. Commit and push
5. Poll CI every 2-3 minutes: `gh pr checks <number>`
6. Repeat from step 1 if still failing
7. Before declaring done, run this exact command and confirm it returns no output:
   ```
   gh pr checks <number> | grep -v pass | grep -v "^$"
   ```
   If this returns any lines, CI is NOT actually green — continue the loop.
8. Only after the above command returns empty: notify the user "PR #{n} is CI-green and ready to merge"

Transient failures should be fixed by re-running the job with `gh run rerun <run-id>`, not by pushing code changes.

Starting the next task before current PR CI is green is a protocol violation.

No `Co-Authored-By` lines. No Claude/AI attribution anywhere.

---

## Stack

- **Framework:** Expo SDK 54 / React Native 0.81 / React 19 / TypeScript
- **Navigation:** expo-router 6 (file-based) with bottom tabs — 5 tabs: Home, Practice, Exam, Resources, Settings
- **Database:** expo-sqlite 16 (offline-first, no backend)
- **State:** React Context + useReducer
- **Animations:** react-native-reanimated 4 (never use legacy Animated API)
- **Audio:** expo-audio 1 (listening playback) + expo-speech 14 (vocabulary TTS)
- **Speech recognition:** @jamsch/expo-speech-recognition (migrate to expo-speech-recognition when ready)
- **Node:** 22+ compatible (SDK 54 requirement)

## Architecture

Content is bundled JSON + pre-generated MP3 audio. No network calls in core learning flow.

- **Mock exams:** `assets/content/{level}/mock_XX.json` — 10 per level, target
- **Audio:** `assets/audio/{level}/mockXX/` — pre-generated Google Cloud WaveNet MP3s
- **Vocabulary:** `src/data/vocabulary/{level}_vocabulary.json`
- **Grammar:** `src/data/grammar/{level}_grammar.json`
- **DB:** 8 SQLite tables (see `src/services/database.ts`)

## Key Files

| File | Purpose |
|------|---------|
| `src/types/exam.ts` | MockExam TypeScript interfaces — canonical definition |
| `src/utils/theme.ts` | Design tokens — NEVER hardcode hex values |
| `src/services/database.ts` | SQLite schema + migration support |
| `src/services/scoringEngine.ts` | telc scoring logic (60% pass threshold per section) |
| `src/services/spacedRepetition.ts` | SM-2 algorithm for vocabulary flashcards |
| `src/services/studyPlanEngine.ts` | "X hours to pass" daily recommendations |
| `src/app/_layout.tsx` | Root layout (5 bottom tabs) |
| `telc-fasttrack-implementation-plan.md` | Full requirements doc — all agents reference this |

## Content Schema

Mock exams follow the `MockExam` TypeScript interface in `src/types/exam.ts`. See requirements doc section 7 for the full definition with all sub-types (ListeningSection, ReadingSection, WritingSection, SpeakingSection).

Mock exam file naming: `assets/content/A1/mock_01.json` through `mock_10.json`

## Testing

```bash
npx tsc --noEmit          # type check
npx jest --no-cache --forceExit   # run all tests
```

Tests live in `__tests__/` mirroring `src/` structure.

## Code Patterns

- **Colors/typography:** import from `src/utils/theme.ts` — never hardcode hex
- **Database:** always async (`database.execAsync`, `getAllAsync`, `getFirstAsync`)
- **Animations:** `useAnimatedStyle`, `useSharedValue`, `withSpring`, `withTiming` from reanimated
- **Navigation:** typed expo-router routes, cast as `any` only with explanatory comment
- **Content loading:** via `src/services/contentLoader.ts`
- **Timer:** via `src/services/timerService.ts` (per-section limits per telc spec)

## Telc Exam Key Facts

- **Pass threshold:** 60% in BOTH written AND oral (applies to all levels)
- **A1:** 65 min written, 15 min oral. Sections: Hören (20 min, ~24 pts), Lesen (25 min, ~24 pts), Schreiben (20 min, ~12 pts), Sprechen (15 min, ~24 pts)
- **Sprachbausteine:** B1+ only (cloze exercises)
- **Speaking prep time:** 20 min for B1 and B2, 0 for A1/A2/C1
- **A1 vocab target:** 650 words (Goethe A1 Wortliste)

## Priority

**A1 = 80% of initial effort.** Do not build A2+ content until A1 has 5+ complete mocks, 400+ vocabulary words, and end-to-end exam simulation validated.

## Agent Team

13 agents in `.claude/agents/`. Orchestrated via the `/deep-work` skill.

See `.claude/AGENTS-GUIDE.md` for the full trigger table and team overview.
