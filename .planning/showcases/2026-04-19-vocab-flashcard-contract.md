# Vocabulary Flashcard Session UI Contract — Issue #14
## feat(web): vocabulary flashcard session UI

**Date:** 2026-04-19  
**Stack:** Next.js 15 App Router · React 19 · Tailwind CSS 4 · `@telc/core` (SM-2)  
**Scope:** `/vocab` page — A1 only (650 words), session-scoped state (no persistence)

---

## Data Contract

Vocabulary source: `apps/mobile/src/data/vocabulary/A1_vocabulary.json`

Each word object has:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `number` | yes | Unique per word |
| `level` | `string` | yes | Always `"A1"` for now |
| `german` | `string` | yes | Includes article for nouns (e.g. `"der Name"`) |
| `english` | `string` | yes | Translation |
| `article` | `string \| null` | no | `der/die/das` for nouns, absent for others |
| `plural` | `string \| null` | no | 358 of 650 words have this |
| `exampleSentence` | `string` | yes | All 650 words have one |
| `topic` | `string` | yes | 18 distinct topics |
| `audioFile` | `string \| null` | no | Currently all `null` |
| `easeFactor` | `number` | yes | Default `2.5` (bundled default, ignore for session scope) |
| `intervalDays` | `number` | yes | Default `0` |
| `repetitions` | `number` | yes | Default `0` |
| `nextReviewDate` | `string \| null` | no | Ignore — session-scoped |
| `lastReviewedAt` | `string \| null` | no | Ignore — session-scoped |

SM-2 functions from `@telc/core`:
- `calculateNextReview(quality, easeFactor?, intervalDays?, repetitions?)` → `SM2Result`
- `getQualityLabel(quality)` → `'Again' | 'Hard' | 'Good' | 'Easy'`
- Quality scale: 0–5 integer

---

## Acceptance Criteria

### Happy Path

#### Level selector (existing `/vocab` page)
- [ ] Current level cards remain; "Start Review" button on the A1 card navigates to the flashcard session view
- [ ] Levels other than A1 remain disabled with "Coming Soon" label
- [ ] Session view can be implemented as inline state on `/vocab` (no new route required) or as a `/vocab/session?level=A1` route — implementer's choice

#### Session initialization
- [ ] Clicking "Start Review" loads the A1 vocabulary JSON and randomly selects 20 cards for the session
- [ ] Cards are shuffled — the order is not the same as the JSON file order
- [ ] Session state is held in React state (no localStorage, no SQLite, no persistence)
- [ ] Each session card tracks its own `easeFactor`, `intervalDays`, `repetitions` starting from defaults (`2.5`, `0`, `0`)

#### Progress bar
- [ ] A progress bar is visible throughout the session showing `currentCardIndex / totalCards` (e.g. "3 / 20")
- [ ] Progress bar fills proportionally as cards are graded
- [ ] Progress bar uses theme colors (no hardcoded hex)

#### Card display — front (German)
- [ ] Card shows the German word prominently (large text, centered)
- [ ] If the word has an `article`, it is displayed as part of the German word (already included in `german` field)
- [ ] Topic is shown as a subtle label (e.g. pill/chip) above or below the word
- [ ] A "Flip" button or tap/click on the card reveals the back

#### Card display — back (English + details)
- [ ] Card shows the English translation prominently
- [ ] `exampleSentence` is displayed below the translation in a visually distinct block
- [ ] If `plural` exists, it is shown (e.g. "Plural: die Namen")
- [ ] If `article` exists, article is shown with gender hint (der = masculine, die = feminine, das = neuter)
- [ ] The self-grade buttons (quality 0–5) are visible only on the back of the card

#### Self-grading (SM-2 quality 0–5)
- [ ] Six grade buttons are shown, or a simplified subset — at minimum: Again (0–1), Hard (2), Good (3–4), Easy (5)
- [ ] Each button shows the label from `getQualityLabel()` — the implementer may map 6 raw values to 4 buttons as long as the quality integer passed to `calculateNextReview` is correct
- [ ] Clicking a grade button calls `calculateNextReview(quality, card.easeFactor, card.intervalDays, card.repetitions)` and stores the `SM2Result` on the session card
- [ ] After grading, the session advances to the next card
- [ ] The graded card's result is recorded for the session summary

#### Session summary
- [ ] Shown after all 20 cards are graded
- [ ] Displays: total cards reviewed, breakdown by quality label (how many Again / Hard / Good / Easy)
- [ ] Displays average ease factor across the session (rounded to 2 decimal places)
- [ ] A "Back to Vocabulary" button returns to the level selector view
- [ ] A "New Session" button starts a fresh 20-card session with a new random selection

### Empty States

#### No vocabulary data for level
- [ ] If a level has no vocabulary JSON file (A2–C1 currently), the "Start Review" button remains disabled
- [ ] No crash or unhandled error if the JSON import fails or returns an empty array

#### Vocabulary file with < 20 words
- [ ] If the vocabulary file has fewer than 20 words, the session uses all available words (no crash, no padding)
- [ ] Progress bar adjusts to the actual card count

### Edge Cases

#### Session complete — all cards graded
- [ ] After the last card is graded, the session transitions directly to the summary screen
- [ ] The progress bar shows 20/20 (full) before transitioning
- [ ] No "Next" button appears after the last grade — summary auto-appears

#### Rapid grading
- [ ] Clicking a grade button multiple times before the next card renders does not double-grade or skip a card
- [ ] State updates are batched correctly (React 19 auto-batching is fine, but no race conditions)

#### Browser back/forward
- [ ] Pressing browser back during a session returns to the level selector (or previous page), not to the previous card
- [ ] The session is lost on back navigation — this is expected behavior (session-scoped, no persistence)

#### Card flip state reset
- [ ] Each new card starts on the front (German) side, even if the previous card was flipped to the back
- [ ] Flip animation (if any) does not persist across cards

### Quality Gates

#### Type safety
- [ ] Vocabulary word type is defined or imported — no `any` casts on the JSON data
- [ ] `calculateNextReview` is called with correct argument types (quality as `number`, not `string`)

#### Theme compliance
- [ ] All colors use theme tokens or Tailwind classes — zero hardcoded hex values
- [ ] Card styling is consistent with existing exam UI patterns (rounded corners, border, shadow)

#### Accessibility
- [ ] Grade buttons have visible labels (not icon-only)
- [ ] Card flip is keyboard-accessible (Enter or Space triggers flip)
- [ ] Progress bar has an `aria-valuenow` / `aria-valuemax` or equivalent ARIA attributes

#### Performance
- [ ] The full 650-word JSON is loaded once, not on every session start
- [ ] Random selection of 20 cards does not re-render the entire list

#### Tests
- [ ] At least one test covers session initialization (20 cards selected from 650)
- [ ] At least one test covers the SM-2 grading flow (grade a card, verify `calculateNextReview` is called with correct args)
- [ ] At least one test covers the summary screen (all cards graded, stats displayed)

---

## Out of Scope

- Persistence across sessions (localStorage, SQLite, or server)
- Audio playback (`audioFile` is currently `null` for all words)
- Topic-based filtering within a session
- A2–C1 vocabulary content
- Keyboard shortcuts beyond basic accessibility (flip, grade)
