---
name: deep-work
description: "Telc-FastTrack autonomous build sessions with a 10-agent virtual team. Triggers on: \"deep work\", \"autonomous mode\", \"build something\", \"work while I'm away\", \"I'm going to sleep\", \"work autonomously\", \"research and build\", \"keep working\", \"unattended\", \"run overnight\". Also responds to standalone agent triggers: \"research exam format\", \"research vocabulary gaps\", \"what should we build next\", \"update content roadmap\", \"review mock exam\", \"validate mock\", \"build mock\", \"implement feature\", \"generate audio\", \"audit audio\", \"update specs\", \"sync specs\", \"run compliance check\", \"check language\", \"run full test\", \"review UX\", \"design feature\"."
---

# Telc-FastTrack — Deep Work

Autonomous build sessions for the telc-fasttrack app. Orchestrates a 10-agent virtual team across research, quality, build, and ops layers to grow the mock exam library, build features, and improve content quality without requiring the user to be present.

## Quick Reference

```
/deep-work on <level>          full autonomous session (e.g., /deep-work on A1)
/deep-work continue            resume from last session's handoff
/deep-work help                show usage guide (.claude/AGENTS-GUIDE.md)
```

### Standalone Agent Triggers

| You say | Dispatches |
|---------|-----------|
| "research A1 exam format" / "research vocabulary gaps for B1" | `exam-researcher` |
| "what should we build next" / "update content roadmap" | `content-strategist` |
| "review A1 mock 03" / "validate mock A1_mock_02" | `pedagogy-director` |
| "run compliance check" | `compliance-guardian` |
| "check language" / "check German content for A1" | `language-checker` |
| "build A1 mock 04" / "implement feature: flashcard system" | `implementation-lead` |
| "generate audio for A1 mock 01" / "audit audio coverage" | `audio-designer` |
| "update specs" / "sync specs" | `spec-tracker` |
| "run full test" / "run content validation" | `exam-tester` |
| "review timer UX" / "design score report" / "audit gamification" | `product-designer` |

When the user says something matching a standalone trigger outside a `/deep-work` session, dispatch the corresponding agent using the Agent tool. Pass the user's full message as context. When chaining is requested ("research then build"), dispatch agents sequentially.

## The Team

All agents registered in `.claude/agents/`. Dispatch by name using the Agent tool.

### Research Layer
| Agent | Model | Job |
|-------|-------|-----|
| `exam-researcher` | opus | telc exam format, CEFR scope, vocabulary gaps, audio coverage, competitor analysis. 5 research streams. |
| `content-strategist` | sonnet | Maintains `.planning/content-roadmap.md`. 3-axis scoring model. A1 gets 80% weight in initial phase. |

### Quality Layer
| Agent | Model | Job |
|-------|-------|-----|
| `pedagogy-director` | opus | Reviews mock content across 6 dimensions. Gated rewrite authority with `[PEDAGOGY-REWRITE]` tags. |
| `compliance-guardian` | sonnet | App Store compliance, accessibility, DSGVO, dependency audit. |
| `language-checker` | sonnet | German grammar accuracy, English UI consistency, CEFR vocabulary constraint enforcement. |

### Build Layer
| Agent | Model | Job |
|-------|-------|-----|
| `implementation-lead` | sonnet | Builds features, implements mock exam content, scaffolds screens/services/components. |
| `audio-designer` | sonnet | SSML scripting, WaveNet voice assignments, audio pipeline commands. |

### Ops Layer
| Agent | Model | Job |
|-------|-------|-----|
| `spec-tracker` | sonnet | Bootstrap and sync `specs/` directory. Preserves UX rationale. |
| `exam-tester` | sonnet | Layer A: 10 content checks. Layer B: TypeScript + Jest. Layer A blocks Layer B. |
| `product-designer` | sonnet | Timer UX, score reports, study plan, readiness gauge. Design direction only — no code. |

---

## The Loop

Each cycle follows this sequence. Run as many cycles as possible.

```
STRATEGIZE → RESEARCH → DESIGN → IMPLEMENT + AUDIO → QUALITY GATE → TEST → REVIEW → RETROSPECT
     ↑                                                                                        |
     +----------------------------------------------------------------------------------------+
```

---

### Phase: STRATEGIZE (cycle 1 only)

Dispatch `content-strategist` with:
- The target `level` from user arguments
- Instruction to read `.planning/content-roadmap.md` (check the "Last updated" timestamp; use git log to find changes since then)
- If no roadmap exists: instruct it to do a full scan (`force_refresh: true`) and create from scratch

**Output:** Prioritized build list for the session (P0 items to build this sprint).

Skipped in later cycles — priorities are locked for the session.

---

### Phase: RESEARCH

**Cycle 1 (new level or no prior research):**
Dispatch `exam-researcher` in the BACKGROUND with:
- `level` from arguments
- `mode=broad`
- Check `.planning/research/` for existing files at this level: if found, pass paths and investigate gaps only; if not found, do full 5-stream broad research

