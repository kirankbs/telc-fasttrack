# Contract: A2 Mock Exams 08-10

**Issue:** #26 — content(A2): mock exams 08-10 (Gesundheit, Reisen, Einkaufen)
**Sprint:** 2026-04-19

## Acceptance Criteria

### Completeness
- [ ] 3 mock exams: `mock_08.json` through `mock_10.json` in `apps/mobile/assets/content/A2/`
- [ ] Each mock has 15 Listening questions across 3 parts (5+5+5)
- [ ] Each mock has 15 Reading questions across 3 parts (5+5+5)
- [ ] Each mock has 2 Writing tasks (Schreiben)
- [ ] Each mock has 3 Speaking parts (Sprechen) with prompt, sampleResponse, keyPhrases
- [ ] Themes assigned: mock_08=Gesundheit, mock_09=Reisen, mock_10=Einkaufen
- [ ] `_stub: true` removed, `version` set to `1`
- [ ] Completes the A2 mock set — all 10 mocks fully populated

### Structural Validity
- [ ] All question IDs follow pattern `A2_mXX_SN_qN` (e.g. `A2_m08_L2_q3`)
- [ ] No duplicate IDs within mocks 08-10 or across the full A2 set (01-10)
- [ ] Every MCQ `correctAnswer` matches one of its `options` prefixes (a/b/c)
- [ ] Every question has non-empty `explanation` field
- [ ] Listening questions include `audioTimestamp` (integer)
- [ ] `audioFile` paths follow `assets/audio/A2/mockXX/listening_partN.mp3`
- [ ] Writing tasks include `prompt`, `sampleResponse`, `evaluationCriteria`
- [ ] Speaking parts include `type`, `instructions`, `instructionsTranslation`
- [ ] Valid JSON — `npx jsonlint` passes on all 3 files

### CEFR A2 Compliance
- [ ] Vocabulary and grammar stay within CEFR A2 range
- [ ] Scenarios reflect everyday A2 topics (health, travel, shopping)
- [ ] Question difficulty comparable to mocks 01-03 (quality bar)

### Quality Gates
- [ ] exam-tester agent validates structure against `src/types/exam.ts` MockExam interface
- [ ] `npx tsc --noEmit` passes (no type regressions)
- [ ] Cross-check: no thematic overlap with mocks 04-07 questions
- [ ] Manual spot-check: 2 questions per mock for plausibility of correct answers
