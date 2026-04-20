# Phase 4 — Flashcards + Grammar + Results Sequencing

**Issue:** #53
**Branch:** `ui-upgrade-phase4-vocab-grammar-results`
**Base:** `ui-upgrade-phase1-tokens-typography`
**Date:** 2026-04-20

## What Shipped

Three calibrated UI interventions, all web-only, all using Phase 1 tokens:

1. **Flashcard (vocab session)** — front with article-inline noun, topic pill, session-level flip hint; back with English, gender, plural, example block. Two **equal-weight** buttons below the card: outline "Noch lernen" + filled brand "Gewusst". No red shame button. Reduced-motion fallback swaps the 3D rotate for a 150ms cross-fade (`motion-reduce:transition-none` + opacity transition on faces).
2. **Flashcard session end** — full-page centered summary: `CheckCircle2` icon in brand, "Einheit abgeschlossen" h2, 3 stat rows ("N Wörter geübt / N sicher / N zum Wiederholen") with only "sicher" highlighted in `text-success`. Primary CTA "Weiter lernen" (brand-600, 52px), secondary link "Zur Vokabelliste". No percentage, no confetti.
3. **Grammar topic detail** — editorial layout inside a 660px column, breadcrumb "Grammatik → Level → Topic", subtitle "{Level} · ~N Minuten", explanation as flowing body (no card), examples inside a left-bordered `border-l-4 border-brand-200 bg-brand-50 rounded-r-lg` block with German+English split on the em-dash. Divider separates explanation from exercises.
4. **Exercise player** — short-answer MCQ auto-renders as pill buttons (min 80×44px) when all options are ≤ 12 chars; falls back to stacked list otherwise. Selected = brand-600 outline; correct post-submit = `bg-pass-surface border-pass` + Check icon; wrong = `bg-fail-surface border-fail` + X icon, with the correct option simultaneously highlighted. 3px progress bar, "Aufgabe N von M" label, "Nächste Aufgabe" button (becomes "Abschluss" on the last item).
5. **Exam results — resequenced** — new top-to-bottom order:
   1. Header: "Übungstest N — Ergebnisse"
   2. Score headline in display serif: "Du hast X von Y Punkten erreicht." — **absolute score leads**
   3. Written + Oral aggregate cards with threshold context ("60% Mindestpunktzahl — Du hast X% erreicht.") and per-section recommendation when failing
   4. Pass/fail as a single line with colored dots ("Schriftlich: Bestanden • Mündlich: Nicht bestanden") — small, not hero
   5. Per-section breakdown (compact rows with score + % + colored dot)
   6. Recommendations section: one actionable item per failing section, or a single "Gut gemacht — dieses Ergebnis reicht für die Prüfung. Mach weiter." when everything passes.
   Large red hero box is gone; "Nicht bestanden" is never the first visible text.

## Files Changed

| Path | Change |
|------|--------|
| `apps/web/package.json` | add `lucide-react` |
| `apps/web/src/components/vocab/FlashCard.tsx` | rewrite — topic pill, h1 german, session-level hint flag, motion-reduce classes |
| `apps/web/src/components/vocab/FlashcardSession.tsx` | rewrite — 2-button flow, `hasFlippedOnce`, 3-stat summary, "sicher" threshold > 7 days |
| `apps/web/src/components/grammar/TopicDetail.tsx` | rewrite — editorial; example block with left-border brand tint |
| `apps/web/src/components/grammar/ExercisePlayer.tsx` | rewrite — pill MCQ, correct/wrong icons, "Abschluss" on last |
| `apps/web/src/app/grammar/[topicId]/TopicDetailPage.tsx` | rewrite — breadcrumb, 660px column, subtitle, divider |
| `apps/web/src/components/exam/ExamResults.tsx` | rewrite — resequence, recommendations builder, dots verdict |
| `apps/web/src/components/exam/QuestionResultRow.tsx` | swap emoji ticks for lucide Check/X, pass/fail tokens |
| `apps/web/src/__tests__/vocab/FlashCard.test.tsx` | updated for new props + added motion-reduce + double-article + flip-hint assertions |
| `apps/web/src/__tests__/vocab/FlashcardSession.test.tsx` | rewrite — asserts 2-button flow, honest stats, no red styling, no %, no confetti |
| `apps/web/src/__tests__/grammar/ExercisePlayer.test.tsx` | Übung→Aufgabe, "Ergebnis anzeigen"→"Abschluss" label updates |
| `apps/web/src/__tests__/grammar/TopicDetail.test.tsx` | new — asserts border-l-4 / border-brand-200 / bg-brand-50 |
| `apps/web/src/__tests__/exam/ExamResults.test.tsx` | rewrite — first-visible-text assertion, recommendations coverage, no-hero-box assertion |
| `apps/web/src/__tests__/exam/QuestionResultRow.test.tsx` | pass/fail class assertions (border-pass / border-fail) |
| `apps/web/e2e/vocab-flashcards.spec.ts` | new — 3-card flashcard session → end screen |

## Test Counts

- Unit: **178 passing** (up from 164 — 14 new specs in Phase 4)
- Typecheck: green across all 6 packages
- Build: green (`next build` succeeds; `/vocab`, `/grammar/[topicId]`, `/exam/[mockId]/results` all compile)
- E2E: 1 new spec added; runs in CI with the existing Playwright config

## Key Design Decisions

- **Article inline with noun** on flashcard front — implementation de-dupes if data already starts with the article (e.g. "das Frühstück" stays as-is; "Name" + article "der" becomes "der Name").
- **"Sicher" threshold** = `intervalDays > 7` from SM-2 output. This matches the long-standing spaced-repetition convention that a > 1-week interval means the card is durably retained. Not a hardcoded guess — kept as a named constant.
- **Pill vs stacked MCQ** — the player auto-picks pill layout when every option is ≤ 12 chars. Longer option strings fall back to the stacked list so readable content isn't crammed into a 80×44 chip.
- **Motion-reduce** uses Tailwind's `motion-safe:` and `motion-reduce:` variants on the flipper and both faces. No `window.matchMedia` JS — purely CSS, so it survives SSR and updates live with OS setting.
- **Recommendations builder** iterates `SECTION_META` and emits one entry per failing *section*, falling back to aggregate-level nudges when the aggregate fails with no per-section failure present (e.g. partially-answered exam).

## Not Done (out of scope)

- Topic card list (hub) redesign — only the detail page per AC
- Vocabulary hub redesign
- Mobile app

## Follow-ups

- If product wants the "sicher" threshold to be user-visible copy (e.g. "sicher = letzter Intervall > 7 Tage"), wire it into i18n tokens later.
- `TopicCard` can later get the in-progress / completed state treatment from Screen 2 when that work is prioritized.
