# Handoff: Dashboard with Exam Progress + Quick Actions

**PR:** #22  
**Branch:** `dashboard-study-plan`  
**Issue:** #20  

## What was built

Replaced the landing page at `/` with a data-driven dashboard that reads exam session data from sessionStorage.

### Components created (`apps/web/src/components/dashboard/`)

- **Dashboard.tsx** — main client component with level selector tabs (A1 default), computes readiness, completed mocks, recent results, study stats from sessionStorage
- **ReadinessGauge.tsx** — circular SVG gauge with 4 levels (Aufbau/Entwicklung/Fast bereit/Prüfungsbereit), uses `--color-readiness-*` tokens
- **QuickActions.tsx** — 4 action cards linking to /exam, /vocab, /grammar, and "Weiter lernen" (most recently started incomplete mock or /exam fallback)
- **RecentResults.tsx** — lists mocks with any submitted section, shows section count, average score, pass/fail badge for complete mocks; empty state with CTA
- **StudyStats.tsx** — completed mocks, sections count, average score, estimated time

### Page updated

- `apps/web/src/app/page.tsx` — server shell importing client Dashboard component

### Tests added (`apps/web/src/__tests__/dashboard/`)

- Dashboard.test.tsx (9 tests) — empty state, mixed completion states, level switching, "Weiter lernen" resolution, study stats computation
- ReadinessGauge.test.tsx (6 tests) — all 4 readiness levels + edge values
- QuickActions.test.tsx (2 tests) — rendering + route linking

## Quality

- Typecheck: 0 errors
- Tests: 103/103 passing (13 files), 17 new dashboard tests
- All data from sessionStorage — no new storage keys, no network calls
- Responsive: single-column mobile, 2-col tablet, full grid desktop
- All interactive elements have `data-testid`

## What's NOT included

- E2E Playwright tests (would need a separate issue)
- No changes to exam flow or session storage format
