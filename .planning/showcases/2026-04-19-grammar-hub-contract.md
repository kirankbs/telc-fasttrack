# Grammar Hub Contract — Issue #19
## feat(web): grammar hub — topic list + exercise player

**Date:** 2026-04-19  
**Stack:** Next.js 15 App Router · React 19 · Tailwind CSS 4 · `@telc/types`  
**Scope:** `/grammar` page — A1 only (12 topics), session-scoped exercise state (no persistence)

---

## Data Contract

Grammar source: `apps/mobile/src/data/grammar/A1_grammar.json` (12 topics)

Each topic object (`GrammarTopic` from `@telc/types`):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `number` | yes | Unique per topic |
| `level` | `Level` | yes | Always `"A1"` for now |
| `topic` | `string` | yes | German grammar topic name (e.g. "Präsens — regelmäßige Verben") |
| `explanation` | `string` | yes | 1-3 sentence English explanation |
| `examples` | `string[]` | yes | 5-6 German example sentences per topic |
| `exercises` | `GrammarExercise[]` | optional | 4-5 exercises per topic (52 total across 12 topics) |
| `orderIndex` | `number` | yes | 1-12, determines display order |

Each exercise object (`GrammarExercise`):
| Field | Type | Notes |
|-------|------|-------|
| `type` | `'fill_blank' \| 'mcq' \| 'reorder'` | All three types present in A1 data |
| `prompt` | `string` | The question — includes blank marker `___` for fill_blank |
| `correctAnswer` | `string` | Exact expected answer |
| `explanation` | `string` | Shown after answer is checked |

Exercise type distribution: `fill_blank` (most common), `mcq`, `reorder` (word-ordering, typed as free text).

---

## Routes

| Route | Purpose |
|-------|---------|
| `/grammar` | Level selector grid (exists — stub) → topic list for selected level |
| `/grammar/[topicId]` | Topic detail: explanation + examples + exercise player |

Implementation note: the topic list can be rendered inline on `/grammar` (replacing the stub grid with the topic list when A1 is selected) or as a separate route — implementer's choice. The topic detail page at `/grammar/[topicId]` is required as a separate route.

---

## Acceptance Criteria

### Happy Path

