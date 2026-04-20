# Stitch / v0 Prompts — Fastrack Deutsch
> Designed: 2026-04-20

These prompts are ready to paste into Stitch, Topklasse, or v0. Each prompt is self-contained — it carries enough color, copy, and layout context to generate a usable inspiration screen without referencing external files. After generation, compare the output against the tokens.md and screens.md specs; Stitch will not match perfectly but should get you 70% of the way to the target visual direction.

---

## Prompt 1: Dashboard

```
Design a web app dashboard screen for "Fastrack Deutsch", a German telc exam prep tool. Target user: adult learner (25-40), serious, paying to pass a real certification. Visual register: calm, precise, professional — like Readwise or Linear, not Duolingo. No mascots, no confetti, no bright playful colors.

LAYOUT
- Sticky header: left-aligned "fd" monogram mark (small, navy) + "Fastrack Deutsch" wordmark in DM Sans Semibold 18px, text #2e2e34. Right: nothing (clean).
- Page content max-width 1120px, centered, horizontal padding 24px, vertical padding 32px.
- Section 1 — Level selector: horizontal row of 5 pill tabs labeled A1 A2 B1 B2 C1. Active pill: solid background in level color, white text. Inactive: white bg, #d9d9db border, #6b6b70 text. Level colors: A1=#2d8a4e A2=#5e8a1a B1=#b86200 B2=#c0390b C1=#6b2fa0. Current active: A1 (emerald green).
- Section 2 — Hero card: full-width white card, border-radius 12px, 1px border #d9d9db, padding 28px. Inside: two columns. Left col (60%): Label "Prüfungsbereitschaft" in 12px uppercase tracking-wide #6b6b70. Below: large stage name "Building Foundation" in 30px DM Sans Semibold #2e2e34. Below: single contextual sentence "Complete 2 more mock exams to reach the next stage." in 14px #6b6b70, max-width 360px. Below (16px gap): primary CTA button "Start: Übungstest 1" — filled #1a3a5c, white text, border-radius 8px, 12px 20px padding, 15px DM Sans Semibold. The left edge of the card has a 4px vertical accent bar in #2d8a4e (A1 color), full card height, border-radius 0 on left. Right col (40%): a horizontal 4-segment stage track. Four segments labeled left to right: "Building foundation" / "Developing skills" / "Nearly ready" / "Exam ready". First segment highlighted in #2d8a4e (filled), remaining three in #e8e8ea (empty). Each segment: height 6px, border-radius full, with label below in 11px #6b6b70. Current active segment label bold.
- Section 3 — Stats row: 3 cards side by side (equal width), 12px gap. Each card: white bg, 1px border #d9d9db, border-radius 10px, padding 20px.
  Card 1: label "Übungstests" in 12px #6b6b70. Value "3 / 10" in 28px DM Sans Bold #2e2e34. Below value: thin linear progress bar, height 4px, bg #e8e8ea, fill #2d8a4e (30% fill = 3 of 10), border-radius full. Below bar: "abgeschlossen" in 12px #6b6b70.
  Card 2: label "Durchschnitt" in 12px #6b6b70. Value "74%" in 28px DM Sans Bold #2e2e34. Below: "aus 3 Prüfungen" in 12px #6b6b70.
  Card 3: label "Lernzeit" in 12px #6b6b70. Value "4h 20min" in 28px DM Sans Bold #2e2e34. Below: "diese Woche" in 12px #6b6b70. To the right of the label: a tiny 7-square week grid (Monday–Sunday), squares 8x8px, gap 2px, filled squares (Mon–Thu) in #d5e0ef, empty (Fri–Sun) in #e8e8ea. This is the streak display — no fire emoji.
- Section 4 — Recent results: section heading "Zuletzt geübt" in 15px DM Sans Medium #2e2e34. Below: 2 result rows. Each row: white card, border-radius 10px, 1px border #d9d9db, padding 16px 20px, flex row. Left: level badge pill (A1, bg #2d8a4e, white text, 10px 8px padding, border-radius full) + "Übungstest 3" in 14px DM Sans Medium #2e2e34. Right: two status pills side by side — "Schriftlich 74%" with small filled circle dot in #1e6e36, "Mündlich 68%" with small filled circle dot in #1e6e36. Both passed. Font 12px #6b6b70.

TYPOGRAPHY: DM Sans throughout. No serif on this screen. All German text must render cleanly.
COLORS: Background #f7f7f8. Surfaces white. Text primary #2e2e34. Text secondary #6b6b70. Brand navy #1a3a5c. A1 green #2d8a4e.
MOOD: Calm, data-clear, professional. Like a financial dashboard that's also friendly.
```

---

## Prompt 2: Mock Exams List

