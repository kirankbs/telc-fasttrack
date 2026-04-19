# Contract: A2 Mock Exams 04-07

**Issue:** #25 — content(A2): mock exams 04-07 (Essen, Termine, Arbeit, Freizeit)
**Sprint:** 2026-04-19

## Acceptance Criteria

### Completeness
- [ ] 4 mock exams: `mock_04.json` through `mock_07.json` in `apps/mobile/assets/content/A2/`
- [ ] Each mock has 15 Listening questions across 3 parts (5+5+5)
- [ ] Each mock has 15 Reading questions across 3 parts (5+5+5)
- [ ] Each mock has 2 Writing tasks (Schreiben)
- [ ] Each mock has 3 Speaking parts (Sprechen) with prompt, sampleResponse, keyPhrases
- [ ] Themes assigned: mock_04=Essen, mock_05=Termine, mock_06=Arbeit, mock_07=Freizeit
- [ ] `_stub: true` removed, `version` set to `1`

### Structural Validity
- [ ] All question IDs follow pattern `A2_mXX_SN_qN` (e.g. `A2_m04_L1_q1`)
- [ ] No duplicate IDs within or across mocks 04-07
- [ ] Every MCQ `correctAnswer` matches one of its `options` prefixes (a/b/c)
- [ ] Every question has non-empty `explanation` field
- [ ] Listening questions include `audioTimestamp` (integer)
- [ ] `audioFile` paths follow `assets/audio/A2/mockXX/listening_partN.mp3`
- [ ] Writing tasks include `prompt`, `sampleResponse`, `evaluationCriteria`
- [ ] Speaking parts include `type`, `instructions`, `instructionsTranslation`
- [ ] Valid JSON — `npx jsonlint` passes on all 4 files

### CEFR A2 Compliance
- [ ] Vocabulary and grammar stay within CEFR A2 range
- [ ] Scenarios reflect everyday A2 topics (food, appointments, work, leisure)
- [ ] Question difficulty comparable to mocks 01-03 (quality bar)

### Quality Gates
- [ ] exam-tester agent validates structure against `src/types/exam.ts` MockExam interface
- [ ] `npx tsc --noEmit` passes (no type regressions)
- [ ] Manual spot-check: 2 questions per mock for plausibility of correct answers
