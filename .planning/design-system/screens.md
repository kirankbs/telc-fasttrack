# Screen Design Direction — Fastrack Deutsch
> Designed: 2026-04-20

## Guiding Principle for All Screens

The current UI is architecturally correct — the right information is on the right screens. What it lacks is visual hierarchy, breathing room, and emotional calibration. The fixes are not structural rebuilds; they are precision interventions. Do not redesign for the sake of redesign — fix what is actually wrong.

The competitor to steal from most aggressively: **Readwise Reader**. Not because the products are similar, but because Readwise has solved the same UX problem: making a serious tool feel calm and trustworthy without being cold. Their use of generous padding, a muted surface palette, and typographic hierarchy over decorative elements is the exact register Fastrack Deutsch needs.

Secondary reference: **Linear**. Task states, density vs. breathing room, how they handle "nothing here yet" empty states with dignity rather than cartoon illustrations.

---

## Screen 1: Dashboard

### Current State Assessment

The dashboard is a 2-column grid with a readiness gauge SVG ring + a mocks counter card, then quick actions, then stats grid, then recent results. The information is correct. The problems:

1. The readiness gauge shows a percentage number (e.g., "73%") inside the ring. Per the design principles spec, we do not show a percentage for readiness — use the named stage only. The number violates the principle and invites over-interpretation.
2. The 4-card stats grid (Übungstests / Sektionen / Durchschnitt / Lernzeit) is flat and uniform. All four cards have the same visual weight. Nothing tells the user which number to care about.
3. "Weiter lernen" and "Neuen Test starten" quick action buttons are buried below the stats grid. The primary action should be the first interactive thing after the level selector.
4. The level tab pills use the CEFR color as background when active. With the current #4caf50 for A1, white text fails AA. Fixed by new level token colors.

### Layout Shift: Current → Proposed

**Current:** level pills / [readiness ring | mock counter] / quick actions / stats grid / recent results

**Proposed:** level pills / hero row / stats row / recent results

**Hero row (replaces readiness + mock counter):**
Full-width card, two columns internally:
- Left: readiness stage display — NOT a ring, NOT a percentage. A named stage ("Building foundation") in h2 size, using Instrument Serif if adopted, in the readiness semantic color. Below it: a single-sentence contextual nudge ("Complete 2 more mock exams to reach the next stage."). Below that: the primary CTA button ("Continue: Übungstest 3" or "Start your first exam" if nothing started).
- Right: a horizontal 4-segment stage indicator (the current 4 dots in ReadinessGauge.tsx is conceptually right but visually weak — make it 4 named stages as a horizontal track with the current stage highlighted, like a stepper but not clickable).
- Background of this card: `semantic.surface` (white) with a left-side accent bar in the current level color (4px wide, full height of card, `border-radius: 0 lg lg 0`).

This replaces both the ring component and the counter card. The ring SVG can be removed entirely.

**Stats row (replaces the uniform 4-card grid):**
3 cards, not 4. Remove "Sektionen bearbeitet" — it is a vanity metric that means nothing to the user. Keep:
1. Mock exams: "3 / 10 complete" — with a linear progress bar inside the card, not just the fraction. Bar fills to the level color.
2. Average score: "74%" — but only show this if at least 2 mock exams are complete. If 0-1, replace with "Not enough data yet."
3. Study time: "4h 20min" — frame as "practiced" not "estimated." The word "geschätzt" (estimated) in the current UI undermines confidence.

**Primary CTA position:** inside the hero row card (described above). This is the most important interactive element on the page. It should not be below the fold.

**Recent results:** keep as-is structurally. Minor update: each result row should show the written% and oral% separately, with a small pass/fail dot, not just the aggregate. This mirrors the telc scoring reality (both must pass).

### Key Components to Add

- Stage track component (4 labelled stages, current highlighted). Linear, horizontal, not circular.
- Progress bar inside the mocks card (thin, 4px height, fills to level color, rounded-full).
- Weekly activity mini-grid (7 squares, current week, filled = studied that day). Brand color for filled squares. Replace the fire streak entirely.

### Emotional Tone

Calm confidence. The user opens the dashboard between study sessions. They should feel: "I know where I am. I know what to do next." The readiness stage name + single-sentence nudge does this. A percentage ring with a number does not — it invites anxiety ("Am I at 73% or 75%? What does 73% even mean?").

---

## Screen 2: Mock Exams List

### Current State Assessment

Functional grid of exam cards with level tabs. Problems:

