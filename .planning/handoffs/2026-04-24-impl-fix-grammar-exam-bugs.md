## Handoff — #98, #99, #100 — Grammar routing + dark mode text fix

### What was built

Three user-reported bugs fixed in a single PR (#101, branch `fix-grammar-exam-bugs`).

**#100 — Grammar B2+ topics return 404**
Added `/grammar/[level]/[topicId]` route that calls `loadGrammar(level)` with the
correct level from the URL. The old `/grammar/[topicId]` page was hardcoded to A1 and
now redirects to `/grammar/A1/[topicId]` for backward compatibility. TopicCard href
updated from `/grammar/N` to `/grammar/[level]/N`. Prev/next navigation in
TopicDetailPage now stays within the same level (uses `topic.level` in the route).

**#99 — Browse Topics inline expansion confusing on mobile**
Replaced the `selectedLevel` toggle button with a Next.js `Link` that navigates to
`/grammar/[level]`. New `/grammar/[level]` page shows a breadcrumb (Grammar → Level)
and a grid of all topics for that level via `TopicCard`. The `GrammarPageClient` was
simplified — no more `useState`, no inline topic list, no `topics` prop.

**#98 — Exam reading page text invisible in dark mode**
Replaced all `bg-white` Tailwind classes with `bg-surface` in exam components. In
system dark mode, `--color-text-primary` maps to near-white (#f7f7f8); `bg-white` stays
literal white, making text invisible. `bg-surface` follows the CSS variable and adapts
to dark mode correctly.

### Files changed

- `apps/web/src/components/exam/SectionIntro.tsx` — `bg-white` → `bg-surface` on info card
- `apps/web/src/components/exam/ExamRunnerHeader.tsx` — `bg-white` → `bg-surface` on header bar and exit confirm dialog
- `apps/web/src/components/exam/ReadingExam.tsx` — `bg-white` → `bg-surface` on part tabs, instruction panel, text cards, question cards
- `apps/web/src/components/exam/ListeningExam.tsx` — `bg-white` → `bg-surface` on part tabs, instruction panel, question cards
- `apps/web/src/components/exam/WritingExam.tsx` — `bg-white` → `bg-surface` on all task cards, results cards
- `apps/web/src/components/exam/SprachbausteineExam.tsx` — `bg-white` → `bg-surface` on part tabs, instruction panel, text panel, review card
- `apps/web/src/components/exam/SectionHub.tsx` — `bg-white` → `bg-surface` on section group list
- `apps/web/src/app/layout.tsx` — `bg-white` → `bg-surface` on footer
- `apps/web/src/app/grammar/page.tsx` — simplified: no longer loads full topics arrays, just topic counts
- `apps/web/src/app/grammar/GrammarPageClient.tsx` — removed selectedLevel state and inline topic list; Browse Topics is now a Link to /grammar/[level]
- `apps/web/src/app/grammar/[topicId]/page.tsx` — replaced with redirect to /grammar/A1/[topicId]
- `apps/web/src/app/grammar/[topicId]/TopicDetailPage.tsx` — prev/next nav uses topic.level in route; breadcrumb has level link
- `apps/web/src/app/grammar/[level]/page.tsx` — NEW: level listing page with breadcrumb + topic grid
- `apps/web/src/app/grammar/[level]/[topicId]/page.tsx` — NEW: level-scoped topic detail page
- `apps/web/src/components/grammar/TopicCard.tsx` — href updated to /grammar/[level]/[orderIndex]; `bg-white` → `bg-surface`
- `apps/web/src/__tests__/grammar/TopicCard.test.tsx` — href expectation updated to /grammar/A1/1
- `apps/web/src/__tests__/grammar/GrammarPageClient.test.tsx` — NEW: 4 tests for Browse Topics link behavior

### Tests

- Unit (web): 4 new tests in GrammarPageClient.test.tsx; 1 updated in TopicCard.test.tsx
- All grammar tests: 25/25 passing
- E2E: 30/30 passing (no grammar E2E exists; existing exam E2E unaffected)
- Typecheck: clean (pre-existing @vercel/blob errors are unrelated to this PR)

### Quality gates

- compliance: n/a (no auth/PII touched)
- language-checker: n/a (no German content changed)
- spec-tracker: n/a (no content files changed)

### Notes

- The E2E job timed out twice on first attempts due to transient GitHub runner congestion
  (Vercel cold starts). Third attempt passed in 1m22s with identical code.
- The `GRAMMAR_DIR` env var is not set in Vercel production; loadGrammar falls back to
  `../mobile/src/data/grammar` relative to cwd, which won't exist on Vercel. The try/catch
  returns `[]` gracefully. Grammar content is mobile-asset data, not deployed to Vercel.
  This was a pre-existing condition; grammar pages have always returned empty topic lists
  on the Vercel deployment.

### PR

https://github.com/kirankbs/fastrack-deutsch/pull/101
