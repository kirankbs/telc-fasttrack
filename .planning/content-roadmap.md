# Content Roadmap — Telc-FastTrack
> Last updated: 2026-04-10 | Maintained by `content-strategist`

---

## Current State

| Level | Mocks (complete) | Target | Vocab Words | Target | Grammar Topics | Audio Files | Priority |
|-------|-----------------|--------|-------------|--------|----------------|-------------|----------|
| **A1** | **10** | 10 | **650** | 650 | **12** | 0 | **Active — shippable pending boot test + audio** |
| A2 | 0 | 10 | 0 | 1,300 | 0 | 0 | Blocked — boot test gate |
| B1 | 0 | 10 | 0 | 2,400 | 0 | 0 | — |
| B2 | 0 | 10 | 0 | 4,000 | 0 | 0 | — |
| C1 | 0 | 10 | 0 | 6,000 | 0 | 0 | — |

**A1 gate status:** All content thresholds met — 10/10 mocks, 650/650 vocab, 12 grammar topics. Remaining gates: boot test (device/sim) + audio generation (GCP credentials required). A2 blocked on boot test passing.

---

## A1 Section Coverage

### Mock Exams

| Mock | Hören | Lesen | Schreiben | Sprechen | Audio | Pedagogy | Status |
|------|-------|-------|-----------|----------|-------|----------|--------|
| mock_01 | 11q | 15q | full content | full content | — | Reviewed | Built — awaiting audio |
| mock_02 | 11q | 15q | full content | full content | — | Reviewed | Built — awaiting audio |
| mock_03 | 11q | 15q | full content | full content | — | Reviewed | Built — awaiting audio |
| mock_04 | 11q | 15q | full content | full content | — | Reviewed | Built — awaiting audio |
| mock_05 | 11q | 15q | full content | full content | — | Reviewed | Built — awaiting audio |
| mock_06 | full | full | full content | full content | — | Pending | Built today — awaiting pedagogy review |
| mock_07 | full | full | full content | full content | — | Pending | Built today — awaiting pedagogy review |
| mock_08 | full | full | full content | full content | — | Pending | Built today — awaiting pedagogy review |
| mock_09 | full | full | full content | full content | — | Pending | Built today — awaiting pedagogy review |
| mock_10 | full | full | full content | full content | — | Pending | Built today — awaiting pedagogy review |

**Worktree:** Mocks 06-10 live in `.worktrees/a1-mocks-6-10/` — not yet merged to main.

### Audio Pipeline

| Asset | State | Location |
|-------|-------|----------|
| mock_01 listening SSML (3 parts) | Scripts written — not yet rendered | `.planning/audio-prompts/A1_mock01_listening_part{1,2,3}.ssml` |
| mock_02-10 SSML | Not started | — |
| All MP3s | 0 generated | — |

Blocking factor: GCP credentials (user-held). Unblocked work is writing remaining SSML scripts.

### Placeholder Images Required

| Mock | Section | Slots | State |
|------|---------|-------|-------|
| mock_01 | Listening Part 1 | 6 images | Missing |
| mock_01 | Speaking Part 2 | 5 picture cards | Missing |

These are the only visual gaps known. Affects render completeness for mock_01 only.

### Vocabulary Coverage (Goethe A1 Wortliste — target met)

| Topic Area | Count | Target | Coverage |
|-----------|-------|--------|----------|
| Arbeit/Beruf | 30 | 30 | 100% |
| Ausbildung | 25 | 25 | 100% |
| Einkaufen | 30 | 30 | 100% |
| Freizeit/Unterhaltung | 30 | 30 | 100% |
| Kommunikation | 25 | 25 | 100% |
| Körper/Gesundheit | 30 | 30 | 100% |
| Menge/Maß | 25 | 25 | 100% |
| Ort/Raum | 30 | 30 | 100% |
| Persönliche Angaben | 40 | 40 | 100% |
| Persönliche Beziehungen | 35 | 35 | 100% |
| Politik/Gesellschaft | 25 | 25 | 100% |
| Reisen/Verkehr | 35 | 35 | 100% |
| Sprache/Schrift | 25 | 25 | 100% |
| Umwelt | 25 | 25 | 100% |
| Verpflegung | 35 | 35 | 100% |
| Wohnung | 35 | 35 | 100% |
| Zeit | 35 | 35 | 100% |
| Öffentliche/private Dienstleistungen | 25 | 25 | 100% |
| **Total** | **650** | **650** | **100%** |

Expanded from 430 to 650 words this session. Goethe A1 Wortliste target met.

### Grammar Topics (12 topics — all complete)