1. The card footer shows "Hören · Lesen · Schreiben · Sprechen" as static text on every card. This is noise — the user already knows the sections exist. Replace with progress state: "Not started" / "2 of 4 sections" / "Completed 78%".
2. The level info banner (border-l-4 panel) is decent but uses `${cfg.color}10` as background — a hex opacity hack. With the new token system, use `level.a1.surface` instead.
3. No visual differentiation between exams the user has attempted and ones they haven't. All 10 cards look identical.

### Layout Shift

Keep the grid. Change the card internals:

**Card at-rest (not started):**
- Level badge (pill, solid level color, white text) — updated to accessible hex
- "Übungstest 3" in h4 weight
- Subtitle: the mock title excerpt (keep current approach)
- Footer: "Not started" in text-tertiary — quiet, not prominent
- Chevron: keep, but only visible on hover (reduces visual noise at a glance)

**Card in-progress:**
- Thin progress track at the bottom edge of the card, fills proportionally to sections completed
- "2 of 4 sections" label replaces the static section list
- The card gets a subtle left accent bar in the level color (2px wide)

**Card completed:**
- Score badge in top-right: e.g., "82%" in a small pill. Color: pass/fail semantic.
- "Vollständig" text in the footer
- Card background: `semantic.surface-container` instead of white — a slight visual step back so completed exams recede and upcoming ones advance

**Empty state (level has no content yet):**
Reference Linear's empty states. A single centred sentence in text-secondary: "A2 mock exams are coming soon." No illustration, no emoji, no fake card skeleton.

### Emotional Tone

Energized readiness. The exams list is where users go to begin or resume practice. It should feel like opening a well-organised test bank, not scrolling a content catalogue. Density is appropriate here — this is a purposeful screen, not a discovery surface.

---

## Screen 3: Mock Exam Detail (Section Hub)

### Current State Assessment

The `/exam/[mockId]` page shows the level badge, exam title, pass threshold reminder, then a list of sections with their duration and a Start/Continue button. This is structurally good. Problems:

1. Emoji icons (🎧 📖 ✍️ 🗣️) for sections. These need to be replaced with proper SVG icons before launch. Emoji rendering is OS-specific and looks unfinished at 24px in a professional tool.
2. "Vollständige Prüfung starten" CTA at the bottom routes to listening. This is correct for sequential exam flow but the label implies a different UX than what's delivered — you can't actually start all sections in one go from a button. Rename to "Start with Hören".
3. The section rows are `justify-between` but there's no visual grouping between written and oral sections. The telc distinction between written and oral aggregate is fundamental to scoring — it should be surfaced here.

### Layout Shift

**Group sections into two blocks:**

Written (Schriftlich):
- Hören
- Lesen
- Sprachbausteine (if applicable)
- Schreiben

Oral (Mündlich):
- Sprechen

Each block has a small label: "Schriftlich — min. 60% zum Bestehen" and "Mündlich — min. 60% zum Bestehen". This is done once, clearly, before the user enters any section. It removes the need to explain the dual-aggregate rule in the results screen because the user already understood it going in.

**Section row changes:**
- Replace emoji with SVG icon (headphones for Hören, document for Lesen, pencil for Schreiben, microphone for Sprechen, puzzle piece for Sprachbausteine)
- Duration remains (correct and useful)
- Status badge: not started / in progress / completed — with a small colored dot, not a text badge. Text badge is too prominent for secondary information.
- The Start/Continue button stays but uses level color only for "Start" state. "Continue" state uses brand.500 (secondary action signal).

**Section transition screen (new):**
When the user finishes one section and the app routes to the next, show a brief interstitial. Not a modal — a full-page moment, 2-3 seconds. Contents:
- Section name completed: "Hören abgeschlossen"
- Brief positive confirmation: "Gut gemacht." (not "Amazing work!" — that is false enthusiasm)
- Progress indicator: how many sections done out of total
- Auto-advance countdown (3s) with a "Weiter" button to skip waiting
This interstitial exists to break the cognitive load between listening mode and reading mode. Without it, the transition is a jarring router push.

### Emotional Tone

Calm, prepared. This is the staging area before a real exam experience. The user should feel organised, not rushed. The dual-section grouping with pass threshold reminders is informational, not threatening — it prepares without alarming.

---

## Screen 4: Exam Runner (Timer + Question)

### Current State Assessment

The timer (`ExamTimer.tsx`) already has the right warning threshold (5 minutes). The critical problem: the `isExpired` state uses `bg-error-light text-error` — red coloring. Per the design principles, the timer must never turn red. Even at expiry, use the warning (amber) color. A red timer triggers panic.

The exam runner pages (ListeningExam, ReadingExam, etc.) have the timer in the page, presumably in the header area, but I couldn't assess exact positioning from the source. The spec is: timer in the top-right of the page header, visually quiet, never center-aligned, never large.

### Layout: Exam Runner Header

