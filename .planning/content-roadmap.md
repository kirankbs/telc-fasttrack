# Content Roadmap — Telc-FastTrack
> Last updated: 2026-04-19 | Maintained by `content-strategist`

---

## Current State

| Level | Mocks (complete) | Target | Vocab Words | Target | Grammar Topics | Audio Files | Status |
|-------|-----------------|--------|-------------|--------|----------------|-------------|--------|
| **A1** | **10** | 10 | **650** | 650 | **12** | **15 MP3s** | Active — mocks 06-10 audio in-flight |
| **A2** | **10** | 10 | **800** | 1,300 | **15** | 0 | Active — audio in-flight this session |
| B1 | 10 (stubs) | 10 | 0 | 2,400 | 0 | 0 | Unaudited stubs — no real content |
| B2 | 10 (stubs) | 10 | 0 | 4,000 | 0 | 0 | Unaudited stubs — no real content |
| C1 | 10 (stubs) | 10 | 0 | 6,000 | 0 | 0 | Unaudited stubs — no real content |

**Critical finding:** B1, B2, C1 JSON files exist on disk but carry `_stub: true` with empty `sections[]`. They are scaffolding placeholders — zero content. Do not count them as complete mocks.

**A2 vocab gap:** 800/1,300 words merged. 500-word gap remains before A2 vocab target is met.

---

## A1 Section Coverage

### Mock Exams

| Mock | Hören | Lesen | Schreiben | Sprechen | SSML | Audio (MP3) | Pedagogy | Status |
|------|-------|-------|-----------|----------|------|-------------|----------|--------|
| mock_01 | 11q | 15q | full | full | Parts 1-3 | Parts 1-3 | Reviewed | Complete — audio live |
| mock_02 | 11q | 15q | full | full | Parts 1-3 | Parts 1-3 | Reviewed | Complete — audio live |
| mock_03 | 11q | 15q | full | full | Parts 1-3 | Parts 1-3 | Reviewed | Complete — audio live |
| mock_04 | 11q | 15q | full | full | Parts 1-3 | Parts 1-3 | Reviewed | Complete — audio live |
| mock_05 | 11q | 15q | full | full | Parts 1-3 | Parts 1-3 | Reviewed | Complete — audio live |
| mock_06 | full | full | full | full | Parts 1-2 only | — | Pending | Audio in-flight (this session) |
| mock_07 | full | full | full | full | — | — | Pending | SSML not started |
| mock_08 | full | full | full | full | — | — | Pending | SSML not started |
| mock_09 | full | full | full | full | — | — | Pending | SSML not started |
| mock_10 | full | full | full | full | — | — | Pending | SSML not started |

### Audio Pipeline — A1

| Asset | State |
|-------|-------|
| Mocks 01-05 SSML (15 files) | Complete |
| Mocks 01-05 MP3s (15 files) | Rendered — shipped in PR #33 |
| Mock 06 SSML (parts 1-2 of 3) | Partial — part 3 missing |
| Mocks 07-10 SSML | Not started |
| Mocks 06-10 MP3s | In-flight (dispatched this session) |

### Vocabulary — A1 (target met)

| Metric | Count | Target | Coverage |
|--------|-------|--------|----------|
| Total words | 650 | 650 | 100% |
| Grammar topics | 12 | 12 | 100% |

P2 grammar (Akkusativ, Perfekt mit haben, Perfekt mit sein) deferred — not blocking A1 launch.

---

## A2 Section Coverage

### Mock Exams

| Mock | Hören | Lesen | Schreiben | Sprechen | SSML | Audio (MP3) | Pedagogy | Status |
|------|-------|-------|-----------|----------|------|-------------|----------|--------|
| mock_01 | full | full | full | full | Part 1 only | — | Pending | Audio in-flight |
| mock_02 | full | full | full | full | — | — | Pending | SSML not started |
| mock_03 | full | full | full | full | — | — | Pending | SSML not started |
| mock_04 | full | full | full | full | — | — | Pending | SSML not started |
| mock_05 | full | full | full | full | — | — | Pending | SSML not started |
| mock_06 | full | full | full | full | Part 1 only | — | Pending | Audio in-flight |
| mock_07 | full | full | full | full | — | — | Pending | SSML not started |
| mock_08 | full | full | full | full | — | — | Pending | SSML not started |
| mock_09 | full | full | full | full | — | — | Pending | SSML not started |
| mock_10 | full | full | full | full | — | — | Pending | SSML not started |

### Audio Pipeline — A2

All 10 mocks lack audio. SSML exists for mock_01 part 1 and mock_06 part 1 only. Full SSML authoring + GCP render pass required.

### Vocabulary — A2 (gap remaining)

