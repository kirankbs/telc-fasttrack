## Handoff: Feedback FAB Vercel Blob Attachments + Cleanup Cron

**Branch:** web-feedback-fab-blobs  
**PR:** https://github.com/kirankbs/fastrack-deutsch/pull/88  
**CI:** Running (255/255 tests pass locally)  
**Issue:** #87  
**Date:** 2026-04-21

---

## Files changed

- `apps/web/src/components/FeedbackFAB.tsx` — added file input, per-file validation (max 5 / 10 MB), Vercel Blob client upload on submit, attachmentsFailed warning in success state
- `apps/web/src/lib/actions/feedback.ts` — extended params with `attachments?`, builds markdown image/failure section in GH issue body, returns `attachmentsFailed`
- `apps/web/src/app/api/blob-upload/route.ts` — NEW: client upload token endpoint using `handleUpload`, restricts to `feedback-attachments/` prefix
- `apps/web/src/app/api/cron/cleanup-feedback-attachments/route.ts` — NEW: weekly cron, deletes blobs >7 days, `CRON_SECRET` auth
- `apps/web/vercel.json` — NEW: cron schedule `0 3 * * 1`
- `apps/web/README.md` — updated env var docs (BLOB_READ_WRITE_TOKEN, CRON_SECRET)
- `apps/web/src/__tests__/feedback/blobUploadRoute.test.ts` — NEW: 4 tests
- `apps/web/src/__tests__/feedback/cleanupCronRoute.test.ts` — NEW: 5 tests
- `apps/web/src/__tests__/feedback/FeedbackFAB.test.tsx` — added 3 attachment tests + blob mock
- `apps/web/src/__tests__/feedback/submitFeedback.test.ts` — added 5 attachment tests

---

## AC → code mapping

| AC bullet | Where |
|-----------|-------|
| Up to 5 files, 10 MB each | `FeedbackFAB.tsx:handleFileChange` |
| Client-side per-file error | `FeedbackFAB.tsx` attachment list |
| Upload to Vercel Blob before submit | `FeedbackFAB.tsx:handleSubmit` |
| Partial success — null urls | `FeedbackFAB.tsx` + `feedback.ts:attachmentSection` |
| attachmentsFailed warning | `FeedbackFAB.tsx` success state |
| Cron auth (CRON_SECRET) | `cleanup-feedback-attachments/route.ts` |
| Cron deletes >7 day blobs | `cleanup-feedback-attachments/route.ts` |
| vercel.json cron schedule | `apps/web/vercel.json` |
| Env var docs | `apps/web/README.md` |

---

## New env vars

| Var | Where to get | Where to add |
|-----|-------------|--------------|
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → Blob store | Vercel (Production + Preview + Development) + `.env.local` |
| `CRON_SECRET` | `openssl rand -hex 32` | Same |

---

## Manual test steps

1. Add `BLOB_READ_WRITE_TOKEN` and `CRON_SECRET` to `.env.local`
2. `pnpm dev:web`
3. Click FAB → attach a screenshot → submit → verify GH issue has image embedded
4. Attach 6 files → verify error shown, submit blocked
5. Attach >10 MB file → verify per-file error, submit blocked
6. Remove file → verify error clears, submit re-enabled
7. Test cron locally: `curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/cleanup-feedback-attachments`
