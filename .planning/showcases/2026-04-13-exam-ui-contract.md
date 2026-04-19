# Exam-Taking UI Contract — Issue #6
## feat(web): exam-taking UI — all 4 sections (Hören, Lesen, Schreiben, Sprechen)

**Date:** 2026-04-13  
**Stack:** Next.js 15 App Router · React 19 · Tailwind CSS 4 · `@telc/core` · `@telc/types`  
**Scope:** A1 mocks 01–10, routes `/exam/[mockId]/listening|reading|writing|speaking`

---

## Acceptance Criteria

### Happy Path

#### Route resolution & content loading
- [ ] `parseMockId` correctly parses `A1_mock_01` through `A1_mock_10`; server page renders without error for all ten mocks
- [ ] `loadMockExam` reads from `apps/mobile/assets/content/A1/mock_NN.json` via `fs/promises`; `CONTENT_DIR` env override is respected
- [ ] `validateMockExam` is called before passing data to components; invalid JSON causes `notFound()`, not an unhandled exception
- [ ] Detail page (`/exam/[mockId]`) shows "Starten" links for all four sections when content exists; each link navigates to the correct section route

#### Common section flow (all four sections)
- [ ] Every section renders an **intro screen** before the timer starts: section title, icon, section time in minutes (20 / 25 / 20 / 15 for A1 Hören / Lesen / Schreiben / Sprechen), and a primary "Abschnitt starten" button
- [ ] Clicking "Abschnitt starten" transitions `phase` from `'intro'` → `'active'` and the `ExamTimer` begins counting down from `SECTION_DURATIONS[level][section]`
- [ ] `ExamTimer` displays `MM:SS` using `formatTime` from `@telc/core`; the display is monospace (`font-mono tabular-nums`)
- [ ] Timer background is neutral (`bg-surface-container text-timer-normal`) while `remaining > 5 * 60`
- [ ] Timer transitions to warning state (`bg-warning-light text-warning`) when `remaining <= 300` (5 minutes)
- [ ] Timer transitions to expired state (`bg-error-light text-error`, text "Time up") when `remaining <= 0`
- [ ] Timer expiry auto-submits the section (`phase` → `'submitted'`); the `onExpire` callback must use a `useRef` to avoid the stale-closure bug noted in the issue
- [ ] A results / completion screen is shown after submission in all four sections

#### Hören (ListeningExam)
- [ ] All parts are shown as tab buttons ("Teil 1", "Teil 2", …); active part tab has `bg-brand-primary text-white`, completed parts have `bg-success-light text-success`, unstarted parts have a neutral border style
- [ ] Each part shows: German instructions, optional English translation, audio placeholder block displaying `audioFile` filename and `playCount`
- [ ] MCQ options are rendered as radio `<label>` elements; selected option gets `border-brand-primary bg-brand-primary-surface`; unselected options revert on a different selection
- [ ] "Zurück" button is `disabled` (opacity-40) when on the first part; "Nächster Teil" advances to the next part
- [ ] "Abgeben" button appears only on the last part; it is `disabled` (`opacity-50`) until every question across all parts has a recorded answer (`allAnswered`)
- [ ] `allAnswered` is computed with `useMemo` (not inline on every render)
- [ ] On submit, `calculateSectionScore(answers, section)` is called; results screen shows `earned/max`, percentage rounded to integer, and pass/fail label ("Bestanden" / "Nicht bestanden")
- [ ] Pass verdict uses `border-pass bg-pass-light`; fail verdict uses `border-fail bg-fail-light` (no hardcoded hex values)
- [ ] Per-question result rows show: question text, user's answer, correct answer (when wrong), and `explanation` (when wrong and non-empty)
- [ ] Results screen has "Zurück zur Übersicht" link (→ `/exam?level=A1`) and "Weiter: Lesen" link (→ `/exam/[mockId]/reading`)

#### Lesen (ReadingExam)
- [ ] All three question types render correctly: `true_false` shows "richtig"/"falsch" radio pair; `matching` shows `matchingSources` label chips; `mcq` shows full option list with answer extracted via `opt.split(')')[0].trim()`
- [ ] Non-ad texts (`type !== 'ad'`) render as reading passages with source attribution; ad texts (`type === 'ad'`) render as a 2-column grid of labeled tiles using alphabetic prefix (a, b, c…)
- [ ] Part completion tabs follow the same styling rules as Hören (active / done / unstarted)
- [ ] `allAnswered` uses `useMemo`; "Abgeben" is disabled until all questions answered
- [ ] Results screen shows per-question rows with correct/incorrect indicators and explanation; next link goes to `/exam/[mockId]/writing`

