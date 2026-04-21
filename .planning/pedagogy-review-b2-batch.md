# B2 Mocks Pedagogy Batch Review — 2026-04-20/21
> Reviewer: pedagogy-director (dispatched in 2 batches) | Reference: mock_01 worked example | Spec: `.planning/research/B2-exam-format.md`

---

## Summary

| Mock | Theme | PR | Verdict | Rewrites | Notes |
|------|-------|----|---------|----------|-------|
| mock_01 | Beruf & Arbeitswelt | #61 (merged) | PASS | 3 | Worked example; binding review sets calibration rules |
| mock_02 | Bildung & Studium | #74 | PASS | 0 | Clean. Advisory: topic concentration on Bildung |
| mock_03 | Gesundheit & Medizin | #72 (merged) | PASS | — | Self-assessed A on all dimensions |
| mock_04 | Medien & Kommunikation | #73 | PASS | 0 | Best topic diversity of batch |
| mock_05 | Umwelt & Nachhaltigkeit | #76 | PASS | 0 | Kreislaufwirtschaft T2 article strong |
| mock_06 | Reisen & Mobilität | #75 | PASS | 0 | Nachtzug/E-Bike/Overtourism |
| mock_07 | Technologie & Digitalisierung | #81 | PASS (advisory) | 1 | Lesen T2 Q1: removed superfluous 4th MCQ option |
| mock_08 | Gesellschaft & Integration | #79 | PASS | 0 | Clean |
| mock_09 | Kultur & Kunst | #78 | PASS | 0 | Clean |
| mock_10 | Wirtschaft & Konsum | #80 | PASS | 0 | Clean |

**Overall:** All 10 B2 mocks PASS pedagogy review. 1 structural fix (mock_07). No dimension below 3.5/5 on any mock.

---

## Per-Dimension Scores (across 8 reviewed mocks, excluding #61 and #72 already covered)

| Dimension | Mean | Notes |
|-----------|------|-------|
| Content Accuracy | 4.5 | Consistent. Minor advisory on mock_02 R3 instruction text ("Zwei" vs "Drei" ads remaining). |
| CEFR Level (B2) | 5.0 | No above-B2 leakage in exam-facing content. Metalinguistic terms correctly scoped to explanations. |
| Distractor Quality | 4.4 | Hedging traps in Hören T2 consistently strong. SB T1 distractors tempting. |
| Explanation Quality | 5.0 | All questions cite source + name grammar rule + explain ≥1 distractor. |
| Format Fidelity | 5.0 | 4-option SB T1, 15-option SB T2, playCount:1, 2-prompt Schreiben, 3-part Sprechen with A/B — consistent. |
| Topic Coverage | 4.3 | Some concentration patterns; noted below. |

---

## Cross-Mock Patterns Flagged (advisory)

1. **SB T1 structural template** — all 4 mocks 02-06 use identical gap positions for identical grammar features (gap 1=Passiv, gap 5=Genitiv-Präp, gap 8=prädikatives Adj, gap 9=Partizipialattribut). Varied in mocks 07-10 but consider rotation if mocks 11+ ever authored.

2. **Sprechen T2 topic duplication** — mock_05 and mock_06 both use "Innerdeutsche Kurzstreckenflüge verbieten" as Diskussionsthema. Only spot where a concrete topic repeats. Future mocks avoid.

3. **Hören T2 closing-line pattern** — all 4 mocks 07-10 end Hören Teil 2 with a meta-question about website/event announcement at the end. Minor predictability.

4. **Surnames** — Dr. Mertens used in both mock_09 and mock_10 (different first names + fields). Consider renaming one.

5. **Hedging "Man hört/liest oft..." rejection pattern** — used in Hören T2 of all 4 mocks 07-10. Pedagogically correct (IS the B2 listening skill) but by mock 10 a test-savvy candidate may recognize the surface pattern.

---

## Rewrite Applied

**mock_07** — Lesen Teil 2 Q1: 4 MCQ options → 3 (telc B2 spec requires 3). Removed superfluous option d "KI ist für den deutschen Mittelstand keine relevante Technologie." Tagged `[PEDAGOGY-REWRITE]`. Committed to branch `b2-mock-07`.

---

## Merge Readiness

All 8 open B2 mock PRs (74, 73, 76, 75, 81, 79, 78, 80) are pedagogically approved and CI green. Ready for user merge at discretion.