```
[Back/exit icon]        [Section name]        [Timer]
```

- Timer: right-aligned, `body-sm` size (14px), monospace font for digits
- Timer color at normal: `text-secondary` — not brand color, not prominent
- Timer background: `surface-container` — neutral, not colored
- Timer at warning (< 5 min): `semantic.warning-surface` background, `semantic.warning` text — amber only
- Timer at expired: same as warning (amber). No red. Ever.
- Timer icon (clock): 14px, matches text color

The timer should feel like the page number in a book — you know it's there if you look, but you're not reading it on every sentence.

### Question Area

- Question text: body size (16px), DM Sans Regular, line-height 1.55. German text needs generous line-height — compound words are long.
- Answer options: full-width touch targets, min-height 48px, left-aligned radio button + answer text. Not centered.
- Selected state: left border accent (4px, `semantic.border-focus` = brand.500) + `surface-container` background. Do NOT fill the entire button background with brand color — that is too visually heavy for a selected answer state.
- On submit/check: correct answers get `semantic.success-surface` + `semantic.success` left border. Wrong answers get `semantic.error-surface` + `semantic.error` left border. The correct answer is shown even if the user got it wrong.

### Progress Indicator (within a section)

A thin linear progress bar at the very top of the page (above the header), full-width, 3px tall. Fills as questions are answered. Level color. No number label — the visual fill is sufficient. This pattern is from Readwise's lesson progress and from Stripe's multi-step form flows.

### Emotional Tone

Mid-exam: near-silent. The UI's only job is to stay out of the way. No encouragement copy, no score previews during the exam, no question-level feedback (that comes at section end). The exam runner is the one place where visual minimalism is not a trade-off — it is the feature.

---

## Screen 5: Score Report (Exam Results)

### Current State Assessment

The results page (`ExamResults.tsx`) leads with a verdict box that prominently shows "Bestanden" or "Nicht bestanden" in large colored text. For a passing score this is fine. For a failing score this is the first thing the user sees — a large red "Nicht bestanden." That is the wrong emotional framing.

The current implementation correctly computes written/oral aggregates and shows per-section scores. The logic is sound. The presentation sequence is backwards.

### Layout Shift

**New sequence:**
1. Achievement header: "Übungstest 3 — Ergebnisse" (keep)
2. Score headline: "Du hast {X} von {max} Punkten erreicht." — lead with the absolute score, not the pass/fail verdict
3. Written aggregate card + Oral aggregate card — side by side as now, but each with a contextual sentence: "60% Mindestpunktzahl — Du hast 74% erreicht." (passing) or "60% Mindestpunktzahl — Du hast 52% erreicht. Empfehlung: Hören üben." (failing)
4. Pass/fail status: show as a single line at the bottom of the aggregate section, not as the hero. "Schriftlich: Bestanden / Mündlich: Nicht bestanden" with small colored dots. No large colored box.
5. Section breakdown: as now
6. Recommendations: NEW section. If any aggregate fails, show 1-2 actionable recommendations. These must be specific: "Hören Teil 2 (Ankündigungen) — 3 weitere Übungen empfohlen" not "Improve listening skills." If both aggregates pass, show a brief positive: "Gut gemacht — dieses Ergebnis reicht für die Prüfung. Mach weiter."

**Score headline typography:**
The X/max score in h1 or display size. This is the primary number. Not the percentage, not the verdict — the raw score. Percentage comes second. Verdict comes third. This sequence mimics how a human tutor would give feedback: "You got 44 out of 60 points. That's 73%. You passed the written section."

### Ethical Review Note

The current implementation shows the fail state in a large `border-fail bg-fail-light` box as the second thing on the page. This is harsh. The redesign surfaces the achievement (the score earned) first, then the threshold context, then the verdict. Same information, significantly different emotional impact. This is not hiding bad news — the user can still read their score and see it's below 60%. It is sequencing the information in a way that a good teacher would: here is what you did, here is what it means, here is what to do next.

### Emotional Tone

Warm-factual. Honest but not harsh. The goal is for a user who failed to close the results screen thinking "I know exactly what to practice" — not "I'm bad at this." A user who passed should feel validated, not over-celebrated. One "Gut gemacht" is enough.

---

## Screen 6: Vocabulary Flashcard

### Current State Assessment

`FlashCard.tsx` and `FlashcardSession.tsx` exist. The 3D flip is implemented correctly. Issues:

