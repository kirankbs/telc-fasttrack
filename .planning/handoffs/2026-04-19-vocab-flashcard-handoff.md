# Handoff: Vocabulary Flashcard Session UI — #14

**PR:** https://github.com/kirankbs/telc-fasttrack/pull/16
**Branch:** `vocab-flashcard-ui`
**CI:** All checks green (Typecheck+Tests, E2E, Vercel Preview)

## What was built

Full flashcard session flow on the `/vocab` page:

1. **Level selector** — existing card grid now has working "Start Review" button for A1; other levels stay disabled
2. **Session initialization** — randomly selects 20 cards (or fewer if vocab < 20), shuffled order, session-scoped state
3. **FlashCard** — 3D CSS flip animation (rotateY), front shows German word + topic, back shows English + gender hint + plural + example sentence
4. **Grading** — 4 buttons (Again/Hard/Good/Easy) mapped to SM-2 quality 0/2/3/5; calls `calculateNextReview` from `@telc/core`
5. **Progress bar** — fills proportionally with ARIA attributes
6. **Session summary** — cards reviewed, avg ease factor, per-quality breakdown, New Session / Back to Vocabulary

## Files changed (7)

| File | Change |
|------|--------|
| `apps/web/src/lib/loadVocabulary.ts` | New — server-side vocab loader (fs/promises, same pattern as loadMockExam) |
| `apps/web/src/components/vocab/FlashCard.tsx` | New — flip card with CSS 3D transform |
| `apps/web/src/components/vocab/FlashcardSession.tsx` | New — session state machine (idle/active/summary) |
| `apps/web/src/app/vocab/page.tsx` | Modified — now async server component loading vocab data |
| `apps/web/src/app/vocab/VocabPageClient.tsx` | New — client wrapper managing level selection state |
| `apps/web/src/__tests__/vocab/FlashCard.test.tsx` | New — 6 tests |
| `apps/web/src/__tests__/vocab/FlashcardSession.test.tsx` | New — 12 tests |

## Test coverage

- 18 new tests (6 FlashCard + 12 FlashcardSession)
- 58 total tests passing across 7 test files
- Covers: init, flip, grading, SM-2 integration, summary, ARIA, keyboard a11y

## Not included (per contract "out of scope")

- No persistence (localStorage/SQLite)
- No audio playback
- No topic filtering
- No A2-C1 content
