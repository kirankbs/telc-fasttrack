# Handoff: Grammar Hub — #19

**PR:** https://github.com/kirankbs/telc-fasttrack/pull/23
**Branch:** `grammar-hub`
**Worktree:** `.worktrees/grammar-hub`

## What was built

Grammar hub for the web app with level selector, topic list, topic detail pages, and interactive exercise player.

### New files (10)

| File | Purpose |
|------|---------|
| `apps/web/src/lib/loadGrammar.ts` | Server-side loader — reads A1_grammar.json from mobile data dir |
| `apps/web/src/app/grammar/GrammarPageClient.tsx` | Client component — level cards with toggle to show topic grid |
| `apps/web/src/app/grammar/[topicId]/page.tsx` | Server component — loads topic by orderIndex, calls notFound for invalid |
| `apps/web/src/app/grammar/[topicId]/TopicDetailPage.tsx` | Client component — explanation, examples, exercise player, prev/next nav |
| `apps/web/src/app/grammar/[topicId]/not-found.tsx` | 404 page for invalid topic IDs |
| `apps/web/src/components/grammar/TopicCard.tsx` | Card in the topic grid — order badge, name, counts |
| `apps/web/src/components/grammar/TopicDetail.tsx` | Explanation + examples sections |
| `apps/web/src/components/grammar/ExercisePlayer.tsx` | Sequential exercise flow — fill_blank, mcq, reorder, feedback, summary |
| `apps/web/src/__tests__/grammar/TopicCard.test.tsx` | 4 tests — render, link, no-exercises, color |
| `apps/web/src/__tests__/grammar/ExercisePlayer.test.tsx` | 12 tests — states, feedback, case-insensitive, retry, all types |

### Modified files (1)

| File | Change |
|------|--------|
| `apps/web/src/app/grammar/page.tsx` | Converted from static stub to server component that loads grammar data |

## Exercise types handled

- `fill_blank` — text input, case-insensitive + trimmed comparison
- `mcq` — 3 options (1 correct + 2 distractors from other exercises in topic), radio-style buttons
- `reorder` — text input (same as fill_blank mechanically)

## Quality

- Typecheck: zero errors
- Tests: 102/102 passing (16 new)
- All colors from Tailwind theme — no hardcoded hex
- Types from `@telc/types` — no local redefinitions
- data-testid on all interactive elements
- Keyboard navigable, semantic headings, focus rings
