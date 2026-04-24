# Handoff — Mobile Hamburger Menu (2026-04-23)

**PR:** https://github.com/kirankbs/fastrack-deutsch/pull/97  
**Branch:** `fix-mobile-hamburger-menu`  
**Issues closed:** #96, #86, #90, #91, #93, #95  
**CI:** All 5 checks green (Typecheck + Tests, E2E Tests, 3x Vercel)

## What changed

The mobile hamburger button in `apps/web/src/app/layout.tsx` was a pure visual placeholder — no `onClick`, no state, no menu panel. Six duplicate bug reports confirmed users could not navigate on mobile at all.

### Fix

Extracted `NavHeader` out of `layout.tsx` (which is a Server Component and cannot hold `useState`) into a new `"use client"` component at `apps/web/src/components/NavHeader.tsx`. A small `MobileNavMenu` inline section within that component handles the drawer.

## Files touched

| File | Change |
|------|--------|
| `apps/web/src/components/NavHeader.tsx` | New — client component with full hamburger state |
| `apps/web/src/app/layout.tsx` | Imports `NavHeader` from above; removes 50-line inline placeholder |
| `apps/web/src/__tests__/NavHeader.test.tsx` | New — 17 component tests |

## What the menu does

- Opens on hamburger tap; renders Dashboard, Mock Exams, Vocabulary, Grammar links
- Closes on: Escape, click/pointer outside, link navigation, second hamburger tap
- Focus management: first link focused on open, hamburger refocused on Escape
- `aria-expanded`, `aria-controls="mobile-nav-menu"`, `role="dialog"`, `aria-label` on panel
- Hamburger and all links: `min-h-[44px]` (WCAG 2.1 AA touch target)
- Desktop (`sm:` breakpoint and up) unchanged — the existing flex nav still renders

## Test coverage

17 NavHeader tests covering:
- Open/close state + aria-expanded
- Escape key dismissal
- Outside-click (pointerdown) dismissal
- Link-click dismissal
- All four nav links present with correct hrefs
- role/aria-label on panel
- aria-controls on hamburger
- 44px touch target class on hamburger and links

Pre-existing failing test (`FeedbackFAB — attachments > does not show attachmentsFailed warning`) was already failing on `main` before this branch — not a regression.

## Follow-ups

None required. The sticky `z-50` header and `z-40` menu panel layer correctly above content. The FeedbackFAB (bottom-right, `z-50`) does not clash.
