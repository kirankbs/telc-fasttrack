# Fastrack Deutsch — Virtual Team Usage Guide

## Quick Start

### Full autonomous session (the whole team)
```
/deep-work on A1                  # full session focused on A1
/deep-work on A1                  # same — level is the main input
/deep-work continue               # resume from last session's handoff
```

### Talk to individual experts
```
"research A1 exam format"         # exam-researcher (broad)
"research vocabulary gaps for A2" # exam-researcher (targeted)
"what should we build next"       # content-strategist
"update content roadmap"          # content-strategist
"review A1 mock 01"               # pedagogy-director
"validate mock A1_mock_03"        # pedagogy-director (single mock)
"run compliance check"            # compliance-guardian
"check language"                  # language-checker
"check German content for A1"     # language-checker (content only)
"build A1 mock 04"                # implementation-lead
"implement feature: flashcards"   # implementation-lead
"generate audio for A1 mock 01"   # audio-designer
"audit audio coverage"            # audio-designer (coverage check)
"update specs" / "sync specs"     # spec-tracker
"run full test"                   # exam-tester
"run content validation"          # exam-tester (Layer A only)
"review timer UX"                 # product-designer
"design score report"             # product-designer
"audit gamification"              # product-designer
```

---

## The Team (10 agents)

### Research Layer — find what to build and why
| Agent | Role | Model | When to use |
|-------|------|-------|-------------|
| `exam-researcher` | telc exam specialist + content gap analyst | opus | Starting work on a new level, auditing coverage before a sprint, verifying exam structure |
| `content-strategist` | Head of Product — roadmap + build prioritization | sonnet | Beginning of any session, "what's most valuable now?", roadmap updates |

### Quality Layer — validate what's built
| Agent | Role | Model | When to use |
|-------|------|-------|-------------|
| `pedagogy-director` | Senior DaF teacher + telc examiner | opus | After content is built, reviewing specific mocks, CEFR calibration |
| `compliance-guardian` | App Store compliance + DSGVO | sonnet | After code changes, before release builds |
| `language-checker` | German content QA + English UI consistency | sonnet | After mock JSON changes, UI string changes |

### Build Layer — create the product
| Agent | Role | Model | When to use |
|-------|------|-------|-------------|
| `implementation-lead` | Staff Expo/RN mobile engineer | sonnet | Building features, implementing mock exam content, fixing bugs |
| `audio-designer` | TTS specialist (Google Cloud WaveNet) | sonnet | SSML scripting, audio pipeline, audio coverage audits |

### Ops Layer — keep everything tight
| Agent | Role | Model | When to use |
|-------|------|-------|-------------|
| `spec-tracker` | Technical writer | sonnet | After any code change (auto in deep-work); bootstrap specs from scratch |
| `exam-tester` | QA engineer + German learner dual persona | sonnet | After implementation; 10 content checks + TypeScript + Jest |
| `product-designer` | UX + exam anxiety specialist | sonnet | New screens, gamification mechanics, score report, timer UX |

---

## Deep Work Session Flow

```
STRATEGIZE → RESEARCH → DESIGN → IMPLEMENT + AUDIO → QUALITY GATE → TEST → REVIEW → RETROSPECT
     ↑                                                                                        |
     +----------------------------------------------------------------------------------------+
```

- **STRATEGIZE** (cycle 1 only): `content-strategist` reads roadmap, outputs prioritized build list
- **RESEARCH** (cycle 1: broad, later: targeted): `exam-researcher` maps exam format, content gaps, vocabulary scope, competitors
- **DESIGN**: Consume research + priorities. Outline mock topic matrix, section structure, voice assignments for audio
- **IMPLEMENT + AUDIO** (parallel): `implementation-lead` builds mock JSON + features in foreground; `audio-designer` writes SSML scripts in background
- **QUALITY GATE** (mandatory, 4 agents in parallel): `pedagogy-director` reviews and may rewrite; `compliance-guardian` scans; `language-checker` audits German + English; `spec-tracker` syncs specs
- **TEST**: `exam-tester` runs Layer A (10 structural content checks) then Layer B (TypeScript + Jest). Layer A failure blocks Layer B.
- **REVIEW**: Self-review by orchestrator — security, consistency, correctness, pedagogy rewrites, audio gaps
- **RETROSPECT**: What wasn't built? What gaps remain? Generate targeted research questions. Loop back.

**Quality gate is mandatory** — all four gate agents must pass (zero CRITICAL findings, zero FAIL scores) before testing.

**Pedagogy director has gated rewrite authority** — can fix weak content, all changes tagged `[PEDAGOGY-REWRITE]` for your review.

---

## Session Output

Every autonomous session ends with three deliverables.

### 1. Session Report
What was built, test results, compliance status, audio SSML scripts created, content roadmap update, git commands. Saved to `.planning/session-reports/{date}-{level}.md`.

### 2. CEO Action Items
Decisions only you can make: strategic questions, pedagogy director rewrites to approve or reject (each with what changed and why), audio generation commands ready for GCP.

### 3. Next Session Brief
Ready-to-paste `/deep-work continue` command with full context — what was built, what gaps remain, specific research questions for the next cycle.

---

## All Triggers

### Research Layer

| You say | Agent | What happens |
|---------|-------|-------------|
| "research A1 exam format" | `exam-researcher` | Broad 5-stream research: exam format, content gaps, vocab scope, audio status, competitors |
| "research vocabulary gaps for B1" | `exam-researcher` | Targets current vocab coverage vs. Goethe Wortliste |
| "research A2 listening structure" | `exam-researcher` | Level-specific, targeted broad research |
| "what should we build next" | `content-strategist` | Reads roadmap + content dirs; outputs P0/P1/P2 list with scores |
| "update content roadmap" | `content-strategist` | Incremental refresh — scans changes since last roadmap update |
| "force refresh roadmap" | `content-strategist` | Full rescan, rebuilds from scratch |
| "should we start A2 yet?" | `content-strategist` | Strategic decision with data and trade-offs |

