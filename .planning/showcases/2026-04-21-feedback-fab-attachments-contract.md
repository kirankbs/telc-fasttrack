# Contract: Feedback FAB Attachment Uploads + Cleanup Cron

**Issue:** #87
**Date:** 2026-04-21
**AC Comment:** https://github.com/kirankbs/fastrack-deutsch/issues/87#issuecomment-4287062476

## Summary

Add file attachment uploads (via Vercel Blob) to the existing Feedback FAB modal and a weekly cron route to prune old blobs. Client-side validation enforces max 5 files / 10 MB each. Partial upload failure still creates the GitHub issue with a warning. Cron at `0 3 * * 1` deletes blobs older than 7 days, protected by `CRON_SECRET`.

## AC Buckets

1. Happy path — files upload to Vercel Blob, URLs embedded as markdown images in GH issue
2. Empty states — no files = existing flow unchanged
3. Partial success — blob failure for some files, issue still created with warning
4. Client-side validation — max 5 files, 10 MB per file
5. Cron cleanup — weekly, deletes stale blobs, auth via CRON_SECRET
6. Error states — missing token, blob 4xx/5xx, cron auth failure
7. Accessibility — labels, aria-label on remove, role="alert" on errors
8. Configuration — BLOB_READ_WRITE_TOKEN, CRON_SECRET, vercel.json, README docs
9. Test plan — 9 scenarios covering all paths

## Quality Gates

- exam-tester layer-b
- compliance-guardian scan
