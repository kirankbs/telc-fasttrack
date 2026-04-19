# Handoff: fix(infra) Playwright Vercel Preview URL Detection

**Issue:** #9
**PR:** https://github.com/kirankbs/telc-fasttrack/pull/11
**Branch:** fix-playwright-url-detection
**Date:** 2026-04-13

## What was done

Replaced the hardcoded branch-pattern Vercel URL (`telc-fasttrack-git-${HEAD_REF}-kirankbs.vercel.app`) with a GitHub Deployments API lookup. The new step polls `GET /repos/{owner}/{repo}/deployments?sha={sha}&environment=Preview` to get the deployment ID, then fetches `GET /repos/{owner}/{repo}/deployments/{id}/statuses` for the actual `environment_url`. This handles Vercel's non-deterministic preview URL patterns correctly.

Also removed the unused `HEAD_REF` env var from the job-level `env` block.

## Files changed

- `.github/workflows/playwright.yml` — replaced "Wait for Vercel Preview" step with "Get Vercel Preview URL" step using Deployments API

## CI status

- Vercel: pass (deployment completed)
- Vercel Preview Comments: pass
- Typecheck + Tests: **failing — pre-existing on main** (mobile timerService.ts type errors, expo tsconfig `--module` flag issue, unrelated to this PR)
- E2E Tests: **failing — expected on workflow-only PR** (no Vercel preview deployment triggered since no `apps/**` or `packages/**` files changed; new step correctly exits after one polling attempt rather than using a guessed URL)

## Verification on next real PR

The fix will be proven on any subsequent PR that touches `apps/**` or `packages/**`, which will trigger a Vercel preview deployment. The new step will find the actual `environment_url` from the Deployments API and set `PLAYWRIGHT_TEST_BASE_URL` correctly.

## Pre-existing issues to address separately

- `apps/mobile/src/services/timerService.ts` — `createTimerState` and `tickTimer` not found (TS2304)
- expo tsconfig.base.json `--module` flag incompatibility with current TypeScript version
