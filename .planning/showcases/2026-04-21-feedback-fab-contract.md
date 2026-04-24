# Contract: Feedback FAB (Issue #84)

**Date:** 2026-04-21
**Issue:** https://github.com/kirankbs/fastrack-deutsch/issues/84
**AC Comment:** https://github.com/kirankbs/fastrack-deutsch/issues/84#issuecomment-4286857451
**Scope:** Web only — FeedbackFAB component + server action creating GitHub issues

## Summary

Floating action button mounted globally in web layout. Opens modal with title/description/category form. Server action POSTs to GitHub REST API to create issue on kirankbs/fastrack-deutsch. No auth, no Supabase, no attachments (MVP dev-only).

## Key AC Buckets

- Happy path: FAB renders, modal opens, form submits, issue created with metadata + labels
- Empty states: fields empty on open, submit disabled until valid
- Edge cases: char limits, double-click prevention, long descriptions, scrollable modal
- Error states: missing token, 401/422/5xx, timeout, retry flow
- Accessibility: WCAG 2.1 AA — focus trap, Escape, aria-labels, 44px target, contrast
- Configuration: GITHUB_TOKEN PAT, Vercel env vars, .env.local docs
- Test plan: 12 scenarios covering submit, validation, errors, viewports, a11y, metadata