### Quality Layer

| You say | Agent | What happens |
|---------|-------|-------------|
| "review A1 mock 01" | `pedagogy-director` | Reviews all 6 dimensions; report only |
| "review and fix mock A1_mock_02" | `pedagogy-director` | Review + rewrite mode; weak content corrected with `[PEDAGOGY-REWRITE]` tags |
| "validate mock A1_mock_05" | `pedagogy-director` | Single mock deep dive |
| "run compliance check" | `compliance-guardian` | Scans changed files + key files |
| "full compliance audit" | `compliance-guardian` | Full codebase audit |
| "check language" | `language-checker` | German content accuracy + English UI consistency |
| "check language and fix" | `language-checker` | Audit + auto-fix safe corrections (typos, encoding) |
| "check German content for A1" | `language-checker` | `scope=content-only`, level=A1 |
| "check UI text only" | `language-checker` | `scope=ui-only` — app screens only |

### Build Layer

| You say | Agent | What happens |
|---------|-------|-------------|
| "build A1 mock 04" | `implementation-lead` | Implements mock exam JSON per design |
| "implement next from roadmap" | `implementation-lead` | Reads roadmap P0, builds top item |
| "implement feature: timer" | `implementation-lead` | Builds feature from spec; bottom-up: types → DB → services → components → screens → tests |
| "fix bug: correct answer not matching" | `implementation-lead` | Debugs, traces root cause, fixes with tests |
| "generate audio for A1 mock 01" | `audio-designer` | Creates SSML scripts for mock's listening section |
| "generate audio for all A1 mocks" | `audio-designer` | Batch SSML generation for all A1 listening sections |
| "audit audio coverage" | `audio-designer` | Reports: which mocks have SSML, which have MP3s, what's missing |
| "get audio generation commands" | `audio-designer` | Outputs GCP curl commands for ready SSML scripts |

### Ops Layer

| You say | Agent | What happens |
|---------|-------|-------------|
| "update specs" / "sync specs" | `spec-tracker` | Syncs code → specs for changed files |
| "bootstrap specs" | `spec-tracker` | First-run: builds entire `specs/` directory from codebase |
| "run full test" | `exam-tester` | Layer A (10 checks) then Layer B (TypeScript + Jest) |
| "run content validation" | `exam-tester` | Layer A only |
| "run tests" | `exam-tester` | Layer B only |
| "review timer UX" | `product-designer` | Exam timer anxiety analysis + design spec |
| "design score report" | `product-designer` | Score report UX design + section breakdown logic |
| "audit gamification" | `product-designer` | Streak mechanics, readiness gauge, ethical check |
| "design feature: readiness gauge" | `product-designer` | Full UX design before implementation |
| "full product audit" | `product-designer` | All scopes: timer, score, study plan, speaking, flashcards |

### Chaining

```
"research A1 then build mock 01"          → exam-researcher then implementation-lead
"review and fix then test"                → pedagogy-director (review-and-fix) then exam-tester
"build mock and generate audio"           → implementation-lead + audio-designer (parallel)
"update specs and sync"                   → spec-tracker (mode=sync)
"what should we build then build it"      → content-strategist then implementation-lead
```

---

## Key Files

| File | Purpose | Agent that maintains it |
|------|---------|------------------------|
| `.planning/content-roadmap.md` | Living build priorities — mock count, vocab coverage, P0/P1/P2 | `content-strategist` |
| `.planning/research/{level}-{topic}-{date}.md` | Exam format and content gap research | `exam-researcher` |
| `.planning/session-reports/*.md` | Historical session reports | orchestrator |
| `.planning/audio-prompts/*.ssml` | SSML scripts ready for GCP audio generation | `audio-designer` |
| `assets/content/{level}/mock_XX.json` | Mock exam JSON files | `implementation-lead` |
| `assets/audio/{level}/mockXX/` | Pre-generated MP3 audio files | `audio-designer` |
| `src/data/vocabulary/{level}_vocabulary.json` | Vocabulary flashcard data | `implementation-lead` |
| `src/data/grammar/{level}_grammar.json` | Grammar reference data | `implementation-lead` |
| `src/types/exam.ts` | MockExam TypeScript interfaces — canonical | — |
| `src/utils/theme.ts` | Design token source of truth | — |
| `specs/` | Per-screen, per-component, per-service specs | `spec-tracker` |
| `.claude/agents/*.md` | Agent definitions (10 files) | — |

---

## Tips

- **Starting fresh on a level?** Say "what should we build next" — content-strategist scans everything and gives you a prioritized list with reasoning.
- **Short on time?** Say "review and fix A1 mock 01" — pedagogy director audits and corrects without building anything new.
- **Audio pipeline ready?** Say "audit audio coverage" — audio-designer tells you exactly which mocks have SSML scripts ready to send to GCP and which still need scripting.
- **Just content, no code?** Say `/deep-work on A1` — the team builds, reviews, and tests new mocks without touching the app engine.
- **Resume fast?** The Next Session Brief at the end of every autonomous session gives you an exact command to paste — no re-reading required.
- **A1 first.** The content-strategist applies an A1 priority bias in the initial phase. Trust the roadmap on this.
- **Approve pedagogy rewrites before committing.** CEO Action Items list every change the pedagogy director made. Review each `[PEDAGOGY-REWRITE]` tag before running git commit.