#### Level selector → topic list (`/grammar`)
- [ ] Existing level cards remain; clicking "Browse Topics" on the A1 card reveals the topic list below the grid (or navigates to a list view — implementer's choice)
- [ ] Levels other than A1 remain disabled with "Coming Soon" label
- [ ] Topic list shows all 12 topics sorted by `orderIndex`
- [ ] Each topic card displays: order number, topic name, example count (e.g. "6 Beispiele"), exercise count (e.g. "5 Übungen")
- [ ] Clicking a topic card navigates to `/grammar/{orderIndex}`

#### Topic detail (`/grammar/[topicId]`)
- [ ] Page displays the topic name as the heading
- [ ] Explanation section renders the full `explanation` text in a readable card
- [ ] Examples section lists all `examples` as a bulleted/numbered list
- [ ] Back navigation returns to the topic list
- [ ] Topic-to-topic navigation (prev/next) is available — disabled at boundaries (topic 1 has no prev, topic 12 has no next)
- [ ] Topic counter shows position (e.g. "3 / 12")

#### Exercise player
- [ ] Exercise section appears below explanation and examples
- [ ] Exercises are presented one at a time with a counter (e.g. "Übung 2 von 5")
- [ ] **fill_blank**: renders a text input; user types the answer
- [ ] **mcq**: renders 3 tappable options; one is `correctAnswer`, two are distractors derived from other exercises in the same topic (fall back to generic distractors if fewer than 2 alternatives exist)
- [ ] **reorder**: renders a text input (user types the reordered sentence)
- [ ] "Check" button is disabled until the user has entered/selected an answer
- [ ] Clicking "Check" locks the input, compares the user's answer to `correctAnswer` (case-insensitive, trimmed), and shows inline feedback
- [ ] Correct feedback: green background, check icon, shows the correct answer + explanation
- [ ] Incorrect feedback: red background, X icon, shows the correct answer + explanation
- [ ] After checking, a "Next" button advances to the next exercise
- [ ] On the last exercise, the button reads "Show Results" (or equivalent)

#### Summary / completion
- [ ] After all exercises are checked, a completion card replaces the exercise player
- [ ] Completion card shows: score as fraction and percentage (e.g. "4 / 5 richtig (80%)")
- [ ] "Next Topic" button navigates to the next topic (hidden on topic 12)
- [ ] "Back to Overview" button returns to the topic list

---

### Empty States

- [ ] If grammar data fails to load or the JSON is missing for a level, show a "No grammar topics available" message with a back button — no crash, no blank screen
- [ ] If a topic has no `exercises` (empty array or undefined), show explanation and examples only — hide the exercise section entirely, no "0 Übungen" label in that case
- [ ] If `topicId` in the URL doesn't match any topic's `orderIndex`, show "Topic not found" with a back link to `/grammar`
- [ ] Levels without grammar data (A2-C1) show "Coming Soon" on the level card — clicking does nothing

---

### Edge Cases

#### Scoring
- [ ] All correct (e.g. 5/5): completion card shows 100% — no special "perfect" treatment required, but the score must display correctly
- [ ] All wrong (e.g. 0/5): completion card shows 0% — the card still renders normally, no error state
- [ ] Mixed results: score math is correct — `correctCount / totalExercises`, rounded to nearest integer for percentage

#### Answer matching
- [ ] Comparison is case-insensitive: "Bin" matches "bin"
- [ ] Leading/trailing whitespace is trimmed before comparison
- [ ] MCQ selection: exact string match against `correctAnswer` (already handled by option identity)

#### Navigation
- [ ] Refreshing `/grammar/[topicId]` reloads the topic fresh — exercises reset to unanswered (no persistence)
- [ ] Browser back from topic detail returns to topic list, not to a broken state
- [ ] Direct URL entry (e.g. `/grammar/7`) loads topic 7 correctly
- [ ] `/grammar/0` and `/grammar/13` (out of range) show the "Topic not found" state

#### Exercise state
- [ ] Exercise answers are session-scoped React state — navigating away and back resets progress
- [ ] User cannot skip ahead to exercise 3 without checking exercise 2 first (sequential progression)
- [ ] User cannot re-answer a checked exercise (input is locked after check)

---

### Accessibility

- [ ] All interactive elements (topic cards, buttons, MCQ options, text inputs) are keyboard-navigable
- [ ] Text inputs have visible focus rings
- [ ] MCQ options have a visible selected state distinguishable from unselected (not color-only — border weight or icon change)
- [ ] Feedback colors (green/red) are supplemented by icons (check/X) so meaning is not conveyed by color alone
- [ ] Topic cards and buttons have adequate touch/click targets (minimum 44px)
- [ ] Page structure uses semantic headings: h1 for topic name, h2 for sections (Explanation, Examples, Exercises)
- [ ] Color contrast meets WCAG AA for all text on all background states (surface, success-light, error-light)

---

### Quality Gates

- [ ] `npx tsc --noEmit` passes with zero errors (web app)
- [ ] No hardcoded hex color values — all colors from theme/Tailwind config
- [ ] Types imported from `@telc/types` (not redefined locally)
- [ ] Grammar JSON imported once, not duplicated into `apps/web/`
- [ ] All exercise types handled (`fill_blank`, `mcq`, `reorder`) — no silent fallthrough for unknown types
- [ ] Page renders with JavaScript disabled up to the static content (explanation, examples) — exercises require JS, which is fine
- [ ] No layout shift on topic load — skeleton or instant render
- [ ] Mobile responsive: topic list stacks single-column on small screens, grid on larger

---

## Out of Scope

- Progress persistence (localStorage, DB) — future issue
- A2-C1 grammar content
- Exercise randomization or adaptive ordering
- Audio playback for examples
- Spaced repetition for grammar exercises
