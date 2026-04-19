# E2E Tests Contract — Issue #10
## test(e2e): Playwright tests for exam-taking UI — all 4 sections

**Date:** 2026-04-13
**Depends on:** #9 (playwright.yml Vercel preview URL fix) — do not start until #9 is merged
**Stack:** Next.js 15 App Router · Playwright · Tailwind CSS 4
**Target mock:** `A1_mock_01` — full content, all 4 sections present
**Test location:** `apps/web/e2e/` (confirm against `playwright.config.ts` before creating)

---

## Selector reference

| Purpose | Selector |
|---|---|
| Timer display | `[data-testid="exam-timer"]` |
| Section start button | `[data-testid="section-start-btn"]` |
| Submit button | `[data-testid="submit-btn"]` |
| Next-section navigation link | `[data-testid="next-section-link"]` |
| Part tab N | `[data-testid="part-tab-{n}"]` e.g. `part-tab-1`, `part-tab-2` |
| Question answer option | `[data-testid="question-option-{questionId}-{value}"]` e.g. `question-option-A1_m01_L1_q1-a` |
| Sample answer toggle | `[data-testid="sample-answer-toggle"]` |
| Section nav — previous | `[data-testid="section-nav-prev"]` |
| Section nav — next | `[data-testid="section-nav-next"]` |

---

## Scenario 1 — Section intro → active → submit flow (all 4 sections)

Test file: `exam-section-flow.spec.ts`

For each of the four section routes of `A1_mock_01`:

### 1a — Hören (`/exam/A1_mock_01/listening`)

- [ ] Page loads; intro screen is visible (`[data-testid="section-start-btn"]` exists and is enabled)
- [ ] Intro screen text contains "Hören" and "20" (section time in minutes)
- [ ] `[data-testid="exam-timer"]` is **not** visible on the intro screen (timer starts only after "Abschnitt starten")
- [ ] Click `[data-testid="section-start-btn"]`; timer becomes visible showing `20:00` (or counts from 1200s)
- [ ] `[data-testid="submit-btn"]` is `disabled` immediately after starting (no answers given)
- [ ] Answer all 11 questions across 3 parts (Part 1: `A1_m01_L1_q1`–`q3`; Part 2: `A1_m01_L2_q1`–`q5`; Part 3: `A1_m01_L3_q1`–`q3`) using `[data-testid="question-option-{id}-{value}"]`
- [ ] `[data-testid="submit-btn"]` becomes enabled after all questions answered
- [ ] Click `[data-testid="submit-btn"]`; results screen renders showing earned/total score (e.g. "11/11" format)
- [ ] Results screen contains `[data-testid="next-section-link"]` pointing to `/exam/A1_mock_01/reading`

### 1b — Lesen (`/exam/A1_mock_01/reading`)

- [ ] Intro screen shows "Lesen" and "25" (25 minutes); `[data-testid="section-start-btn"]` enabled
- [ ] Timer starts at `25:00` after clicking start
- [ ] `[data-testid="submit-btn"]` disabled until all 15 questions answered
- [ ] After answering all questions and submitting, results screen renders
- [ ] `[data-testid="next-section-link"]` href is `/exam/A1_mock_01/writing`

### 1c — Schreiben (`/exam/A1_mock_01/writing`)

- [ ] Intro screen shows "Schreiben" and "20"; `[data-testid="section-start-btn"]` enabled
- [ ] `[data-testid="submit-btn"]` is **always enabled** (writing is self-assessed, not blocked by answer state)
- [ ] After clicking submit, results/review screen renders
- [ ] `[data-testid="next-section-link"]` href is `/exam/A1_mock_01/speaking`

### 1d — Sprechen (`/exam/A1_mock_01/speaking`)

- [ ] Intro screen shows "Sprechen" and "15"; prep time line is **absent** (A1 `prepTimeMinutes = 0`)
- [ ] `[data-testid="section-start-btn"]` enabled; clicking it transitions to active view with 3 part cards
- [ ] After completing final part, completion screen renders with "Zur Prüfungsübersicht" link to `/exam/A1_mock_01`

---

## Scenario 2 — Timer warning threshold styling

Test file: `exam-timer.spec.ts`

- [ ] Navigate to `/exam/A1_mock_01/listening` and click `[data-testid="section-start-btn"]`
- [ ] `[data-testid="exam-timer"]` does **not** have class `bg-warning-light` when remaining > 300s
- [ ] Use `page.clock.setFixedTime` or `page.clock.fastForward` to advance time until remaining = 301s — timer still in neutral state
- [ ] Advance to remaining = 300s — `[data-testid="exam-timer"]` gains class `bg-warning-light` and `text-warning`; loses neutral classes
- [ ] Advance to remaining = 0s — `[data-testid="exam-timer"]` gains class `bg-error-light` and `text-error`; inner text contains "Time up"
- [ ] On expiry, section auto-submits: results screen becomes visible without the user clicking `[data-testid="submit-btn"]`

---

## Scenario 3 — Listening MCQ answer selection and part tab progress

Test file: `exam-listening.spec.ts`

