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

### Required environment variable

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Personal access token with `issues: write` scope on `kirankbs/fastrack-deutsch` |

The PAT must have **Contents: Read** and **Issues: Read and Write** permissions on the `kirankbs/fastrack-deutsch` repository (fine-grained PAT) or `repo` scope (classic PAT).

### Local setup

Add to `apps/web/.env.local`:

```
GITHUB_TOKEN=ghp_your_token_here
```

### Vercel setup

Add `GITHUB_TOKEN` as an environment variable in Vercel dashboard under **Settings → Environment Variables** for both **Production** and **Preview** environments.

### Graceful degradation

If `GITHUB_TOKEN` is missing or invalid, the FAB still renders. Submitting the form returns a friendly error message to the user rather than crashing. No issues are silently dropped.
