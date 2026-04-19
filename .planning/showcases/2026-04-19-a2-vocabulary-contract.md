# Contract: A2 Vocabulary JSON

**Issue:** #27 — content(A2): vocabulary JSON (target 800 words)
**Sprint:** 2026-04-19

## Acceptance Criteria

### Completeness
- [ ] File: `apps/mobile/src/data/vocabulary/A2_vocabulary.json`
- [ ] Minimum 800 vocabulary entries
- [ ] Each entry has all required fields: `id`, `level`, `german`, `english`, `exampleSentence`, `topic`
- [ ] `level` set to `"A2"` on every entry
- [ ] `id` values are sequential integers starting from 1, no gaps
- [ ] Nouns include `article` (der/die/das) and `plural` where applicable
- [ ] Every entry has a `topic` from a defined set of A2-relevant categories
- [ ] Minimum 12 distinct topic categories represented
- [ ] SM-2 defaults present: `easeFactor: 2.5`, `intervalDays: 0`, `repetitions: 0`, `nextReviewDate: null`, `lastReviewedAt: null`, `audioFile: null`

### Structural Validity
- [ ] Same JSON shape as `A1_vocabulary.json` — array of objects, identical key set
- [ ] No duplicate `german` values within the file
- [ ] No duplicate `id` values
- [ ] Valid JSON — parseable without errors
- [ ] No entries that duplicate A1 vocabulary (cross-file uniqueness)

### CEFR A2 Compliance
- [ ] Words drawn from CEFR A2 word lists (Goethe A2 Wortliste, telc A2 Wortschatz)
- [ ] Topics cover A2 domains: Alltag, Arbeit, Freizeit, Gesundheit, Reisen, Einkaufen, Wohnen, Essen, Medien, Natur
- [ ] Example sentences use A2-level grammar (no Konjunktiv II, no Passiv, no complex Nebensätze)

### Quality Gates
- [ ] language-checker agent validates: German spelling, article correctness, plural forms
- [ ] Spot-check 20 random entries for accurate English translations
- [ ] `npx tsc --noEmit` passes