```
Design a mock exam listing page for "Fastrack Deutsch", a German telc exam prep web app. Style: precise, calm, professional. Reference: Linear's issue list or Readwise's library. No gamification, no progress bars everywhere — just clean, scannable cards.

LAYOUT
- Same sticky header as dashboard (fd mark + Fastrack Deutsch wordmark).
- Page heading "Übungstests" in 28px DM Sans Semibold #2e2e34. Subheading below: "Timed practice exams following the official telc format." in 14px #6b6b70.
- Level tab row: same pill pattern as dashboard. Active: A1 in #2d8a4e. 
- Level info strip: below tabs, full-width strip with left border 4px #2d8a4e, bg #eaf7ef, padding 12px 16px, border-radius 8px. Text: "Start Deutsch 1 — 20 Stunden bis Prüfungsbereitschaft · 60% Mindestpunktzahl in schriftlicher und mündlicher Prüfung" in 13px #1a5c34.
- Exam card grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Gap 16px.

CARDS — show 6 cards total:
  Card 1 (completed, passed): white bg, 1px #d9d9db border, border-radius 12px, padding 20px. Top row: A1 badge pill (#2d8a4e bg, white text, "A1", 10px 7px padding, border-radius full) left-aligned. Score badge right-aligned: "82%" in 12px DM Sans SemiBold, bg #eaf7ef, text #1a5c34, border-radius full, 8px 10px padding. Middle: "Übungstest 1" in 16px DM Sans SemiBold #2e2e34. Below: test subtitle in 13px #6b6b70. Bottom row: "Vollständig" in 12px #9a9a9e. Card bg: #f7f7f8 (slightly receded — completed exam steps back).

  Card 2 (in-progress): white bg, left accent bar 2px #2d8a4e full height, border-radius 12px, padding 20px (left padding 18px to account for bar). A1 badge top-left. Middle: "Übungstest 2" h4. Subtitle. Bottom row: "2 von 4 Abschnitten" in 12px #6b6b70. A thin progress track inside the bottom of the card: 3px height, bg #e8e8ea, fill #2d8a4e at 50%, border-radius full, margin top 12px.

  Cards 3-5 (not started): white bg, A1 badge, title, subtitle, bottom row shows nothing (empty — quiet). Chevron icon right-aligned, 16px, color #c0c0c3, visible only on hover state (show the hover state on card 4 for illustration — border darkens to #9a9a9e, shadow appears: 0 2px 8px rgba(0,0,0,0.07), chevron becomes #6b6b70).

  Card 6 (coming soon / no content): white bg with #f7f7f8 tint. All text in #9a9a9e. Badge greyed out. Bottom row: "Bald verfügbar" in 12px #9a9a9e. No hover state. Cursor default.

TYPOGRAPHY: DM Sans. No serif.
COLORS: background #f7f7f8. Brand navy #1a3a5c. A1 #2d8a4e.
MOOD: Organised, purposeful. The feeling of opening a well-indexed reference binder.
```

---

## Prompt 3: Exam Runner (Mock Exam in Progress)

```
Design an exam runner screen for "Fastrack Deutsch" — a German telc mock exam in progress. Section: Hören (Listening), Teil 1. The design must minimise distraction and anxiety. Reference: Stripe's focused form steps, or a very clean test-taking UI. Nothing decorative, nothing that moves for its own sake.

LAYOUT
- Header: full-width, white bg, 1px bottom border #d9d9db, height 56px. Three-column flex:
  Left: a small X/exit icon (16px, #6b6b70) with text "Prüfung beenden" in 13px #6b6b70. Clicking this exits with a confirmation.
  Center: "Hören — Teil 1" in 14px DM Sans Medium #2e2e34.
  Right: timer component — "27:14" in 14px JetBrains Mono (monospace), color #6b6b70, background #f0f0f1, border-radius 6px, padding 4px 10px, a small clock icon (12px) to the left. IMPORTANT: the timer is visually quiet — same color as secondary text, small, unemphasised.
- Full-width progress bar directly below header: 3px height, background #e8e8ea, fill #2d8a4e (A1 color) at 40% width (question 2 of 5), no label.

- Main content area: max-width 680px centered, padding top 48px, padding sides 24px.
  Audio player (since this is listening): a clean embedded audio bar — white bg, 1px #d9d9db border, border-radius 10px, padding 16px. Contains: play/pause button (circle, 40px, #1a3a5c bg, white play icon), track scrubber (thin bar, #d9d9db bg, #1a3a5c fill at 35%), time display "1:12 / 3:24" in 12px monospace #6b6b70.

  Question number and text: "Frage 2 von 5" in 12px uppercase tracking-wide #9a9a9e, margin top 32px. Below: question text in German, 17px DM Sans Regular #2e2e34, line-height 1.6. Example: "Was macht Herr Müller am Wochenende?"

  Answer options: 4 options, stacked, full-width. Each option: white bg, 1px #d9d9db border, border-radius 8px, padding 14px 16px, min-height 52px, flex row with radio button left + answer text right in 15px #2e2e34. Gap 8px between options.
  Option A (selected state): left border 4px #1a3a5c, background #f0f4f8, radio filled. All other options: default.
  No colors showing right/wrong yet — feedback comes only after submit.

  Submit button: below options, full-width, 52px height, bg #1a3a5c, white text "Antwort prüfen" in 15px DM Sans SemiBold, border-radius 8px. Disabled until an option is selected.

- Section transition interstitial (show as a second screen or overlay): full-page, white bg. Centered content vertically and horizontally. Large checkmark icon (48px, circle outline #1e6e36, checkmark #1e6e36). Below: "Hören abgeschlossen" in 24px DM Sans SemiBold #2e2e34. Below: "Gut gemacht." in 16px #6b6b70. Below: progress pills showing sections — 4 small pills, first (#2d8a4e solid = done), next 3 (#e8e8ea = remaining). Auto-advance bar at bottom showing 3-second count. "Weiter zu Lesen" button below.

TYPOGRAPHY: DM Sans for all text. JetBrains Mono for timer digits only.
COLORS: White surfaces. Timer is #f0f0f1 bg, subdued. Brand #1a3a5c for primary actions. A1 green #2d8a4e for progress fill.
MOOD: Focused, quiet, exam-appropriate. The UI is invisible — only the content matters. No decorative elements. No animation except the progress bar fill.
```

