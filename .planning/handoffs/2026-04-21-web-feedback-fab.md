# Handoff: Feedback FAB (Issue #84)

**Date:** 2026-04-21
**Branch:** `web-feedback-fab`
**PR:** https://github.com/kirankbs/fastrack-deutsch/pull/85
**CI Status:** All checks green (Typecheck + Tests, E2E Tests, Vercel)

## Files Changed

- `apps/web/src/components/FeedbackFAB.tsx` — client component, FAB + modal
- `apps/web/src/lib/actions/feedback.ts` — server action, GitHub REST API call
- `apps/web/src/app/layout.tsx` — mounts `<FeedbackFAB />` globally
- `apps/web/src/__tests__/feedback/FeedbackFAB.test.tsx` — 17 component tests
- `apps/web/src/__tests__/feedback/submitFeedback.test.ts` — 11 server action unit tests
- `apps/web/README.md` — created; `GITHUB_TOKEN` setup docs

## AC to Code/Test Mapping

| AC Bucket | Implementation |
|-----------|---------------|
| FAB renders fixed bottom-right | `FeedbackFAB.tsx` — `fixed z-50 bottom-6 right-4 md:right-6 w-14 h-14` |
| Modal opens on FAB click | `openModal` callback + `setOpen(true)`; test: "opens modal when FAB is clicked" |
| Form fields: title (max 80), description (min 20, live counter), category select | `FeedbackFAB.tsx` inputs + counters; tests: blocks submit when title empty, desc too short, live counter |
| Category maps to GitHub label | `feedback.ts` — `CATEGORY_LABELS` maps bug→"bug", feature→"enhancement", question→"question" |
| Submit / Cancel / Retry buttons | All three buttons with `data-testid`; all tested |
| Success state shows issue number | `feedback-success` + `feedback-issue-number`; test: "shows success state with issue number" |
| States: idle / submitting / success / error | `ModalState` union type drives conditional rendering |
| Double-click prevention | `disabled={modalState === "submitting"}`; test: "disables submit button while submitting" |
| Escape closes modal | `document.addEventListener("keydown")` effect; test: "closes modal when Escape is pressed" |
| Focus trap | `keydown` Tab handler on dialog; `firstFocusableRef` auto-focused on open |
| `aria-modal`, `aria-labelledby` on dialog | Confirmed in HTML; test: "dialog has aria-modal and aria-labelledby" |
| `role="alert"` on errors | Inline validation errors and error banner use `role="alert"` |
| 44px minimum touch target | All buttons have `min-h-[44px]`; FAB is `h-14` (56px); test: "FAB button has minimum 44px height" |
| Colors from design tokens only | Only Tailwind CSS 4 token classes used — no hex |
| Server action builds title/body/labels | `feedback.ts` builds GitHub issue body with route, UA, device, commit SHA, timestamp |
| 10s AbortController timeout | `setTimeout(() => controller.abort(), 10_000)`; test: "AbortError → returns timeout error" |
| Returns `{ issueNumber }` or `{ error }` | `FeedbackResult` interface; all paths tested |
| Missing token → friendly error | `if (!token) return { error: "...not configured." }`; test: "missing token returns specific error" |
| 401 / 422 / 5xx → typed errors | Conditional on `response.status`; all three tested |
| Body appends route / UA / device / SHA / timestamp | Verified in "includes route, user-agent, device, and commit SHA in body" |
| Mounted in root layout | `layout.tsx` — `import { FeedbackFAB }` + `<FeedbackFAB />` after `<Footer />` |
| GITHUB_TOKEN docs | `apps/web/README.md` — local `.env.local`, Vercel env vars, PAT scope, graceful degradation |

## Known Gaps / Follow-ups

- E2E test for FAB at mobile/desktop breakpoints was not added (AC specifies viewport test via Playwright); the existing E2E suite has no FeedbackFAB spec. Could be added as a follow-up.
- The FAB is visible on all pages including the exam in-progress view. A future enhancement could hide it during active exam sessions to reduce distraction.
- `apps/web/` had no ESLint config — `pnpm lint` prompts interactively. Pre-existing issue, not introduced here.

## How to Test Locally

```bash
# 1. Create .env.local with a GitHub token that has issues:write on kirankbs/fastrack-deutsch
echo "GITHUB_TOKEN=ghp_your_token" > apps/web/.env.local

# 2. Start dev server
pnpm dev:web

# 3. Open http://localhost:3000 — chat bubble appears bottom-right

# 4. Run unit + component tests
pnpm --filter @fastrack/web test

# 5. Typecheck
pnpm --filter @fastrack/web typecheck

# 6. Production build
pnpm --filter @fastrack/web build
```
