# ListeningExam true_false Fix Contract — Issue #13
## fix(web): ListeningExam renders no answer UI for true_false question type

**Date:** 2026-04-12  
**Scope:** `apps/web/src/components/exam/ListeningExam.tsx`

---

## Acceptance Criteria

### Happy Path
- [ ] When a listening part has `type: true_false`, two radio buttons labelled "richtig" and "falsch" render for each question — same pattern as `ReadingExam`
- [ ] Selecting "richtig" or "falsch" records the answer in state; the selected button gets `border-brand-primary bg-brand-primary-surface`, the other reverts to neutral
- [ ] Answers from true_false questions are included in `allAnswered` computation and in the `answers` map passed to `calculateSectionScore`
- [ ] On the results screen, true_false answers display correctly: user's answer, correct answer (when wrong), and explanation

### Mixed Question Types
- [ ] A listening part containing MCQ questions still renders `q.options` as radio labels (existing behaviour unchanged)
- [ ] If a mock has Part 1 as MCQ and Part 2 as true_false (e.g. A1 mock_01), switching between part tabs renders the correct UI for each type
- [ ] `allAnswered` spans both MCQ and true_false parts — "Abgeben" stays disabled until every question across all parts is answered

### Regression
- [ ] All existing MCQ-only listening exams render and submit identically to before the change
- [ ] Scoring output for MCQ-only mocks is unchanged

### E2E / Test
- [ ] Add or update a Playwright test covering a mock with true_false listening questions: navigates to part, selects richtig/falsch, submits, verifies results screen shows score
- [ ] Existing listening exam E2E tests still pass