| Metric | Count | Target | Gap |
|--------|-------|--------|-----|
| Total words | 800 | 1,300 | 500 words |
| Grammar topics | 15 | ~20 | Unscoped |

A2 grammar topics count (15) is ahead of what was planned. Vocab gap of 500 words is the primary A2 content debt outside audio.

---

## B1 / B2 / C1 — Stub State

All three levels have 10 JSON files per level on disk. Every file carries `_stub: true` with an empty `sections` array. These are route/catalog scaffolds only.

| Level | Mock Files | Content | Vocab | Grammar | Audio | Needed Before Real Work |
|-------|-----------|---------|-------|---------|-------|------------------------|
| B1 | 10 (stubs) | 0 sections | 0 | 0 | 0 | Pedagogy scoping, section spec, vocab list |
| B2 | 10 (stubs) | 0 sections | 0 | 0 | 0 | Same |
| C1 | 10 (stubs) | 0 sections | 0 | 0 | 0 | Same |

B1+ adds Sprachbausteine (cloze) as a 5th section. Schema support needs verification before content is authored.

---

## Next Up — Top 3 Items for Next Deep-Work Session

Scored on: Exam Coverage (40%) + Content Quality Gap (35%) + Production Readiness (25%).
A1 2x multiplier no longer applies — A1 content is complete.

### 1. A2 Audio — Full SSML authoring + GCP render pass (Score: 91)

**Why first:** A2 has 10 complete, structurally valid mocks with zero audio. The listening sections are unplayable. The audio player component is built and validated on A1 — infrastructure is ready. This is a pure content execution task with no unknowns. Completing it makes A2 a shippable level.

- Coverage gap: 10/10 mocks have no audio (high weight)
- Quality gap: Listening section is broken UX without audio
- Readiness: Audio player, GCP pipeline, and SSML format all validated on A1

Action: Author SSML for all A2 mocks (30 files: 3 parts x 10 mocks), batch-render via GCP WaveNet, ship as single PR.

### 2. A2 Vocabulary — 500-word gap to target (Score: 74)

**Why second:** 800/1,300 words means the spaced-repetition deck covers ~62% of the A2 Goethe list. Users studying A2 hit missing words quickly. Vocab is self-contained, no infrastructure dependency, and directly improves practice session quality before audio is even needed.

- Coverage gap: 38% of target vocab missing
- Quality gap: Deck holes hurt retention for users already using A2 mocks
- Readiness: Vocab JSON schema and spaced-repetition engine are fully built

Action: Fill the remaining 500 A2 words against the Goethe A2 Wortliste. One PR, one JSON file.

### 3. A2 Pedagogy Review — All 10 mocks (Score: 68)

**Why third:** A2 mocks were merged without a pedagogy-director review pass (A1 mocks 01-05 had one; 06-10 did not either — both levels have this debt). Before promoting A2 as a tested-ready level, question quality, distractor validity, and difficulty calibration need a sign-off. This is the last gate before A2 can be called shippable.

- Coverage: 0/10 mocks reviewed
- Quality gap: No validation that questions map to A2 CEFR descriptors
- Readiness: UI is ready; this is human review work, not build work

Action: Schedule pedagogy-director session. 10 mocks x 4 sections = 40 section reviews. Estimated 3-4h.

---

## Strategic Rules

1. **A1 is shippable pending audio for mocks 06-10.** Do not touch A1 content.
2. **A2 audio is the highest-leverage task next session.** Infrastructure is proven. This is execution, not exploration.
3. **B1/B2/C1 stubs are not content.** Do not reference them as "10 mocks built" — they are empty scaffolds.
4. **Vocab and audio are parallel workstreams.** Neither blocks the other.
5. **Pedagogy review can happen async.** It does not block audio generation or vocab fill.
6. **Never start B1 content before A2 audio and vocab gap are closed.** Complete levels beat partial coverage across all levels.

---

## Session History (recent)

| Date | Built | PRs |
|------|-------|-----|
| pre-2026-04-10 | A1 mocks 01-10, vocab 650 words, grammar 12 topics, boot-test fixes | Multiple |
| 2026-04-10 | A1 SSML for mocks 01-05 (15 scripts) | — |
| 2026-04-13 | Audio player component (web) | #34 |
| 2026-04-13 | A1 MP3s for mocks 01-05 (GCP WaveNet, 15 files) | #33 |
| 2026-04-13 | A2 mocks 08-10 | #30 |
| 2026-04-13 | A2 vocab (800 words), A2 grammar (15 topics) | #27, #28 |
| 2026-04-13 | A2 mocks 01-07 across multiple PRs | #21, #22, #23, #25, #26, #29, #31, #32 |
| 2026-04-19 | A1 mocks 06-10 audio in-flight; A2 audio in-flight | This session |
