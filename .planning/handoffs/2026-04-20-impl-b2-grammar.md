# Handoff — #59 — B2 grammar topics (25)

**Date:** 2026-04-20
**Agent:** implementation-lead
**Branch:** `b2-grammar`
**PR:** https://github.com/kirankbs/fastrack-deutsch/pull/62

## What was built

Populated `apps/mobile/src/data/grammar/B2_grammar.json` (previously `[]`) with 25 grammar topics covering the telc B2 scope. Matches the same `GrammarTopic` schema used for A1/A2/B1 so the existing grammar UI renders B2 topics without further code changes.

Each topic contains:
- German `topic` label
- 100-160 word German `explanation` (all 25 topics landed in range 108-136 words)
- 6-8 German example sentences
- Exactly 6 exercises across the three types: `fill_blank`, `mcq`, `reorder`
- `id === orderIndex`, `level: "B2"`

Topics 2 (Konjunktiv II) and 9 (Konnektoren) explicitly flag their B2 extension over the B1 treatment inside the explanation text.

## Topics shipped

1. Konjunktiv I — indirekte Rede
2. Konjunktiv II — Irrealis und höfliche Bitten (B2 extension)
3. Passiv — Präsens, Präteritum und Perfekt
4. Passiv-Ersatzformen
5. Partizipialkonstruktionen
6. Erweiterte Attribute
7. Nominalisierung
8. Substantivierte Infinitive
9. Konnektoren — Kausalität, Konzessivität, Finalität (B2 extension)
10. Zweiteilige Konnektoren
11. Relativsätze mit was, wo, wer
12. Präpositionen mit Genitiv
13. n-Deklination
14. Adjektivdeklination — gemischt und rein
15. Modalverben subjektiv
16. Temporalsätze
17. Indefinitpronomen
18. Modalpartikeln
19. Trennbare und untrennbare Verben — Bedeutungsnuancen
20. Funktionsverbgefüge
21. Negation — Satz- und Wortebene
22. Gerundivum — zu + Partizip als Attribut
23. Appositionen
24. Hervorhebung — es-Spaltsätze, Inversion, Topikalisierung
25. Indirekte Fragesätze

## Files changed

- `apps/mobile/src/data/grammar/B2_grammar.json` — `[]` → 25 grammar topics (~76 KB).

## Tests

- Unit: no new unit tests required for content-only JSON; schema validation done via inline Python assertions during build (`len(d) == 25`, `id === orderIndex`, all required keys present, exercise mix enforced).
- Web tests: `pnpm --filter '!@fastrack/mobile' -r test` — 210/210 passing.
- Typecheck: clean (`pnpm typecheck` — all packages + apps pass).
- Mobile Jest: preexisting failure on main (expo-modules-core ESM parse error in jest harness). Not caused by this PR. Confirmed by running on `main` — same failure.

## Quality gates

| Gate | Status | Notes |
|------|--------|-------|
| schema | PASS | Matches `GrammarTopic` in `packages/types/src/exam.ts` |
| explanation length | PASS | All 25 in range 108-136 words (target 100-160) |
| exercise mix | PASS | 3 types per topic, 6 per topic; totals 74 fill_blank / 51 mcq / 25 reorder |
| example terminators | PASS | Every example ends with `.`, `!`, or `?` |
| MCQ shape | PASS | `correctAnswer` only, no `options` array — matches B1 |
| typecheck | PASS | `pnpm typecheck` clean |
| web tests | PASS | 210/210 pass |
| language-checker | DEFERRED | No Task tool in this session — recommend orchestrator run `language-checker` with `scope=content-only`, `level=B2` against this PR |
| exam-tester layer A | DEFERRED | Same — recommend running against the merged content |

## Notes

- No explanation needed shortening below 100 words or expansion above 160.
- Topic 19 (trennbar/untrennbar) originally had inline parenthetical glosses in example sentences like `"...umgefahren. (trennbar — umgeworfen)"`; these were rewritten as full sentences so that each example ends on a clean terminator, matching the shape of A1/A2/B1 content.
- Strategy: per-topic Write tool calls (one file per topic into `/tmp/b2-grammar/`) to keep the stream watchdog firing, then a single Python merge into the final JSON. Avoids the prior session's batched-construction timeout.
