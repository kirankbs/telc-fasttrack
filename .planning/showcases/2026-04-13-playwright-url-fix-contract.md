# Acceptance Criteria — fix(infra): playwright.yml Vercel preview URL detection
## Issue #9

**Date:** 2026-04-13  
**Scope:** `.github/workflows/playwright.yml` — replace hardcoded URL with GitHub Deployments API lookup

---

## Acceptance Criteria

### URL resolution

- [ ] The workflow no longer contains a hardcoded `https://telc-fasttrack-git-*` URL pattern
- [ ] A step queries `gh api repos/{owner}/{repo}/deployments?sha=${{ github.sha }}&environment=Preview` and extracts `.[0].id`
- [ ] A second call retrieves `repos/{owner}/{repo}/deployments/{id}/statuses` and reads `.[0].environment_url`
- [ ] `PLAYWRIGHT_TEST_BASE_URL` is set from `environment_url` before the Playwright step executes
- [ ] The URL used in the test run matches the actual Vercel deployment URL (hash-based slug, e.g. `telc-fasttrack-{hash}-fastrackdeutsch-6352s-projects.vercel.app`)

### Polling behaviour

- [ ] The step polls in a loop: up to 30 iterations × 10s sleep = 5-minute maximum wait
- [ ] Each iteration checks whether `environment_url` is non-empty before proceeding
- [ ] If `environment_url` is populated before 30 retries, the loop exits early (no unnecessary waiting)
- [ ] If the 5-minute timeout is reached without a URL, the step fails with a clear error message (not a silent Playwright run against an empty URL)

### Auth / token

- [ ] The API step has `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` in its `env` block so the `gh` CLI can authenticate
- [ ] No additional secrets beyond `GITHUB_TOKEN` are required for URL resolution

### Existing checks — no regression

- [ ] All other Playwright step configuration (browser install, test command, reporter, artifact upload) is unchanged
- [ ] The workflow still runs only on `pull_request` events (or whatever trigger was in place before)
- [ ] `VERCEL_TOKEN` is still passed to Playwright for any auth-gated pages that need it

### Evidence of fix

- [ ] A PR with this change produces a passing E2E run where the logged base URL is the actual Vercel deployment URL, not a 404 address
