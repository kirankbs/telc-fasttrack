# Contract: A2 Grammar JSON

**Issue:** #28 — content(A2): grammar JSON (target 15 topics)
**Sprint:** 2026-04-19

## Acceptance Criteria

### Completeness
- [ ] File: `apps/mobile/src/data/grammar/A2_grammar.json`
- [ ] Exactly 15 grammar topics
- [ ] Each topic has: `id` (sequential int), `level` ("A2"), `topic`, `explanation`, `examples` (min 4), `exercises` (min 4), `orderIndex`
- [ ] Exercise types drawn from: `fill_blank`, `mcq`, `reorder`
- [ ] Each exercise has: `type`, `prompt`, `correctAnswer`, `explanation`
- [ ] `orderIndex` values 1-15, no gaps

### Structural Validity
- [ ] Same JSON shape as `A1_grammar.json` — array of objects, identical key set per topic and per exercise
- [ ] No duplicate `id` values
- [ ] No duplicate `topic` names
- [ ] Valid JSON — parseable without errors
- [ ] MCQ exercises: `correctAnswer` is a plausible answer (not a label like "b")

### CEFR A2 Compliance
- [ ] Topics cover core A2 grammar: Perfekt, Dativ, Nebensätze mit weil/dass, Komparativ/Superlativ, Reflexivverben, Wechselpräpositionen, Konjunktionen, Pronomen, Futur mit werden, Adjektivdeklination (basic), Plusquamperfekt excluded
- [ ] No overlap with A1 grammar topics (builds on, does not repeat)
- [ ] Explanations and examples use A2-appropriate complexity

### Quality Gates
- [ ] language-checker agent validates: German grammar correctness in examples and exercise prompts
- [ ] Each exercise answer verified as genuinely correct
- [ ] `npx tsc --noEmit` passes