#### Schreiben (WritingExam)
- [ ] `form_fill` tasks render each `FormField` as a labeled `<input type="text">` with optional `hint` as placeholder; focus ring uses `focus:border-brand-primary focus:ring-brand-primary`
- [ ] Free-text tasks (`short_message`, `letter`, `essay`) render a resizable `<textarea>` (rows=8, `resize-y`)
- [ ] Live word count below the textarea is computed with `useMemo` using `split(/\s+/).filter(Boolean).length`; updates on each keystroke without O(n) recalculation per render cycle
- [ ] Sample answer (`task.sampleAnswer`) is available via a `<details>` / `<summary>` disclosure before submission; summary text is "Musterlösung anzeigen"
- [ ] Submit button ("Aufgaben abgeben") is always enabled (writing is self-assessed, not auto-scored)
- [ ] Results screen: writing tasks are not auto-scored; a human-review notice is shown; for `form_fill` tasks, each field shows the user's value alongside a ✓/✗ and the `correctAnswer`; for free-text tasks the user's prose is shown verbatim; sample answers appear in a `bg-success-light` block; scoring criteria table lists `criterion` and `maxPoints`
- [ ] Next link goes to `/exam/[mockId]/speaking`

#### Sprechen (SpeakingExam)
- [ ] A1 intro screen notes that there is **no** prep time (A1 `prepTimeMinutes = 0`); the prep time line is only shown when `prepTimeMinutes > 0`
- [ ] Each part renders: German instructions, optional English translation, prompt text in a `bg-surface-container` block, key phrases as pill chips, evaluation tips as a bulleted list
- [ ] "Musterlösung anzeigen" / "Musterlösung ausblenden" toggle per part; revealed sample uses `border-success bg-success-light`
- [ ] Part tab navigation (Aufgabe 1, 2, 3…) — "Zurück" disabled on first part; "Nächste Aufgabe" shown for non-final parts; "Abschnitt abschließen" on final part
- [ ] After completion, all parts are listed in a summary view with instructions and sample responses; "Zur Prüfungsübersicht" links to `/exam/[mockId]`; "Alle Übungstests" links to `/exam?level=A1`

---

### Empty States

- [ ] A section whose `parts` array is empty (zero parts) must not throw; it renders the intro screen correctly with "0 Teile · 0 Aufgaben" summary text and an enabled start button that leads to an empty active view, then immediately to results (score 0/0)
- [ ] A `WritingSection` with no tasks renders the intro screen and, when started, shows a blank active state with the submit button enabled
- [ ] A `SpeakingSection` with no parts renders the intro and skips the parts navigation; "Abschnitt abschließen" is the only action and goes directly to the completion screen
- [ ] Audio placeholder displays "Audiodatei nicht verfügbar" when `audioFile` is null or undefined
- [ ] A `FormField` with no `hint` renders the input with an empty placeholder (no crash)
- [ ] A `SpeakingPart` with empty `keyPhrases` or `evaluationTips` arrays renders without the section heading for those items

---

### Edge Cases

- [ ] Timer expiry on the intro screen (before the user clicks start) is a no-op — the timer is not running during `phase === 'intro'`
- [ ] Re-clicking a part tab that is already current does not reset answers for that part
- [ ] Changing a previously-answered MCQ option replaces the stored answer (does not accumulate or double-count)
- [ ] `parseMockId` returns `null` for any input that does not match `/^(A1|A2|B1|B2|C1)_mock_(\d+)$/`; the page calls `notFound()` and does not attempt a file read
- [ ] `mockId` with a valid level but mock number `0` (e.g. `A1_mock_00`) triggers `notFound()` if no file exists for that number (load returns null)
- [ ] Navigating directly to a section URL for a mock that has no content (e.g. `A2_mock_03`) returns a 404 page, not a broken UI
- [ ] `SECTION_DURATIONS` for a future level (A2, B1…) resolves the correct times from `@telc/core` without hardcoding; the timer on a hypothetical A2 reading exam would count from `50 * 60`, not 25
- [ ] Word count in WritingExam handles leading/trailing whitespace and multiple consecutive spaces correctly; "  hello   world  " reports 2 words
- [ ] Clicking "Vollständige Prüfung starten" on the detail page navigates to the listening section, not a dead link

