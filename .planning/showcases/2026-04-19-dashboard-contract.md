# Dashboard with Exam Progress Contract — Issue #20
## feat(web): dashboard with exam progress + quick actions

**Date:** 2026-04-12  
**Scope:** `apps/web/src/app/page.tsx`, `apps/web/src/lib/examSession.ts`  
**Dependencies:** `@telc/core` (getReadinessLevel, SectionScore), `@telc/content` (getMocksForLevel), `@telc/config` (LEVEL_CONFIG)

---

## Data Sources & Constraints

- All dashboard data comes from `sessionStorage` via `getSession(mockId)` / `hasAnySection()` from `examSession.ts`
- Mock catalog via `getMocksForLevel(level)` from `@telc/content`
- Readiness derived from `getReadinessLevel(percentage)` from `@telc/core` (thresholds: >=75% ready, >=60% almost, >=40% developing, <40% building)
- No network calls, no database, no auth — single-user, single-tab session data only
- Page must be a client component (`'use client'`) since it reads sessionStorage

sessionStorage key pattern: `exam_session_{mockId}`

```typescript
// from examSession.ts — read-only for dashboard
getSession(mockId: string): ExamSessionState | null
hasAnySection(session: ExamSessionState): boolean
isSessionComplete(session: ExamSessionState): boolean

// from @telc/content
getMocksForLevel(level: Level): MockExamEntry[]  // returns 10 entries per level

// from @telc/core
getReadinessLevel(percentage: number): 'building' | 'developing' | 'almost' | 'ready'
```

---

## Acceptance Criteria

### Happy Path — Active Session with Data

- [ ] The dashboard replaces the current landing page at `/` (file: `apps/web/src/app/page.tsx`)
- [ ] A level selector defaults to A1; switching levels updates all dashboard widgets for the selected level
- [ ] **Readiness gauge**: computes average percentage across all completed mock sections for the selected level, passes it to `getReadinessLevel()`, and displays the result as a labeled visual indicator (one of: Aufbau / Entwicklung / Fast bereit / Prüfungsbereit)
- [ ] **Completed mocks**: shows `X / 10 Übungstests abgeschlossen` — a mock counts as completed only if `isSessionComplete(session)` returns true (all 4 sections submitted)
- [ ] **Recent results**: lists mocks that have at least one submitted section (`hasAnySection()`), showing mock title, completed section count out of 4, and per-section scores from `session.sections[key].score`
- [ ] **Quick action cards**: 4 cards — "Start Übungstest" → `/exam`, "Vokabeln üben" → `/vocab`, "Grammatik" → `/grammar`, "Weiter lernen" → `/exam/[mockId]` linking to the first incomplete mock (has some but not all sections)
- [ ] **Study stats**: sections completed count (total across all mocks for level), average score percentage across completed sections, estimated time spent (sum of section durations: Hören 20min, Lesen 25min, Schreiben 20min, Sprechen 15min per completed section)

### Empty / Fresh State — No sessionStorage Data

- [ ] On first visit (no exam sessions in sessionStorage), the dashboard renders without errors
- [ ] Readiness gauge shows "Aufbau" (building) with 0% and a visual empty state
- [ ] Completed mocks shows `0 / 10 Übungstests abgeschlossen`
- [ ] Recent results section shows an empty state message: "Noch keine Ergebnisse — starte deinen ersten Übungstest!" with a CTA linking to `/exam`
- [ ] "Weiter lernen" quick action falls back to `/exam` when no incomplete mock exists
- [ ] Study stats show all zeros (0 sections, 0% average, 0h time)

### Edge Cases — Mixed Completion States

- [ ] A mock with 2 of 4 sections completed appears in recent results as "2/4 Sektionen" — it does NOT count toward the completed mocks total
- [ ] A mock with all 4 sections completed appears in both recent results AND increments the completed count
- [ ] Readiness gauge averages only completed sections (not zeros for unstarted mocks) — if the user scored 80% on their only completed section, readiness is based on 80%, not 80%/10
- [ ] If multiple mocks have partial progress, "Weiter lernen" links to the one with the most recent `startedAt` timestamp
- [ ] Level switching resets all widgets — A1 data does not bleed into A2 view

### Responsiveness

- [ ] Mobile (< 640px): single-column stack — readiness gauge full width, quick actions stack vertically, recent results as a card list
- [ ] Tablet (640px-1024px): 2-column grid for quick actions, side-by-side readiness + completed count
- [ ] Desktop (> 1024px): full dashboard grid — readiness and stats in a top row, quick actions in a 4-column row, recent results as a table or card grid below

### Design Tokens

- [ ] All colors from `@telc/config` LEVEL_CONFIG and design tokens — no hardcoded hex values
- [ ] Level badge uses `LEVEL_CONFIG[level].color` for background
- [ ] Readiness gauge uses semantic colors: building = muted/gray, developing = amber, almost = blue, ready = green (from theme tokens, not hardcoded)

### Regression

- [ ] Existing exam flow (`/exam`, `/exam/[mockId]`, section pages, results page) is unaffected
- [ ] No new sessionStorage keys introduced — dashboard reads existing `exam_session_{mockId}` keys only
- [ ] Navigation links in the app shell still work after the home page replacement

### Tests

- [ ] Unit test: dashboard renders without crashing when sessionStorage is empty
- [ ] Unit test: dashboard correctly computes completed mock count from mixed session states
- [ ] Unit test: readiness level maps correctly for edge values (0%, 40%, 60%, 75%, 100%)
- [ ] Unit test: "Weiter lernen" resolves to the most recently started incomplete mock
- [ ] E2E (Playwright): load dashboard, verify empty state renders, start and complete one mock section, return to dashboard, verify recent results updates
