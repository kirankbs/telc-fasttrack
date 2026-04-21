# Content Roadmap — Fastrack Deutsch
> Last updated: 2026-04-21 (post-B2-shipped) | Maintained by `content-strategist`

---

## Current State

| Level | Mocks (real) | Target | Vocab | Target | Grammar | Audio | Pedagogy | Status |
|-------|-------------|--------|-------|--------|---------|-------|----------|--------|
| **A1** | **10/10** | 10 | **650** | 650 | **12** | **100%** (60 MP3s) | Reviewed — 40 rewrites (#39) | **Shipped** |
| **A2** | **10/10** | 10 | **1,300** | 1,300 | **15** | **100%** (60 MP3s) | Reviewed — 17 rewrites (#37) | **Shipped** |
| **B1** | **10/10** | 10 | **2,400** | 2,400 | **20** | **100%** (30 MP3s + 30 SSML, #47) | Authored per B1-exam-format.md | **Shipped** |
| **B2** | **10/10** | 10 | **4,016** | 4,000 | **25** | **100%** (30 MP3s + 30 SSML, #83) | All 10 PASS — 4 rewrites total | **Shipped** |
| **C1** | 0/10 real (stubs) | 10 | 0 | 6,000 | 0 | 0% | — | Backlog |

**Note (2026-04-21):** B2 fully shipped. All 12 content PRs (#61, #62, #72-82) merged. Audio MP3s rendered via GCP WaveNet (PR #83, 130K chars, $0 actual cost — within free tier).

---

## A1 / A2 / B1 — Shipped Reference

All three levels are production-ready:

- 10 real mocks each with all required sections (A1/A2: 4 sections; B1: 5 including Sprachbausteine).
- Vocab and grammar at Goethe target counts.
- Listening audio rendered via GCP WaveNet (`render_audio.py`).
- Pedagogy review passes complete.

Renderer components in `apps/web/src/components/exam/`:
- `ListeningExam.tsx`, `ReadingExam.tsx`, `WritingExam.tsx`, `SpeakingExam.tsx`
- `SprachbausteineExam.tsx` (shipped PR #40 — covers B1 + B2)
- Audio player shipped PR #34.

Speaking recorder with mic + playback + retry shipped PR #46.

---

## B2 — Completed (Pending Merge + MP3 Render)

### PR Status by Mock

| Mock | Theme | PR | Status |
|------|-------|----|--------|
| mock_01 | Beruf & Arbeitswelt | #61 | **Merged** |
| mock_02 | Bildung & Studium | #74 | Open — CI green, pedagogy PASS |
| mock_03 | Gesundheit & Medizin | #72 | **Merged** |
| mock_04 | Medien & Kommunikation | #73 | Open — CI green, pedagogy PASS |
| mock_05 | Umwelt & Nachhaltigkeit | #76 | Open — CI green, pedagogy PASS |
| mock_06 | Reisen & Mobilität | #75 | Open — CI green, pedagogy PASS |
| mock_07 | Technologie & Digitalisierung | #81 | Open — CI green, pedagogy PASS (1 rewrite applied) |
| mock_08 | Gesellschaft & Integration | #79 | Open — CI green, pedagogy PASS |
| mock_09 | Kultur & Kunst | #78 | Open — CI green, pedagogy PASS |
| mock_10 | Wirtschaft & Konsum | #80 | Open — CI green, pedagogy PASS |
| B2_vocabulary.json (4,016 entries) | — | #77 | Open — CI green, schema uniform |
| B2_grammar.json (25 topics) | — | #62 | **Merged** (3 reorder-exercise fixes applied) |
| B2 SSML mocks 01-06 | — | embedded in mock PRs | Shipped with respective mock PRs |
| B2 SSML mocks 07-10 | — | #82 | Open |

### B2 Topic Distribution (actual)

| Mock | Theme | Hören T2 Guest | Schreiben Prompts |
|------|-------|----------------|-------------------|
| 01 | Beruf & Arbeitswelt | Dr. Sabine Richter (Berufsbildungsforschung Bonn) | Beschwerdebrief / Homeoffice-Stellungnahme |
| 02 | Bildung & Studium | — | — |
| 03 | Gesundheit & Medizin | — | — |
| 04 | Medien & Kommunikation | — | — |
| 05 | Umwelt & Nachhaltigkeit | — | Kreislaufwirtschaft theme |
| 06 | Reisen & Mobilität | — | Nachtzug/E-Bike/Overtourism |
| 07 | Technologie & Digitalisierung | — | KI & Mittelstand |
| 08 | Gesellschaft & Integration | — | — |
| 09 | Kultur & Kunst | — | — |
| 10 | Wirtschaft & Konsum | — | — |

### B2 — Remaining Follow-Ups

1. **MP3 render (GCP, user task)** — Run `render_audio.py` against all 30 B2 SSML scripts (mocks 01-10, 3 parts each) once GCP WaveNet credentials are available. Output to `assets/audio/B2/mock{01-10}/listening_part{1,2,3}.mp3`. No code changes needed; pipeline validated on A1+A2+B1.

2. **User merge queue** — 8 mock PRs + #77 (vocab) + #82 (SSML 07-10) = 10 open PRs. All CI green, all pedagogy approved. Recommend merging in order: #74, #73, #76, #75, #81, #79, #78, #80, #77, #82.

3. **Advisory items from pedagogy review (non-blocking):**
   - mock_02 Lesen T3: instruction text says "Zwei" — verify count matches items authored.
   - mock_05 and mock_06: Sprechen T2 both use "Innerdeutsche Kurzstreckenflüge verbieten" — if a future mock_11+ is ever authored, rotate this topic.
   - mock_09 and mock_10: Dr. Mertens surname appears in both (different first name + field) — consider renaming one before merge.
   - SB T1 gap-position pattern (gap 1=Passiv, gap 5=Genitiv-Präp, gap 8=prädikatives Adj, gap 9=Partizipialattribut) uniform across mocks 02-06; varied in 07-10. Carry the rotation into C1.

---

## B2 Calibration Rules (legacy reference for C1 authoring)

Extracted from mock_01 pedagogy review and `.planning/handoffs/2026-04-20-impl-b2-mock-01.md`. Apply to all future B2-or-higher content:

| # | Rule |
|---|------|
| 1 | Hören: `playCount: 1` throughout. No exceptions at B2+. |
| 2 | Sprachbausteine T1: exactly 4 options per gap (a/b/c/d). B1 uses 3. |
| 3 | Sprachbausteine T2: exactly 15-option word bank, 10 gaps. |
| 4 | Lesen T1: 5 texts, 10 headings (5 distractors). |
| 5 | Lesen T2: 3-option MCQ only (not 4). |
| 6 | Lesen T3: 10 situations → 12 offers, at least 1 `"x"` (no match). |
| 7 | Schreiben: 2 prompts, candidate chooses 1. ~200 words, formal register. |
| 8 | Sprechen: 3 parts — Präsentation (dual topic cards A/B), Diskussion (4 Leitfragen), Gemeinsam Planen (5 dimensions). |
| 9 | Every question must have an `explanation` citing source + grammar rule + ≥1 distractor rationale. |
| 10 | No metalinguistic terms (Nominalisierung, Konjunktiv) in exam-facing question text — explanations only. |

---

## C1 — Active Backlog

Not started. Targets:
- ~6,000 vocab words (Goethe C1 Wortliste)
- ~30-35 grammar topics (rhetorical + stylistic devices layer added)
- 10 mocks — C1-specific Schreiben (Erörterung, Bericht, Kommentar)
- Audio at natural speed (1.0x), potentially 2 voices for interview sections
- Sprechen: monologue + discussion, no Gemeinsam Planen at C1

Do not start authoring until B2 MP3 render is unblocked or explicitly deprioritized.

---

## Reusable Tooling

| Tool | Location | Notes |
|------|----------|-------|
| `render_audio.py` | `.planning/render_audio.py` | GCP WaveNet. Validated on A1+A2+B1 (90 MP3s). Ready for B2 run. |
| B1 authoring contract | `.planning/research/B1-exam-format.md` | Template reference. |
| B2 authoring contract | `.planning/research/B2-exam-format.md` | Authoritative B2 spec. Use as C1 template baseline. |
| B2 pedagogy verdict | `.planning/pedagogy-review-b2-batch.md` | All 10 mocks scored. Advisory items listed. |

---

## Next Up — Top 5 Items

Scored on 3 axes: Exam Coverage (40%) + Content Quality Gap (35%) + Production Readiness (25%).

### 1. B2 MP3 render — GCP WaveNet (Score: 92 — user task, unblocks audio completeness)

30 SSML scripts are ready. Run `render_audio.py` batch once GCP WaveNet credentials are provisioned. No further code or content work required — this is an infrastructure/credentials task.

### 2. User merge queue — 10 open B2 PRs (Score: 88 — gate for B2 "fully shipped")

PRs #74, #73, #76, #75, #81, #79, #78, #80, #77, #82. All CI green, all pedagogy approved. Merge in order to keep history clean. B2 cannot be counted as fully shipped until these land.

### 3. C1 exam format research (Score: 80 — gate item for all C1 authoring)

Dispatch `exam-researcher` to produce `.planning/research/C1-exam-format.md`. Without a C1 section spec, no authoring can start without rewrite risk. Confirm: Schreiben types (Erörterung/Bericht/Kommentar), Sprechen structure, whether Sprachbausteine appears at C1 (it does not in telc C1 Hochschule), timing.

### 4. C1 vocabulary — 6,000 words (Score: 74)

From Goethe C1 Wortliste. Non-blocking for mocks but enables flashcard flow for C1 users. Can run in parallel with C1 format research.

### 5. C1 mock_01 — worked example (Score: 68)

Single mock authored per C1 spec, pedagogy review before batch. Blocks mocks 02-10. Dependency: C1-exam-format.md must be complete.

---

## Strategic Rules

1. **A1/A2/B1 are fully shipped. No re-opening unless bug-driven.**
2. **B2 content is complete. Remaining work is user merge queue + GCP MP3 render.**
3. **B2 mock_01 calibration rules (table above) carry forward to C1 authoring.**
4. **B2 audio runs as a batch.** `render_audio.py` is the only step; do not re-author SSML.
5. **Never count stubs as content.** C1 mocks are 372-byte placeholders.
6. **C1 does not start authoring until C1-exam-format.md exists.**
7. **Sprachbausteine renderer (PR #40) is level-agnostic — works for B1 and B2.** Confirm C1 telc spec before assuming it applies there.

---

## Session History

| Date | Built | PRs |
|------|-------|-----|
| pre-2026-04-10 | A1 mocks 01-10, vocab 650, grammar 12 | Multiple |
| 2026-04-10 | A1 SSML mocks 01-05 (15 scripts) | — |
| 2026-04-13 | Audio player (web) | #34 |
| 2026-04-13 | A1 MP3s mocks 01-05 (WaveNet) | #33 |
| 2026-04-13 | A2 mocks 01-10, vocab 800, grammar 15 | #21-#32 |
| 2026-04-19 | A1+A2 audio complete (60 MP3s); A2 vocab 1,300; A2 pedagogy review (17 rewrites); A1 pedagogy review (40 rewrites); B1 mock_01 | #35, #36, #37, #38, #39 |
| 2026-04-19–20 | Sprachbausteine renderer; B1 grammar 20 topics; B1 mocks 02-10; B1 vocab 2,400; B1 full listening audio | #40, #41, #42, #43, #44, #45, #47 |
| 2026-04-20 | Speaking recorder; rebrand telc-fasttrack → Fastrack Deutsch; UI upgrade phases 1-4 | #46, #48, #50, #51, #52, #53 |
| 2026-04-20 eve | B2 exam format spec; B2 mock_01 (Beruf & Arbeitswelt, worked example, 3 pedagogy rewrites + 3 language fixes); B2_grammar.json 25 topics (3 reorder fixes) | #61, #62 |
| 2026-04-20–21 | B2 mocks 02-10 (all themes, all CI green); B2_vocabulary.json 4,016 entries; B2 SSML mocks 01-10 (30 scripts); B2 pedagogy batch review — all 10 PASS | #72 (merged), #73, #74, #75, #76, #77, #78, #79, #80, #81, #82 |