| Topic | Exercises | Status |
|-------|-----------|--------|
| Präsens — regelmäßige Verben | 5 | Done |
| Präsens — sein und haben | 4 | Done |
| Grundwortstellung (SVO) | 4 | Done |
| W-Fragen | 4 | Done |
| Ja/Nein-Fragen | 4 | Done |
| Artikel — bestimmt und unbestimmt | 5 | Done |
| Negation — nicht und kein | 4 | Done |
| Modalverben — können und möchten | 5 | Done |
| Trennbare Verben | 4 | Done |
| Possessivartikel — mein und dein | 4 | Done |
| Imperativ — Sie-Form | 4 | Done |
| Präpositionen mit Dativ — Ortsangaben | 5 | Done |

P2 grammar (Akkusativ, Perfekt mit haben, Perfekt mit sein) deferred — not in A1 shippable scope.

---

## P0 Sprint — Immediate (device or GCP required)

These are the only remaining gates before A1 is shippable. No content work unblocks them — they need environment access.

| # | Item | Owner | Effort | Gate |
|---|------|-------|--------|------|
| 1 | Boot test — run on device/simulator, click through all 5 tabs and a full mock exam session | User | 30m | Unblocks A2 content start |
| 2 | Commit and merge `boot-test-fixes` worktree | User | 10m | useAudioPlayer fix + mockId null-checks land on main |
| 3 | Commit and merge `a1-mocks-6-10` worktree | User | 10m | Mocks 06-10 land on main |
| 4 | Audio generation — run GCP TTS on 3 existing SSML scripts for mock_01 | User | 20m | First audio in app; validates pipeline for mocks 02-10 |

## P1 Sprint — After boot test passes

| # | Item | Effort | Rationale | Score |
|---|------|--------|-----------|-------|
| 5 | Pedagogy review: mocks 06-10 | 2h | Built today, not yet reviewed. 5 mocks × 4 sections = 20 section reviews. Required before these mocks go live. | 88 |
| 6 | Write SSML scripts for mock_01 images: Listening Part 1 (6 images) + Speaking Part 2 (5 cards) | 45m | Placeholder images block visual completeness on the first mock a user sees. Needed for polish milestone. | 74 |
| 7 | Write SSML scripts for mocks 02-05 listening | 1h | Once mock_01 GCP pipeline validated, batch the rest. Scripts can be written device-free. | 72 |
| 8 | A2 content planning: scope vocab list + first 2 mocks outline | 1h | Unblocks A2 start post-boot-test. A2 adds Sprachbausteine section — schema already supports it at B1+, verify for A2. | 65 |

## P2 Backlog

| # | Item | Notes |
|---|------|-------|
| 9 | Generate audio for mocks 02-10 listening (when scripts exist) | Batch GCP job — run after mock_01 pipeline is validated |
| 10 | Placeholder images for mocks 02-10 speaking/listening | Lower priority than mock_01; affects render polish only |
| 11 | Akkusativ grammar topic (4-5 exercises) | Only missing A1 grammar topic from full scope |
| 12 | Perfekt mit haben + mit sein | Completes A1 grammar; not blocking for launch |
| 13 | A2 mock content (10 mocks, 1,300 vocab) | After boot test passes and A2 scope is defined |

---

## Strategic Rules

1. **A1 content is done.** Do not add more A1 content — fill audio and images instead. Content resources go to A2 planning.
2. **Boot test is the single critical path item.** Nothing else gates A2 start more directly.
3. **Pedagogy review on 06-10 is parallel work.** Can happen before or after boot test — does not depend on device access.
4. **Audio pipeline: write scripts now, generate later.** Never block SSML authoring on GCP credentials.
5. **A2 adds Sprachbausteine — verify before building.** This section exists at B1+ in the schema; confirm whether A2 in the telc spec uses it before writing content.

---

## Session History

| Date | Built | Notes |
|------|-------|-------|
| pre-2026-04-03 | Project scaffolding, services, UI shell | Initial setup |
| 2026-04-03 | A1 mocks 01-05 (all 4 sections full), vocab 430 words, grammar 12 topics, full exam flow UI | Roadmap was stale — showed 0 mocks |
| 2026-04-09 | Roadmap full refresh | Discovered writing/speaking sections empty in mocks 01-05; stubs 06-10 completely empty |
| 2026-04-10 | A1 mocks 06-10 (all 4 sections, complete content), vocab 430 → 650 words, SSML scripts for mock_01 listening parts 1-3, boot-test code fixes (useAudioPlayer hook rules + mockId null-checks) | All A1 content thresholds met. Two worktrees pending merge. Boot test + audio remain the only shippable gates. |