While research runs in the background, explore the codebase:
- Read `assets/content/{level}/` — understand current mock state
- Read `src/types/exam.ts` — understand MockExam interface
- Read `src/components/exam/` — understand existing question renderers
- Read `src/services/scoringEngine.ts` — understand scoring logic if it exists

**Later cycles (targeted):**
Only dispatch `exam-researcher` if RETROSPECT generated specific research questions. Pass with `mode=targeted`. If RETROSPECT produced no new questions, skip directly to DESIGN.

---

### Phase: DESIGN

Consume research output + strategist's P0 priorities. Design the work for this cycle.

**For mock exam content (primary work type):**

For each mock to build, outline:
- Mock ID and level
- Topic matrix: which Wortgruppenliste categories each section covers (no two mocks should overlap in topics)
- Section-by-section outline:
  - Hören: dialogue scenarios, speaker roles, announcement topics
  - Lesen: text types (emails, notices, ads), topics
  - Schreiben: form-fill fields, short message prompt
  - Sprechen: introduction prompt, picture card categories, follow-up topics
- Voice assignment plan for audio (which WaveNet voices play which roles)
- Expected vocabulary items to extract for flashcard deck

**For feature work:**
Read the relevant spec in `specs/` if it exists. Plan: files to create/modify, layer order (types → DB → services → hooks → context → components → screens → tests).

If the feature has significant UX implications (new screen, gamification mechanic), consult `product-designer` first. Pass the proposed design and ask for an ethics check.

---

### Phase: IMPLEMENT + AUDIO (parallel)

Dispatch two agents in parallel:

1. **`implementation-lead`** as FOREGROUND with:
   - The mock designs from DESIGN phase (full spec)
   - Files to create or modify
   - Instruction to read `src/types/exam.ts` and existing mocks first
   - Reminder: every question needs `explanation` field; audio references must follow path convention

2. **`audio-designer`** as BACKGROUND with:
   - The voice assignment plan from DESIGN phase
   - `mode=generate-ssml` — create SSML scripts for the mock's listening section
   - Target mock IDs

Wait for `implementation-lead` to complete before advancing to QUALITY GATE. Audio designer can finish during the gate — its output (SSML scripts) feeds the session report.

---

### Phase: QUALITY GATE (mandatory, parallel — 4 agents)

**THIS PHASE IS MANDATORY. You CANNOT proceed to TEST without completing it.**

Dispatch four agents in parallel:

1. **`pedagogy-director`** as FOREGROUND with:
   - Mock IDs of newly created/changed content
   - `mode=review-and-fix`
   - `level` of the content

2. **`compliance-guardian`** as BACKGROUND with:
   - `changed_files` = all files modified this cycle
   - `mode=scan`

3. **`language-checker`** as BACKGROUND with:
   - `scope=content-only` for mock-only changes; `scope=full` if UI code was changed
   - `changed_files` = changed content and/or UI files
   - `level` for CEFR vocabulary check

4. **`spec-tracker`** as BACKGROUND with:
   - `mode=sync`
   - `changed_files` = all files modified this cycle

Wait for all four to complete.

**Gate checks — run after all four finish:**

- If `pedagogy-director` scores any dimension FAIL → fix the specific issues, re-dispatch `pedagogy-director` on fixed files (`mode=review` to confirm fixes)
- If `compliance-guardian` returns any CRITICAL finding → fix, re-dispatch on fixed files
- If `language-checker` returns any FAIL items → fix, re-dispatch on fixed files
- Repeat until all gates pass

**Completion gate — before advancing to TEST:**
- Zero CRITICAL compliance findings
- Zero FAIL pedagogy scores on any dimension
- Zero FAIL language findings
- Spec-tracker has synced all changed files

ADVISORY/WARN findings from all agents: collect for session report. They do not block.

---

### Phase: TEST

Dispatch `exam-tester` with:
- `mode=full`
- `changed_files` = all files modified this cycle
- `level` = target level

Layer A (10 content checks) runs first. Layer A FAIL blocks Layer B.
Report all failures with file paths and error messages. Do not suppress.

---

### Phase: REVIEW

Self-review checklist (no agent — orchestrator checks its own work):

**Security:**
- Does any new code interpolate user input into SQLite queries? (Check `src/services/` for string interpolation)
- Any unsafe use of `eval` or dynamic code execution?

**Consistency:**
- Does new code follow patterns in `src/components/exam/`, `src/services/`?
- Are all new theme values from `src/utils/theme.ts`, not hardcoded hex?
- Do all new mock JSON files follow the MockExam interface exactly?

**Correctness:**
- For every new question: `correctAnswer` is an exact string match to one option?
- For every listening section: `audioFile` paths follow the `assets/audio/{level}/mock{NN}/` convention?
- For A1/A2: no `sprachbausteine` section?