1. The back face shows the English translation as the primary text. For a German exam, the translation direction matters. In a real telc A1 exam the user is tested in German, in German context. Flashcard should default to German → (tap) → English + example sentence + article. This is already the case — just confirming it's correct.
2. "Tap card or press Enter to flip" is hint text in the card itself. At 14px, text-secondary, centered below the German word. This is fine but should disappear after the first card in a session (the user knows how to flip by then). Add a `hasFlippedOnce` session-level boolean and hide the hint after the first flip.
3. The session end state needs design — what does the user see after the last card?

### Flashcard Front

```
[Topic tag: pill, text-tertiary, surface-container bg]    [Card N of M]
                                                          (top right, caption)

        [German word — h1 or h2, DM Sans SemiBold]

        [article if noun: "der / die / das" in level color, body size]

        [flip hint: caption, text-tertiary — hidden after first flip]
```

No progress bar on the flashcard itself. The "N of M" label is sufficient.

### Flashcard Back

```
[English translation — h2, DM Sans Medium]

[Article + gender note if noun: "der (masculine)" — body-sm, text-secondary]

[Plural if exists: "Plural: die ... " — body-sm, text-secondary]

[Example sentence — body-sm, italic, text-secondary, surface-container bg, rounded-lg padding]

[Two buttons at bottom: "Noch lernen" (wrong) | "Gewusst" (correct)]
```

Button sizing: full-width, side by side, 48px minimum height. "Noch lernen" (need more practice): secondary style — border only, text-secondary. "Gewusst" (got it): filled, brand.600. The hierarchy communicates that knowing is the goal, but not-knowing is not punished.

Do not show a "score" for the session. Do not show percentage correct during the session.

### Session End Screen

After the last card:
```
[h2: "Einheit abgeschlossen"]
[Stat 1: "18 Wörter geübt" — the total reviewed]
[Stat 2: "11 sicher" — where interval > 7 days (labeled as "sicher" not "mastered")]
[Stat 3: "7 zum Wiederholen" — cards re-queued]
[Primary CTA: "Weiter lernen" — goes back to vocab hub or next due date]
[Secondary: "Zur Vokabelliste" — quiet link]
```

No confetti. No score percentage. No comparison to other users. The three stats are the honest summary of the session.

### Emotional Tone

Safe and low-stakes during practice. Quietly satisfying at the end. The "sicher" framing (secure/solid) is more meaningful than "mastered" — it signals that you've seen it enough times that it's internalized, without overclaiming.

---

## Screen 7: Grammar Topic

### Current State Assessment

I read the TopicDetail and ExercisePlayer components in the Glob but didn't load them. The grammar page shows topic cards per level. The design direction without seeing the full implementation:

**Topic card grid:** same principle as mock exams. Distinguish between not-started, in-progress, and completed visually. Use the same left-accent-bar treatment for in-progress cards.

**Topic detail page layout:**
```
[Back to Grammar]
[Topic title — h1]
[Level badge + estimated time — caption, text-secondary]

[Explanation section — body text, generous padding, white surface]
[Example box — surface-container bg, left border in brand.200, monospace or italic for German examples]

[Exercise section — separated by a divider, not a new card]
[Progress: "Aufgabe 2 von 5"]
[Question]
[Answers]
[Feedback on submit]
```

The explanation and exercise should feel like one continuous document, not two separate cards. Think Readwise's article reader: the content flows, the UI scaffolding is minimal.

### Emotional Tone

Focused study. Grammar is the least exciting part of exam prep. The screen should be calm and efficient — get through the explanation, do the exercises, move on. No celebration on correct grammar answers beyond a brief checkmark animation (120ms, then next question automatically). The Linear pattern: task done, next task appears, minimal friction.

---

## Cross-Screen Notes

**Navigation:** The current 4-link nav (Dashboard / Mock Exams / Vocabulary / Grammar) is correct. On mobile, the hamburger placeholder needs to be implemented. Recommend a bottom navigation bar on mobile with icons + labels rather than a hamburger drawer — the four sections map cleanly to 4 bottom tabs.

**Level selector:** The level pills appear on both the dashboard and the mock exams list. They should be visually consistent across both. Currently they use the same pattern but may have slight variations. Lock down one canonical pill component.

**Empty states:** Every screen needs a designed empty state. Current approach is ad-hoc. The empty state template:
- No cartoon illustrations
- A simple icon (outline SVG, 48px, text-tertiary color)
- One line of text: what's missing and what to do
- One CTA if there's an action to take

**Error states:** Currently there is a "coming soon" warning banner with `border-warning bg-warning-light`. This is fine. Ensure the color uses the new semantic warning tokens.

**Focus states:** All interactive elements need visible focus rings for keyboard navigation. Use `outline: 2px solid semantic.border-focus; outline-offset: 2px`. Tailwind's `focus-visible:ring-2` is the implementation — make sure this is applied consistently and not overridden by `outline-none` without a replacement.
