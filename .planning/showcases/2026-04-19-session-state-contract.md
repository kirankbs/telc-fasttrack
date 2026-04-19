# Exam Session State Persistence Contract — Issue #15
## feat(web): exam session state persistence across sections

**Date:** 2026-04-12  
**Scope:** `apps/web/src/components/exam/`, `apps/web/src/app/exam/[mockId]/results/page.tsx`, `apps/web/src/lib/`

---

## Data Shape

sessionStorage key: `exam_session_{mockId}`

```typescript
interface ExamSessionState {
  mockId: string;
  level: Level;
  startedAt: string; // ISO 8601
  sections: {
    listening?: SectionResult;
    reading?: SectionResult;
    writing?: SectionResult;
    speaking?: SectionResult;
  };
}

interface SectionResult {
  answers: Record<string, string>;       // questionId → userAnswer (listening, reading)
  taskAnswers?: Record<number, Record<string, string>>; // taskNumber → field → value (writing)
  score: SectionScore;                   // from @telc/core
  submittedAt: string;                   // ISO 8601
  selfAssessment?: number;              // 0-100, writing and speaking only
}
```

---

## Acceptance Criteria

### Happy Path — Full Exam Flow

- [ ] Starting "Vollständige Prüfung starten" from the mock detail page creates an `ExamSessionState` entry in sessionStorage keyed by `exam_session_{mockId}`
- [ ] When a section is submitted (phase → `submitted`), its answers and computed `SectionScore` are persisted to the session entry
- [ ] The "Weiter: Lesen / Schreiben / Sprechen" links on each section's results screen navigate to the next section; on arrival the new section loads normally (intro → active → submitted)
- [ ] After submitting Sprechen (the final section), the user is directed to `/exam/[mockId]/results`
- [ ] The results page reads the session from sessionStorage and displays a combined scorecard using `calculateExamScore` from `@telc/core`
- [ ] The results page shows: per-section score (earned/max, percentage), written aggregate (Hören + Lesen + Schreiben), oral aggregate (Sprechen), overall score, and pass/fail verdict
- [ ] Pass/fail is determined by the telc rule: >= 60% in BOTH written AND oral aggregates

### Writing & Speaking — Self-Assessment

- [ ] Writing and Speaking sections show a self-assessment prompt after submission: a slider or point input where the user estimates their own score
- [ ] If the user provides a self-assessment, it populates the `selfAssessment` field and is used as the `points` value when building `QuestionResponse[]` for `calculateExamScore`
- [ ] If the user skips self-assessment, writing and speaking scores display as "Prüferbewertung ausstehend" (awaiting examiner grading) on the results page, and their points default to 0 for the combined calculation with a visual indicator that the score is provisional

### Empty State — No Sections Completed

- [ ] Navigating directly to `/exam/[mockId]/results` with no session in sessionStorage shows an empty state: "Keine Prüfungsdaten vorhanden" with a link back to the mock detail page
- [ ] Navigating directly to `/exam/[mockId]/results` with a session that has zero completed sections shows the same empty state

### Partial Completion

- [ ] If only some sections are completed (e.g., Hören + Lesen submitted, Schreiben and Sprechen not started), the results page shows scores for completed sections and "Nicht bearbeitet" for missing ones
- [ ] The overall pass/fail calculation treats unsubmitted sections as 0 points earned, and the UI marks the result as "Unvollständig" rather than a definitive pass/fail
- [ ] The mock detail page (`/exam/[mockId]`) shows a checkmark or completion indicator next to sections that have saved results in the session

### Browser Refresh Mid-Exam

- [ ] Refreshing the browser during an active section (phase = `active`) does NOT restore in-progress answers — only submitted section results persist (sessionStorage stores results on submit, not live keystrokes)
- [ ] Refreshing after submitting a section and before starting the next: the submitted section's results remain in sessionStorage; navigating to the next section starts fresh
- [ ] Refreshing the results page after all sections are submitted: results render correctly from sessionStorage

### Multiple Exams / Isolation

- [ ] Starting mock_02 while mock_01 has a session in progress creates a separate `exam_session_a1-mock-02` entry — mock_01 session is untouched
- [ ] The results page only reads from the session matching its own `mockId` URL param
- [ ] Completing and viewing results for mock_01 does not affect or display data from mock_02

### Session Lifecycle

- [ ] A "Prüfung neu starten" (restart exam) button on the results page clears the session from sessionStorage for that mockId and redirects to the mock detail page
- [ ] Sessions are not cleared automatically on navigation away — the user can leave and return to the results page
- [ ] No data is written to localStorage or cookies — sessionStorage only (cleared when tab closes)

### Section Navigation from Mock Detail

- [ ] On the mock detail page, if a section already has results in the session, the button changes from "Starten" to "Wiederholen" (retake) — retaking overwrites that section's result in the session
- [ ] A "Ergebnisse anzeigen" (view results) link appears on the mock detail page when at least one section has been submitted

### Regression

- [ ] Completing a single section in isolation (navigating directly to `/exam/[mockId]/listening` without starting a full exam) still works — per-section results display inline as before
- [ ] The existing per-section results UI (score card, question review) remains unchanged
- [ ] All existing exam E2E tests pass without modification

### E2E / Test

- [ ] Playwright test: full exam flow — complete all 4 sections sequentially, verify results page shows combined scores and correct pass/fail
- [ ] Playwright test: partial completion — complete 2 sections, navigate to results, verify incomplete state renders
- [ ] Playwright test: browser refresh — submit listening, refresh, verify listening results persist, start reading normally
- [ ] Unit test: `ExamSessionState` serialization round-trip — write to sessionStorage, read back, verify all fields intact