---

## Prompt 4: Vocabulary Flashcard

```
Design a vocabulary flashcard screen for "Fastrack Deutsch", a German telc A1 exam prep app. The flashcard should feel like a safe, low-pressure practice space — not an assessment. Calm, spacious, focused. Reference: Readwise's reader mode for the surrounding chrome, with a centered card as the focal point.

LAYOUT
- Same sticky header (fd mark + Fastrack Deutsch). Below header: navigation breadcrumb "Vokabular → A1" in 13px #6b6b70, back arrow on left.
- Session progress: "Karte 7 von 24" right-aligned in 12px #6b6b70, same line as breadcrumb.
- Main content: vertically and horizontally centered in the remaining viewport. Max-width 440px.

FLASHCARD — FRONT STATE
Card: white bg, 1px #d9d9db border, border-radius 16px, shadow: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04). Min-height 280px. Padding 40px.
Inside (centered vertically and horizontally, flex-col):
  - Topic tag: pill, "Alltag" text in 12px #6b6b70, bg #f0f0f1, border-radius full, padding 4px 12px. Top-center.
  - German word: "das Frühstück" in 32px DM Sans SemiBold #2e2e34, centered. (Note: article is shown as part of the word on the front — this is intentional for noun cards.)
  - Hint text: "Karte umdrehen" in 12px #9a9a9e, centered, below the word. This text disappears after the first flip in the session (show it here for first card).

FLASHCARD — BACK STATE (show as the flipped version)
Same card dimensions, same border/shadow. Internal content:
  - English translation: "breakfast" in 26px DM Sans Medium #2e2e34, centered.
  - Article line: "das (neuter)" in 14px #6b6b70, centered.
  - Example sentence: "Ich esse jeden Morgen Frühstück." in 13px italic #6b6b70, centered, inside a #f0f0f1 bg rounded block (border-radius 8px, padding 12px), max-width 340px, margin-top 16px.
  - Two buttons below the card (outside the card, below it): side by side, each 50% width, gap 12px.
    Left button: "Noch lernen" — white bg, 1px #d9d9db border, border-radius 8px, 48px height, 14px DM Sans Medium #6b6b70. This requeues the card.
    Right button: "Gewusst" — #1a3a5c bg, white text, border-radius 8px, 48px height, 14px DM Sans SemiBold. This marks the card correct.
    No icons in buttons. Text is sufficient.

SESSION END SCREEN (show as third view):
Full page, white bg, centered content. 
  - Checkmark icon: 56px, circle outline, #1a3a5c stroke.
  - Heading: "Einheit abgeschlossen" in 26px DM Sans SemiBold #2e2e34.
  - Three stat rows, stacked, centered, 8px gap. Each row: stat value in 20px DM Sans SemiBold #2e2e34 + label in 14px #6b6b70 on the same line.
    "18" Wörter geübt
    "11" sicher (Intervall > 7 Tage)
    "7" zum Wiederholen
  - The word "sicher" appears in #1e6e36 (success green) to add one quiet moment of positive framing.
  - Primary CTA: "Weiter lernen" button, full-width (max 320px), #1a3a5c bg, white text, border-radius 8px, 52px height.
  - Below: quiet link "Zur Vokabelliste" in 13px #6b6b70, underline on hover.

TYPOGRAPHY: DM Sans throughout. No monospace on this screen.
COLORS: Background #f7f7f8. Card white with shadow. Brand #1a3a5c. Success #1e6e36 only for the "sicher" stat.
MOOD: A quiet study room. Safe, low-stakes. The two buttons are equal in visual weight — there is no shame button and a pride button. Both are neutral-to-positive actions.
```

