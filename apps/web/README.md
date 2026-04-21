# Fastrack Deutsch — Web App

Next.js 15 / React 19 / Tailwind CSS 4 web application for telc German exam prep.

## Development

```bash
pnpm dev:web       # start dev server on port 3000
pnpm typecheck     # TypeScript check
pnpm test          # run Vitest unit tests
pnpm build         # production build
```

## Feedback FAB

A floating action button is mounted globally in the root layout. Users can report bugs, request features, or ask questions. Each submission creates a GitHub issue on `kirankbs/fastrack-deutsch` with metadata (route, browser, device type, commit SHA, timestamp).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | Fine-grained PAT, `issues: write` on `kirankbs/fastrack-deutsch` |
| `BLOB_READ_WRITE_TOKEN` | Yes (attachments) | Vercel Blob token — Vercel dashboard → Storage → Blob store |
| `CRON_SECRET` | Yes (cron) | Random secret: `openssl rand -hex 32` |

Add all three to Vercel (**Settings → Environment Variables**, Production + Preview + Development) and to `apps/web/.env.local`.

### Local setup

```
GITHUB_TOKEN=ghp_your_token_here
BLOB_READ_WRITE_TOKEN=vercel_blob_...
CRON_SECRET=your_random_secret
```

### Vercel Blob store

Create a Blob store in the Vercel dashboard under **Storage → Blob**, then copy the `BLOB_READ_WRITE_TOKEN`. Feedback attachments are stored under the `feedback-attachments/` prefix.

### Cleanup cron

A weekly cron runs every Monday at 03:00 UTC (`0 3 * * 1`) via `vercel.json`. It deletes all blobs in `feedback-attachments/` older than 7 days. The route is at `/api/cron/cleanup-feedback-attachments` and is protected by `Authorization: Bearer <CRON_SECRET>`.

### Graceful degradation

- `GITHUB_TOKEN` missing → FAB renders, submit returns friendly error, no issue created.
- `BLOB_READ_WRITE_TOKEN` missing → FAB renders, file uploads fail gracefully, issue still created without attachments.
