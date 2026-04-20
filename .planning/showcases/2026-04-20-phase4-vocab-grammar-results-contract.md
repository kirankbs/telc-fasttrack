# Phase 4 — Flashcards + Grammar + Results Sequencing

**Issue:** #53
**Branch:** `ui-upgrade-phase4-vocab-grammar-results`
**Blocked by:** #50 (Phase 1 tokens)
**Date:** 2026-04-20

## Intent

Redesign flashcards for low-pressure practice (equal-weight buttons, reduced-motion fallback, honest session-end stats), grammar topic as editorial content, and exam results with kinder sequencing (absolute score first, not pass/fail hero).

## Spec References

- `.planning/design-system/screens.md` §Screen 5 (Results), §Screen 6 (Flashcard), §Screen 7 (Grammar)
- `.planning/design-system/stitch-prompts.md` Prompts 4 and 5
- `.planning/design-system/tokens.md`

## Acceptance Criteria

### Happy Path — Flashcard (`/vocab/**`)

- [ ] Front face:
  - Topic tag pill at top, body-sm caption, `--color-surface-container` bg
  - German word centered, h1 or display size, DM Sans SemiBold
  - Article inline with noun (e.g., "das Frühstück") — not separate
  - Flip hint: "Karte umdrehen" in caption, text-tertiary — **hidden after first flip in session** (state: `hasFlippedOnce` at session level)
- [ ] Back face:
  - English translation, h2 centered
  - Article + gender: "das (neuter)" body-sm text-secondary
  - Plural line if exists: "Plural: die …" body-sm text-secondary
  - Example sentence in italic, `--color-surface-container` bg, `rounded-lg`, max-width 340px centered
- [ ] Two buttons BELOW the card (not inside), equal visual weight:
  - **"Noch lernen"** — outline button, 1px border, text-secondary, 48px min-height, `rounded-md`
  - **"Gewusst"** — filled `--color-brand-600`, white text, 48px min-height, `rounded-md`
  - **No red/shame button. No confetti on "Gewusst".**
- [ ] Session progress indicator: "Karte N von M" in caption, top-right (NOT on card)
- [ ] Flip animation: 3D rotate 500ms spring easing
- [ ] **Reduced motion (`prefers-reduced-motion: reduce`):** flip collapses to 150ms cross-fade between front/back faces

### Happy Path — Session End Screen

- [ ] After last card, show full-page centered summary:
  - Checkmark icon, 56px, circle outline in `--color-brand-600`
  - Heading: "Einheit abgeschlossen" in h2
  - Three stat rows stacked:
    - "N Wörter geübt" (total reviewed)
    - "N sicher" (interval > 7 days) — word "sicher" colored `--color-success`
    - "N zum Wiederholen" (requeued)
  - Primary CTA "Weiter lernen" — filled brand.600, 52px
  - Secondary link "Zur Vokabelliste" — text only, text-secondary
- [ ] **No confetti. No percentage score. No comparison to other users.**

### Happy Path — Grammar Topic (`/grammar/[topicId]`)

- [ ] Breadcrumb: "Grammatik → {Level} → {Topic}" with back arrow, 13px text-secondary
- [ ] Content column max-width 660px centered, padding 40px top / 24px sides
- [ ] Topic title h1 DM Sans SemiBold
- [ ] Subtitle: "{Level} · ~N Minuten" in caption text-tertiary
- [ ] Explanation: body (16px DM Sans Regular, line-height 1.65)
- [ ] Example block:
  - Left border 4px `--color-brand-200`
  - Background `--color-brand-50`
  - `rounded-r-lg`
  - Padding 16px 20px
  - German part in DM Sans Medium, dash + English in regular text-secondary
- [ ] Divider (1px `--color-border`) separates explanation from exercises
- [ ] Exercise section inline on same page:
  - Progress label "Aufgabe N von M" caption text-tertiary + 3px progress bar
  - Question in 18px DM Sans Medium
  - Short-answer options (e.g., articles) as pill buttons in a row, min-width 80px, 44px height
  - Selected: `--color-surface-container` bg + 1.5px brand.600 border + brand.600 text
  - Correct (post-submit): `--color-pass-surface` + 1.5px `--color-pass` border + checkmark icon
  - Wrong (post-submit): `--color-fail-surface` + 1.5px `--color-fail` border + X icon — **correct option also highlighted**
  - "Nächste Aufgabe" button appears after answer; "Abschluss" on last

### Happy Path — Exam Results (`/exam/[mockId]/results`)

- [ ] Sequence (top to bottom):
  1. Header: "Übungstest N — Ergebnisse" in h1
  2. Score headline: "Du hast X von Y Punkten erreicht." in display/h1 — **absolute score leads, not verdict**
  3. Two aggregate cards side-by-side (Schriftlich + Mündlich), each with:
     - Section aggregate percentage
     - Threshold context: "60% Mindestpunktzahl — Du hast X% erreicht."
     - If failing: plus actionable recommendation ("Empfehlung: {section} üben.")
  4. Pass/fail as single line with dots: "Schriftlich: Bestanden • Mündlich: Nicht bestanden" — small dots, not hero box
  5. Per-section score breakdown (existing table/list structure)
  6. **Recommendations section (NEW):**
     - If any aggregate fails: at least 1 specific actionable recommendation per failing section ("Hören Teil 2 (Ankündigungen) — 3 weitere Übungen empfohlen")
     - If all pass: single line "Gut gemacht — dieses Ergebnis reicht für die Prüfung. Mach weiter." — **once, not multiple times**
- [ ] **No large red hero box anywhere on the page. No "Nicht bestanden" as first visual element.**

### Non-Negotiable Ethical Rules

- [ ] Flashcard buttons are visually equal weight — no color-coded shame
- [ ] Results page leads with absolute score, never with fail verdict
- [ ] Session end shows 3 honest stats, no gamified flourish
- [ ] Reduced-motion respected on flashcard flip

### Quality Gates Required

- [ ] `pnpm typecheck && pnpm test && pnpm build` green
- [ ] Unit tests: flashcard flip states, session-end stats calculation
- [ ] Unit tests: results sequencing — assertion that "Nicht bestanden" is NOT the first text node
- [ ] E2E: complete a flashcard session (at least 3 cards), reach end screen
- [ ] E2E: complete a mock exam (submit dummy answers), verify results page structure
- [ ] compliance-guardian baseline
- [ ] language-checker on new German strings

## Non-Goals

- Dashboard, mocks list, exam runner (earlier phases)
- Vocabulary list redesign (only flashcard session)
- Grammar topic list redesign (only detail page)
- Mobile app

## Test Plan

- Start a flashcard session: verify hint disappears after first flip, buttons equal weight, reduced-motion fallback via devtools toggle
- Complete a session: verify 3-stat end screen
- Open `/grammar/A1/topic-slug`: verify editorial layout, example block styling
- Complete a mock exam with failing score (seed test data): verify absolute score leads, no red hero box, recommendations appear
- Run same with passing score: verify single "Gut gemacht" line