**Pedagogy rewrites:**
Review all `[PEDAGOGY-REWRITE]` tags from pedagogy-director output. Understand each change. These go into CEO Action Items.

**Audio:**
Check what audio-designer produced (SSML scripts). Note which mocks still need audio generation (GCP curl commands). List in session report.

---

### Phase: RETROSPECT

Step back and assess the full cycle:

1. What did the strategist prioritize that wasn't built? Why not?
2. What did research surface (CEFR gaps, competitor insights) that wasn't addressed this cycle?
3. What patterns in the new content suggest systemic issues for next cycle?
4. Which mocks still need audio? Any SSML scripts ready for GCP generation?
5. What did pedagogy-director flag as category-level observations?

Generate targeted research questions for the next cycle. Update `.planning/content-roadmap.md` with session progress (new mock count, vocab words added, audio SSML coverage).

Loop back to RESEARCH (skip STRATEGIZE). Pass research questions to `exam-researcher` as `mode=targeted`.

---

## Session End

When cycles are complete, produce three deliverables.

### 1. Session Report

Save to `.planning/session-reports/{YYYY-MM-DD}-{level}.md` and output to conversation:

```markdown
## Session Report — {YYYY-MM-DD} — {level}

### Built
- {N} mock exams added: {list IDs}
- {N} vocabulary words added to {level}_vocabulary.json
- {N} grammar topics added
- {N} SSML scripts created (audio pending GCP generation)
- Code features: {list if any}

### Quality
- Pedagogy director: {N} mocks reviewed, {M} rewrites applied
  - [list each rewrite: mock_id / question_id — what changed and why]
- Compliance: PASS ({N} advisory) / FAIL — {what was fixed}
- Language: PASS / FAIL — {details}
- Specs: {N} synced

### Test Results
- Content validation (Layer A): {N}/10 checks pass, {N} mocks validated
- Code tests (Layer B): TypeScript clean / {N} errors; Jest {N}/{N} pass

### Audio Status
- SSML scripts ready: {list mock IDs + parts}
- Audio generation needed (run these commands when GCP credentials are set up):
  {commands or "see .planning/audio-prompts/"}
- Audio files present: {N} files in assets/audio/{level}/

### Content Roadmap Update
| Level | Mocks Before | After | Vocab Before | After |
|-------|-------------|-------|-------------|-------|
| A1    | {N} | {N} | {N} | {N} |

### Git Commands
{Always provide at end — never run git commands}
cd .worktrees/<branch>
git add <files>
git commit -m "feat(A1): add {N} mock exams and vocabulary"
git push origin <branch>
```

### 2. CEO Action Items

```markdown
## CEO Action Items

### Decisions Needed
1. [STRATEGIC] {decision with context and concrete recommendation}

### Pedagogy Director Rewrites — Approve or Reject
- {mock_id} / {question_id}: {what changed} — {one-line reason}

### Audio Generation Ready
- Run these commands when GCP credentials available: {commands or reference to .planning/audio-prompts/}

### Open Questions
- {questions needing your input}
```

### 3. Next Session Brief

```markdown
## Next Session

### Command
/deep-work continue {level}

### Context
- Last session: {2-3 sentence summary}
- Remaining gaps: {specific state — "A1 has 2/10 mocks, 200/650 vocab words"}
- Roadmap: {top P0 items remaining}

### Research Questions (for targeted research)
1. {specific question for exam-researcher}
2. {another}
```

---

## Project Context

**Stack:** Expo SDK 52+ / React Native / TypeScript / expo-router / expo-sqlite / React Context + useReducer / react-native-reanimated

**Content:** `assets/content/{level}/mock_XX.json` — MockExam interface from `src/types/exam.ts`

**Audio:** `assets/audio/{level}/mockXX/` — pre-generated MP3s via Google Cloud WaveNet

**Vocabulary:** `src/data/vocabulary/{level}_vocabulary.json`

**Grammar:** `src/data/grammar/{level}_grammar.json`

**DB schema:** `src/services/database.ts` (8 tables: user_settings, user_levels, exam_attempts, question_responses, vocabulary, grammar_topics, study_sessions, streaks, bookmarks)

**Mock exam ID format:** `A1_mock_01` through `A1_mock_10`

**Pass threshold:** 60% in BOTH written AND oral sections (all levels)

**A1 priority:** 80% of initial effort. No A2+ content until A1 has ≥5 complete mocks.

**Key planning files:**
- `.planning/content-roadmap.md` — living priorities
- `.planning/research/{level}-{topic}-{date}.md` — research output
- `.planning/session-reports/` — historical session reports
- `.planning/audio-prompts/` — SSML scripts

**Spec location:** `specs/` (bootstrapped by spec-tracker)

**Test commands:**
```bash
npx tsc --noEmit
npx jest --no-cache --forceExit
```

**Git workflow:** Never run `git add`, `git commit`, or `git push`. Always output the full command block for the user to execute.
