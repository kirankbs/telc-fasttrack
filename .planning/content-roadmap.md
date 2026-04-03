# Content Roadmap — Telc-FastTrack
> Last updated: 2026-04-03 | Maintained by `content-strategist`

---

## Current State

| Level | Mocks | Target | Vocab Words | Target | Grammar Topics | Audio Files | Priority |
|-------|-------|--------|-------------|--------|----------------|-------------|----------|
| **A1** | 0 | 10 | 0 | 650 | 0 | 0 | **80% of effort** |
| A2 | 0 | 10 | 0 | 1,300 | 0 | 0 | Blocked until A1 validated |
| B1 | 0 | 10 | 0 | 2,400 | 0 | 0 | — |
| B2 | 0 | 10 | 0 | 4,000 | 0 | 0 | — |
| C1 | 0 | 10 | 0 | 6,000 | 0 | 0 | — |

---

## Priority: A1 (80% of initial effort)

### P0 — This Sprint

| # | Item | Type | Why P0 | Status |
|---|------|------|--------|--------|
| 1 | A1 mock_01 (all 4 sections) | Mock exam | First complete mock — validates full exam flow | ⬜ Not started |
| 2 | A1 vocabulary seed (200 words) | Vocab | Core flashcard system needs content to test | ⬜ Not started |
| 3 | A1 grammar basics (Präsens, Artikel, W-Fragen, Negation) | Grammar | Foundation grammar for A1 level | ⬜ Not started |

### P1 — Next Sprint

| # | Item | Type | Notes |
|---|------|------|-------|
| 4 | A1 mock_02, mock_03 | Mock exam | Second + third mocks for variety |
| 5 | A1 vocabulary (words 201-400) | Vocab | Expand flashcard deck |
| 6 | A1 listening audio — mock_01 (SSML + TTS generation) | Audio | Needs GCP credentials |
| 7 | A1 grammar expansion (Perfekt, Modalverben, Akkusativ) | Grammar | Complete A1 grammar scope |

### P2 — Backlog

| # | Item | Notes |
|---|------|-------|
| 8 | A1 mocks 04-10 | Complete the 10-mock target |
| 9 | A1 full vocabulary (651-650 words) | Complete Goethe A1 Wortliste |
| 10 | A1 all audio (mocks 02-10) | After GCP TTS pipeline is established |
| 11 | A2 mock_01 | First cross-level content — after A1 core validated |

---

## A1 Section Coverage

### Mock Exams
| Mock | Hören | Lesen | Schreiben | Sprechen | Audio | Status |
|------|-------|-------|-----------|----------|-------|--------|
| mock_01 | — | — | — | — | — | ⬜ |
| mock_02 | — | — | — | — | — | ⬜ |
| mock_03 | — | — | — | — | — | ⬜ |
| mock_04 | — | — | — | — | — | ⬜ |
| mock_05 | — | — | — | — | — | ⬜ |
| mock_06 | — | — | — | — | — | ⬜ |
| mock_07 | — | — | — | — | — | ⬜ |
| mock_08 | — | — | — | — | — | ⬜ |
| mock_09 | — | — | — | — | — | ⬜ |
| mock_10 | — | — | — | — | — | ⬜ |

### Vocabulary Coverage (Goethe A1 Wortliste — 650 words)

| Topic Area | Count | Target | Coverage |
|-----------|-------|--------|----------|
| Persönliche Angaben | 0 | 40 | 0% |
| Familie | 0 | 35 | 0% |
| Wohnen | 0 | 45 | 0% |
| Alltag & Arbeit | 0 | 60 | 0% |
| Essen & Trinken | 0 | 50 | 0% |
| Freizeit & Sport | 0 | 45 | 0% |
| Gesundheit & Körper | 0 | 40 | 0% |
| Reisen & Verkehr | 0 | 50 | 0% |
| Einkaufen | 0 | 40 | 0% |
| Zeit & Datum | 0 | 35 | 0% |
| Zahlen & Mengen | 0 | 30 | 0% |
| Farben & Formen | 0 | 25 | 0% |
| Wetter | 0 | 25 | 0% |
| Schule | 0 | 40 | 0% |
| Stadt & Orientierung | 0 | 45 | 0% |
| Kommunikation | 0 | 35 | 0% |
| Gefühle | 0 | 25 | 0% |
| Sonstiges | 0 | 25 | 0% |
| **Total** | **0** | **650** | **0%** |

### Grammar Topics
| Topic | Priority | Status |
|-------|----------|--------|
| Präsens (sein, haben, regelmäßige Verben) | P0 | ⬜ |
| Bestimmter und unbestimmter Artikel | P0 | ⬜ |
| W-Fragen und Ja/Nein-Fragen | P0 | ⬜ |
| Negation (nicht, kein) | P0 | ⬜ |
| Personalpronomen (ich, du, er, sie...) | P1 | ⬜ |
| Possessivpronomen (mein, dein...) | P1 | ⬜ |
| Akkusativ (maskulin: den/einen/keinen) | P1 | ⬜ |
| Modalverben (können, müssen, wollen) | P1 | ⬜ |
| Perfekt mit haben | P1 | ⬜ |
| Präpositionen (in, an, auf, mit, zu...) | P1 | ⬜ |
| Imperativ | P2 | ⬜ |
| Perfekt mit sein | P2 | ⬜ |

---

## Strategic Rules

1. **A1 first, always.** No A2+ content until A1 has ≥5 complete mocks + ≥400 vocab words + full end-to-end exam simulation validated.
2. **Audio unblocked separately.** SSML scripts can be written immediately; audio generation requires GCP credentials. Scripts go to `.planning/audio-prompts/`.
3. **Content quality gates.** Every mock goes through `pedagogy-director` review before being counted as complete.
4. **Vocabulary seeded from mock content.** Extract key vocabulary from each mock exam to populate the flashcard deck — this ensures alignment between exam content and flashcard practice.

---

## Session History

| Date | Agent | Built | Notes |
|------|-------|-------|-------|
| — | — | Project scaffolding | Initial project setup |