---

## Prompt 5: Grammar Topic Detail

```
Design a grammar topic detail page for "Fastrack Deutsch", a German telc A1 exam prep app. The page combines a short explanation with interactive exercises. Style: editorial, like a good textbook rendered as a web page. Reference: Readwise Reader article view, or the typographic quality of a Stripe Docs page. Nothing decorative — just the content, well laid out.

LAYOUT
- Same sticky header. Breadcrumb: "Grammatik → A1 → Artikel und Nomen" in 13px #6b6b70 with back arrow.
- Content column: max-width 660px centered. Padding 40px top, 24px sides.

EXPLANATION SECTION
  - Topic title: "Artikel und Nomen" in 28px DM Sans SemiBold #2e2e34. Below: "A1 · ~10 Minuten" in 12px #9a9a9e.
  - Explanation paragraph: 16px DM Sans Regular #2e2e34, line-height 1.65. Two short paragraphs. German example sentences are inline, styled in italic.
  - Example block: a left-bordered box, 4px left border #a8bfdf (brand.200 — subtle, not loud), bg #eef2f8 (brand.50), border-radius 0 8px 8px 0, padding 16px 20px. Inside: 3 example sentences stacked, each 15px DM Sans Regular #2e2e34. German noun gender shown: "der Mann — the man" / "die Frau — the woman" / "das Kind — the child." The German part in DM Sans Medium, the dash and English in DM Sans Regular #6b6b70.
  - A horizontal divider (1px #e8e8ea) separates explanation from exercises.

EXERCISE SECTION
  - Label: "Übungen" in 13px uppercase tracking-wide #9a9a9e. Below: "Aufgabe 2 von 5" progress in 12px #9a9a9e, right-aligned.
  - Thin progress bar: full-width, 3px height, bg #e8e8ea, fill #1a3a5c at 40% (2 of 5), border-radius full, margin bottom 24px.
  - Exercise question: "Wähle den richtigen Artikel." in 13px #6b6b70 (instruction). Below: "_____ Hund ist groß." in 18px DM Sans Medium #2e2e34, with a blank underline.
  - Answer options: 3 options in a row (for short options like articles): each a pill button, min-width 80px, height 44px, centered text "der" / "die" / "das" in 15px DM Sans Medium. Default: white bg, 1px #d9d9db border, #2e2e34 text. Selected (show "der" selected): #f0f4f8 bg, 1.5px #1a3a5c border, #1a3a5c text. Correct feedback (show on a different option): #eaf7ef bg, 1.5px #1e6e36 border, #1a5c34 text with a small checkmark (12px) left of text. Wrong feedback: #fdecea bg, 1.5px #b91c1c border, #8a2608 text with a small x (12px) left of text. The correct answer is always revealed even when wrong.
  - After answer: auto-advance button "Nächste Aufgabe" — appears below the options, full-width, #1a3a5c bg, white text, border-radius 8px, 48px height. Label changes to "Abschluss" on the last exercise.

TYPOGRAPHY: DM Sans Regular for body. DM Sans SemiBold for headings and exercise nouns. No serif on this screen (grammar is reference material, not a headline moment).
COLORS: Background #f7f7f8. Article examples bg #eef2f8 with #a8bfdf left border. Correct state #eaf7ef + #1e6e36. Wrong state #fdecea + #b91c1c.
MOOD: Focused study. Like reading a well-designed grammar reference. The explanation flows into the exercise naturally — no jarring modal, no fullscreen takeover. Just content, then practice.
```

---

## Notes on Using These Prompts

**Stitch:** Paste each prompt as-is. Stitch will interpret color values, layout descriptions, and copy literally. Request "desktop breakpoint only" to avoid responsive complications on first iteration. After approving the desktop layout, request the mobile variant separately.

**v0:** v0 will generate actual Tailwind code. Treat the output as a sketch, not production code — the class names it generates will not match our token naming convention. Feed the output to the implementation-lead as a visual reference, not as copy-paste code.

**What to expect:** The prompts are specific enough to generate screens that are 60-70% of the way to the target. The remaining 30% is typographic refinement (DM Sans may not load in the tool), shadow accuracy, and the exact motion behavior. These are fine-tuned in implementation.

**What to reject:** If the generated output includes cartoon illustrations, fire emojis, bright orange streak mechanics, or a percentage dial for the readiness gauge — reject and re-run. Those are anti-patterns for this product.