- [ ] Navigate to `/exam/A1_mock_01/listening`; click `[data-testid="section-start-btn"]`
- [ ] `[data-testid="part-tab-1"]` is active (has `bg-brand-primary` class); tabs 2 and 3 are in neutral state
- [ ] `[data-testid="part-tab-1"]` does **not** have class `bg-success-light` (Part 1 not yet complete)
- [ ] Click `[data-testid="question-option-A1_m01_L1_q1-a"]`; the option element has classes `border-brand-primary` and `bg-brand-primary-surface`; other options for the same question do not
- [ ] Click a different option for the same question (`-b`); the `-b` option gains selected classes; `-a` option loses them
- [ ] Answer all 3 questions in Part 1; `[data-testid="part-tab-1"]` gains class `bg-success-light` and `text-success`
- [ ] Click `[data-testid="section-nav-next"]` or `[data-testid="part-tab-2"]` to advance to Part 2
- [ ] Navigate back to Part 1 via `[data-testid="part-tab-1"]`; question `A1_m01_L1_q1` answer is still marked as selected (preserved across part switches)
- [ ] `[data-testid="section-nav-prev"]` is disabled (has `disabled` attribute or `opacity-40` class) when on Part 1

---

## Scenario 4 — Reading question type rendering

Test file: `exam-reading.spec.ts`

- [ ] Navigate to `/exam/A1_mock_01/reading`; click `[data-testid="section-start-btn"]`
- [ ] **Part 1 (true/false):** `[data-testid="question-option-A1_m01_R1_q1-richtig"]` and `[data-testid="question-option-A1_m01_R1_q1-falsch"]` both exist and are clickable; clicking one marks it selected, clicking the other switches selection
- [ ] **Part 2 (matching):** navigate to `[data-testid="part-tab-2"]`; matching source tiles for `A1_m01_R2_ad_a` through `A1_m01_R2_ad_h` are visible (labels "a" through "h"); clicking a tile marks `[data-testid="question-option-A1_m01_R2_q1-{label}"]` as selected
- [ ] **Part 3 (true/false):** navigate to `[data-testid="part-tab-3"]`; same richtig/falsch pattern as Part 1
- [ ] `[data-testid="submit-btn"]` remains disabled until all 15 questions across Parts 1–3 have answers

---

## Scenario 5 — Writing form-fill inputs, free-text word count, Musterlösung toggle

Test file: `exam-writing.spec.ts`

- [ ] Navigate to `/exam/A1_mock_01/writing`; click `[data-testid="section-start-btn"]`
- [ ] **Task 1 (form_fill):** 5 labeled text inputs are rendered; typing into the first input (`fill('Kiran')`) persists the value; field labels are visible
- [ ] **Task 2 (short_message):** a `<textarea>` is present; it is resizable (`resize-y` class or `resize` attribute)
- [ ] Typing 0 words into the textarea shows word count "0"; typing "Hallo Welt" shows "2"; typing "  Hallo   Welt  " shows "2" (whitespace-normalized)
- [ ] Word count updates on every keystroke without full page reload
- [ ] `[data-testid="sample-answer-toggle"]` exists for Task 2 before submission; clicking it reveals the sample answer text; clicking again hides it (toggle)
- [ ] `[data-testid="submit-btn"]` is enabled with zero content entered (writing is always submittable)
- [ ] After clicking `[data-testid="submit-btn"]`, `[data-testid="next-section-link"]` is visible and points to `/exam/A1_mock_01/speaking`

---

## Scenario 6 — Section navigation chain (full exam flow)

Test file: `exam-navigation.spec.ts`

- [ ] Starting from `/exam/A1_mock_01` (detail page), section cards for Hören, Lesen, Schreiben, Sprechen are visible
- [ ] Clicking the Hören start link navigates to `/exam/A1_mock_01/listening`
- [ ] Complete Hören (answer all 11 questions + submit); `[data-testid="next-section-link"]` href matches `/exam/A1_mock_01/reading`; clicking it navigates correctly (URL changes, Lesen intro screen renders)
- [ ] Complete Lesen (answer all 15 questions + submit); `[data-testid="next-section-link"]` href matches `/exam/A1_mock_01/writing`; clicking navigates to writing intro
- [ ] Complete Schreiben (click submit immediately); `[data-testid="next-section-link"]` href matches `/exam/A1_mock_01/speaking`; clicking navigates to speaking intro
- [ ] Complete Sprechen (navigate all 3 parts to completion); completion screen shows "Zur Prüfungsübersicht"; clicking it navigates to `/exam/A1_mock_01`
- [ ] Final URL is `/exam/A1_mock_01` — chain is complete without any broken links or 404s

---

## Dependency

Blocked on #9. The `playwright.yml` CI workflow constructs Vercel preview URLs incorrectly (static string vs. GitHub Deployments API). All 6 scenarios will fail in CI until #9 is merged.

Local `playwright test --headed` against `localhost:3000` can run independently of #9.

---

## Out of scope

- Audio playback (no browser audio in CI; mock the audio element)
- Timer clock manipulation for durations > 5 minutes (use `page.clock` to fast-forward, not real waits)
- A2/B1/B2/C1 section variants (A1 only per priority rule)
- Vitest unit tests (covered in issue #6 AC, not this issue)
