# Content Roadmap — Telc-FastTrack
> Last updated: 2026-04-19 (overnight session) | Maintained by `content-strategist`

---

## Current State

| Level | Mocks (real) | Target | Vocab Words | Target | Grammar Topics | Audio | Pedagogy | Status |
|-------|-------------|--------|-------------|--------|----------------|-------|----------|--------|
| **A1** | **10/10** | 10 | **650** | 650 | **12** | **100%** (60 MP3s) | In review (mid-session re-review A1 01-10 in flight) | Near-shippable |
| **A2** | **10/10** | 10 | **1,300*** | 1,300 | **15** | **100%** (60 MP3s) | Reviewed — 17 rewrites incl. mock_05 bug fixes (#37) | Shippable pending PR merges |
| B1 | **1/10 real** + 9 stubs | 10 | 0 | 2,400 | 0 | 0% | mock_01 authored per B1 research doc | Active — first real content |
| B2 | 0/10 real (stubs) | 10 | 0 | 4,000 | 0 | 0% | — | Scaffolding only |
| C1 | 0/10 real (stubs) | 10 | 0 | 6,000 | 0 | 0% | — | Scaffolding only |

*A2 vocab 1,300 is post-merge state (PR #36 CI green, awaiting merge). Disk currently shows 800.

**Critical:** B1 stubs (mocks 02-10) carry `_stub: true` with 4 skeleton sections and no content. B2/C1 stubs are identical. Do not count them as authored mocks.

---

## A1 Section Coverage

### Mock Exams

| Mock | Hören | Lesen | Schreiben | Sprechen | Audio (MP3) | Pedagogy | Status |
|------|-------|-------|-----------|----------|-------------|----------|--------|
| mock_01 | 11q | 15q | full | full | 3 MP3s | Reviewed; re-review in flight | Complete |
| mock_02 | 11q | 15q | full | full | 3 MP3s | Reviewed; re-review in flight | Complete |
| mock_03 | 11q | 15q | full | full | 3 MP3s | Reviewed; re-review in flight | Complete |
| mock_04 | 11q | 15q | full | full | 3 MP3s | Reviewed; re-review in flight | Complete |
| mock_05 | 11q | 15q | full | full | 3 MP3s | Reviewed; re-review in flight | Complete |
| mock_06 | 11q | 15q | full | full | 3 MP3s (#35) | Re-review in flight | Complete — audio shipped |
| mock_07 | 11q | 15q | full | full | 3 MP3s (#35) | Re-review in flight | Complete — audio shipped |
| mock_08 | 11q | 15q | full | full | 3 MP3s (#35) | Re-review in flight | Complete — audio shipped |
| mock_09 | 11q | 15q | full | full | 3 MP3s (#35) | Re-review in flight | Complete — audio shipped |
| mock_10 | 11q | 15q | full | full | 3 MP3s (#35) | Re-review in flight | Complete — audio shipped |

### Vocabulary — A1

| Metric | Count | Target | Coverage |
|--------|-------|--------|----------|
| Total words | 650 | 650 | 100% |
| Grammar topics | 12 | 12 | 100% |

### Audio Pipeline — A1

| Asset | State |
|-------|-------|
| All 10 mocks SSML (30 files) | Complete — PR #35 |
| All 10 mocks MP3s (30 files) | Complete — PR #33 (01-05) + PR #35 (06-10) |

---

## A2 Section Coverage

### Mock Exams

| Mock | Hören | Lesen | Schreiben | Sprechen | Audio (MP3) | Pedagogy | Status |
|------|-------|-------|-----------|----------|-------------|----------|--------|
| mock_01 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_02 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_03 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_04 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_05 | full | full | full | full | 3 MP3s (#35) | Reviewed; wrong-answer bugs fixed (#37) | Complete |
| mock_06 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_07 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_08 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_09 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |
| mock_10 | full | full | full | full | 3 MP3s (#35) | Reviewed (#37) | Complete |

### Vocabulary — A2

| Metric | Count | Target | Coverage |
|--------|-------|--------|----------|
| Total words | 1,300 (post PR #36) | 1,300 | 100% |
| Grammar topics | 15 | ~20 | 75% |

### Audio Pipeline — A2

| Asset | State |
|-------|-------|
| All 10 mocks SSML (30 files) | Complete — PR #35 |
| All 10 mocks MP3s (30 files) | Complete — PR #35 |

---

## B1 Section Coverage

### Mock Exams

| Mock | Hören | Lesen | Sprachbausteine | Schreiben | Sprechen | Audio | Pedagogy | Status |
|------|-------|-------|-----------------|-----------|----------|-------|----------|--------|
| mock_01 | 3 parts | 3 parts | 2 sets | full | 3 tasks | 0% | Authored per B1 research doc | Real content — PR #38 |
| mock_02 | stub | stub | stub | stub | stub | 0% | — | Stub (4 skeleton sections) |
| mock_03–10 | stub | stub | stub | stub | stub | 0% | — | Stub (4 skeleton sections) |

**Note:** B1 stubs have only 4 sections — Sprachbausteine is missing from the skeleton. mock_01 has all 5 sections with real content.

### Vocabulary — B1

| Metric | Count | Target | Coverage |
|--------|-------|--------|----------|
| Total words | 0 | 2,400 | 0% |
| Grammar topics | 0 | ~25 | 0% (Konjunktiv II, Passiv, Relativsätze etc. unstarted) |

### Audio Pipeline — B1

No audio. SSML authoring and GCP render pass blocked until at least mocks 02-05 have real content — not efficient to pipeline single mocks.

---

## B2 / C1 — Stub State

Both levels have 10 JSON files per level. All carry `_stub: true` with empty section arrays. Route/catalog scaffolding only — zero content.

| Level | Mock Files | Content | Vocab | Grammar | Audio | Needed Before Real Work |
|-------|-----------|---------|-------|---------|-------|------------------------|
| B2 | 10 (stubs) | 0 | 0 | 0 | 0 | B1 substantially complete; B2 section spec; vocab list |
| C1 | 10 (stubs) | 0 | 0 | 0 | 0 | B2 substantially complete; C1 section spec; vocab list |

---

## Web App Gaps

### Sprachbausteine Renderer — Missing

`packages/types` has the Sprachbausteine TypeScript interfaces. `apps/web/src` has **no** `SprachbausteineExam.tsx` component. B1 mock_01 (which has a Sprachbausteine section) will play with 4 of 5 sections until this component is built.

| Gap | Blocking | Effort estimate | Priority |
|-----|---------|-----------------|----------|
| `SprachbausteineExam.tsx` web component | B1 full playability in browser | ~1 day (UI only, types exist) | P0 before B1 launch |

---

## Reusable Tooling

| Tool | Location | Description |
|------|----------|-------------|
| `render_audio.py` | `.planning/render_audio.py` | GCP WaveNet renderer. Handles chunking, quota project header, batch SSML-to-MP3. Validated on 60 A1+A2 files. |
| B1 authoring contract | `.planning/research/B1-exam-format.md` | B1 section spec, item counts, scoring rules, CEFR calibration notes. Reusable template for mocks 02-10. |

---

## Next Up — Top 5 Items

Scored on 3 axes: Exam Coverage (40%) + Content Quality Gap (35%) + Production Readiness (25%).
No A1 multiplier — A1 target met. A2 multiplier retired this session.

### 1. Merge PRs #36, #37, #38 (Score: 97 — gate item)

Three PRs are CI green. Until they merge, A2 vocab shows 800 on disk, A2 pedagogy is officially unlogged, and B1 mock_01 is not in main.

- #36: A2 vocab 800 → 1,300 (coverage gap closed)
- #37: A2 pedagogy 6-dim review, 17 rewrites, mock_05 wrong-answer bug fixes
- #38: B1 mock_01 first real content

Action: Merge in order #36, #37, #38. No code changes needed.

### 2. Sprachbausteine web renderer (Score: 82)

**Why second:** B1 mock_01 is real content but the cloze section is invisible in the web app. Types exist; this is a UI build task only. Without it B1 is unplayable in the browser even after #38 merges. One engineer, one day.

- Coverage: Types ready, component absent
- Quality: Not a content gap — a render gap
- Readiness: High. Schema, types, scoring logic all exist.

Action: Build `SprachbausteineExam.tsx` in `apps/web/src/components/exam/`. Ship as standalone PR.

### 3. B1 mocks 02-05 authoring (Score: 76)

**Why third:** mock_01 proves the authoring contract works. The B1 research doc is the repeatable template. Writing mocks 02-05 (batching to 4 at once) hits the threshold where audio pipeline becomes efficient. Each mock: 5 sections, ~60 items, themed per Goethe B1 topic list.

- Coverage gap: 1/10 real mocks — 90% of the level is stubs
- Quality gap: Sprachbausteine section is novel; needs 4 more examples to validate calibration
- Readiness: Research doc ready, mock_01 is the worked example

Action: Author B1 mocks 02-05. Reuse B1-exam-format.md contract. Ship as single PR.

### 4. B1 vocabulary — 0 → 1,200 words (half-target sprint) (Score: 68)

**Why fourth:** Zero vocab means zero spaced-repetition coverage at B1. Users can take a mock but have no deck to study from. Targeting 1,200 first (half of 2,400) is the pragmatic sprint — enough to cover mock_01 topic areas before audio arrives.

- Coverage gap: 0/2,400 words (worst gap in the project)
- Quality gap: No deck = no retention loop for B1
- Readiness: Vocab JSON schema identical to A1/A2. Drop-in.

Action: Source from Goethe B1 Wortliste. Author 1,200 highest-frequency words first. One PR.

### 5. A1 pedagogy re-review — close the loop (Score: 61)

**Why fifth:** A1 mocks 01-05 had a pre-audio pedagogy pass. Mocks 06-10 were added after that pass. The mid-session re-review is in flight but not complete. Until it closes, A1 has an asterisk on its pedagogy sign-off.

- Coverage: 0/10 mocks have had a post-audio review
- Quality: Listening audio may have introduced prosody issues not visible in text review
- Readiness: All mocks and audio are live — this is human review work only

Action: Complete re-review for A1 01-05 (check audio alignment) + first-pass review for 06-10. Ship findings as content corrections PR if rewrites are needed.

---

## Strategic Rules

1. **A2 is shippable once PRs #36/#37 merge.** All four sections complete, vocab at target, audio 100%, pedagogy reviewed.
2. **B1 needs the Sprachbausteine renderer before any B1 launch claim.** It is the #1 web gap.
3. **B1 content before B1 audio.** Pipeline is not efficient until at least 4-5 mocks have real SSML.
4. **Never count stubs as content.** B1 mocks 02-10, all B2, all C1 are empty scaffolds.
5. **Vocab and content authoring are parallel workstreams.** Neither blocks the other.
6. **Complete levels beat partial coverage.** Finish A2 → build B1 to shippable → defer B2/C1.

---

## Session History

| Date | Built | PRs |
|------|-------|-----|
| pre-2026-04-10 | A1 mocks 01-10, vocab 650 words, grammar 12 topics | Multiple |
| 2026-04-10 | A1 SSML for mocks 01-05 (15 scripts) | — |
| 2026-04-13 | Audio player component (web) | #34 |
| 2026-04-13 | A1 MP3s for mocks 01-05 (GCP WaveNet, 15 files) | #33 |
| 2026-04-13 | A2 mocks 01-10, vocab 800 words, grammar 15 topics | #21-#32 |
| 2026-04-19 | A1+A2 audio complete (60 MP3s + 60 SSML); A2 vocab 1,300; A2 pedagogy review + 17 rewrites; B1 mock_01 first real content | #35 (merged), #36/#37/#38 (CI green) |