---

### Error States

- [ ] If `loadMockExam` throws (e.g. malformed JSON that `JSON.parse` rejects), the catch block in `loadMockExam` returns `null`; the page calls `notFound()` rather than propagating a 500
- [ ] If `validateMockExam` (from `@telc/content`) returns `null` for a structurally invalid file, the page calls `notFound()`
- [ ] A missing `CONTENT_DIR` env var falls back to the default path (`path.resolve(cwd, '../mobile/assets/content')`); no runtime crash
- [ ] `ExamTimer` receiving `totalSeconds = 0` immediately shows "Time up" in expired state and does not start the interval
- [ ] `calculateSectionScore` receiving an empty `userAnswers` map returns `{ earned: 0, max: N, percentage: 0, passed: false }`; the results screen renders this without a divide-by-zero error
- [ ] `IntroCard` (or equivalent shared component) receiving `totalSeconds = 0` displays "0 Minuten" rather than crashing; this is a known edge case for sections with duration `0` in the spec (e.g. A2 writing)

---

### Quality Gates Required

- [ ] **No hardcoded hex values** — all colours come from Tailwind CSS 4 theme tokens defined in `@telc/config` (e.g. `text-brand-primary`, `bg-warning-light`, `border-success`); `border-[#e0e0e0]` must be replaced with a semantic token across all four components before merge
- [ ] **Single `Phase` type** — `type Phase = 'intro' | 'active' | 'submitted'` is exported once from a shared location (e.g. `@telc/types` or `apps/web/src/components/exam/types.ts`); the four local duplicate declarations are removed
- [ ] **Single `IntroCard` component** — extracted to `apps/web/src/components/exam/IntroCard.tsx` and imported by all four section components; no copy-pasted intro screens
- [ ] **Single `QuestionResultRow` component** — the per-question result row used by both Listening and Reading results views is extracted to `apps/web/src/components/exam/QuestionResultRow.tsx`
- [ ] **`useMemo` for derived state** — `allAnswered` in `ListeningExam` and `ReadingExam`, and word count in `WritingExam`, are wrapped in `useMemo`; raw computation on every render is not acceptable
- [ ] **`useRef` for `onExpire`** — `ExamTimer` captures the `onExpire` callback in a `useRef` inside the effect to prevent stale-closure calls after re-renders
- [ ] **`data-testid` attributes** — the following interactive elements carry testids: `data-testid="section-start-btn"`, `data-testid="exam-timer"`, `data-testid="submit-btn"`, `data-testid="next-section-link"`, `data-testid="question-option-{questionId}-{value}"`, `data-testid="sample-answer-toggle"`
- [ ] **TypeScript** — `pnpm typecheck` exits 0 with no errors; no `any` casts without an explanatory comment
- [ ] **Vitest unit tests** — minimum coverage required:
  - `ExamTimer`: timer counts down, warning state triggers at 300s, expiry fires callback exactly once, `useRef` prevents stale closure
  - `calculateSectionScore`: correct answers score 1 each, wrong score 0, case-insensitive match, empty answers map returns 0/N
  - `parseMockId`: valid IDs parse correctly, invalid IDs return null
  - `WritingExam` word count memoization: same input string does not trigger re-computation
- [ ] **Playwright E2E** — minimum scenarios:
  - A1 mock 01 Hören: intro → start → answer all questions → submit → results screen shows score
  - A1 mock 01 timer expiry: manipulate clock to expire; section auto-submits and results render
  - A1 mock 01 Lesen: true/false, matching, MCQ all selectable; submit disabled until all answered; results correct
  - A1 mock 01 Schreiben: form-fill inputs accept text; free-text word count updates; submit navigates to Sprechen
  - A1 mock 01 Sprechen: sample toggle shows/hides; part navigation works; completion screen shows all parts
  - Invalid mockId (`/exam/ZZZZ/listening`): 404 page rendered
- [ ] **CI green** — `pnpm typecheck && pnpm test && pnpm build` all pass on the PR branch with no skipped tests
- [ ] **"Bald" state** — section cards on the detail page show a disabled "Bald" chip (not a link) for any mock where `loadMockExam` returns `null`; verified for A2 mocks (no content yet)
- [ ] **Startup validation** — `loadMockExam` path resolution is tested at app startup or via a build-time check; a missing `../mobile/assets/content` directory logs a clear error rather than a silent 404 cascade
