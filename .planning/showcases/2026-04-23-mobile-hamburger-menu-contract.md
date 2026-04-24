# Contract: Mobile Hamburger Menu Fix (#96)

**Issue:** #96 — "Can't click expand button"
**Date:** 2026-04-23
**Duplicates closed:** #86, #90, #91, #93, #95

## Root Cause
`apps/web/src/app/layout.tsx:84-92` has a hamburger `<button>` with no onClick, no state, no menu panel. Layout.tsx is a Server Component so interactive logic must be extracted to a Client Component.

## AC Comment
https://github.com/kirankbs/fastrack-deutsch/issues/96#issuecomment-4302034416

## Quality Gates
- [ ] compliance-guardian scan (no auth/PII involved — quick pass)
- [ ] Manual viewport test: mobile Chrome, Safari
