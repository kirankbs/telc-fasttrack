## Handoff — #48 — Rebrand telc-fasttrack → Fastrack Deutsch

**PR:** https://github.com/kirankbs/telc-fasttrack/pull/49
**Branch:** `rebrand-to-fastrack-deutsch`
**Worktree:** `.worktrees/rebrand-to-fastrack-deutsch`

### What was built

Full product rebrand in a single atomic PR. Product name "telc FastTrack" → "Fastrack Deutsch"; scoped packages `@telc/*` → `@fastrack/*`. Descriptive "telc exam" references preserved as fair use. Historical `.planning/` content left untouched.

### Files changed (56 files, +146 / -138, one rename)

**Package names (4 files):**
- `packages/types/package.json` — `@telc/types` → `@fastrack/types`
- `packages/core/package.json` — name + `@telc/types` dep
- `packages/config/package.json` — name
- `packages/content/package.json` — name + `@telc/types` dep

**Workspace consumers + configs (7 files):**
- `package.json` (root) — name `telc-fasttrack` → `fastrack-deutsch`; `dev:web` / `dev:mobile` filters updated to `@fastrack/*`
- `apps/web/package.json` — name + 4 workspace deps
- `apps/mobile/package.json` — name + 4 workspace deps + jest `transformIgnorePatterns` regex (`@telc` → `@fastrack`)
- `apps/web/next.config.ts` — `transpilePackages` list
- `apps/mobile/tsconfig.json` — 8 `paths` entries
- `.github/workflows/ci.yml` — test filter `!@telc/mobile` → `!@fastrack/mobile`
- `pnpm-lock.yaml` — regenerated

**Import sweep (41 files in apps/ + packages/):**
- `apps/web/src/`: 22 files across `app/`, `components/`, `lib/`, `__tests__/`
- `apps/mobile/src/`: 9 files across `services/`, `types/`, `utils/`
- `packages/`: 3 files in `content/src/`, `core/src/`

**User-facing strings (4 files):**
- `apps/web/src/app/layout.tsx` — `<title>`, `description`, `openGraph` block (new), nav header, footer
- `apps/mobile/app.json` — `name: "Fastrack Deutsch"`, `slug: "fastrack-deutsch"`, `scheme: "fastrack-deutsch"`
- `apps/mobile/src/app/(tabs)/index.tsx` — hero title + subtitle
- `apps/mobile/src/services/database.ts` — DB filename `telcfasttrack.db` → `fastrackdeutsch.db`; source comment

**Doc rename (1 file):**
- `telc-fasttrack-implementation-plan.md` → `fastrack-deutsch-implementation-plan.md` via `git mv`; H1 updated, historical body text left as-is with a rename note at the top.

### Lockfile delta

`pnpm-lock.yaml` regenerated — package keys moved from `@telc/*` to `@fastrack/*`. No new transitive deps. `pnpm install` was clean (existing modules reused).

### Tests / typecheck / build

- `pnpm typecheck` — 2/2 green (`@fastrack/web`, `@fastrack/mobile`)
- `pnpm turbo run test --filter='!@fastrack/mobile'` (CI's filter) — 152/152 web tests pass; `@fastrack/core` and `@fastrack/content` have no tests
- `pnpm build` — web build green, 14 routes generated
- Mobile tests fail (pre-existing on main — `expo-modules-core` ESM parse issue); explicitly filtered out of CI

### PR + CI status

- PR: https://github.com/kirankbs/telc-fasttrack/pull/49
- Labels: `enhancement`, `P1`, `scope:infra`
- All 4 checks green:
  - Typecheck + Tests — pass (49s)
  - E2E Tests — pass (1m1s)
  - Vercel – telc-fasttrack-web — pass (preview deployed)
  - Vercel Preview Comments — pass

### Post-merge user actions

1. **Rename GitHub repo** (from repo root): `gh repo rename fastrack-deutsch` — moves the GitHub URL.
2. **Update local git remote**: `git remote set-url origin https://github.com/kirankbs/fastrack-deutsch.git`
3. **Update Vercel project name** via dashboard (current is `telc-fasttrack-web`).
4. **Point `fastrack-deutsch.de` DNS** to Vercel.
5. **Update `CLAUDE.md`** manually — still references `Telc-FastTrack` and `telc-fasttrack-implementation-plan.md`. Agent configs in `.claude/agents/*` and `.claude/skills/deep-work/SKILL.md` also reference the old brand; orchestrator may update these in a separate pass.
6. **Regenerate GitHub Pages / mobile app store metadata** if those channels exist.

### Risk notes

- **Expo `scheme` changed** from `telc-fasttrack` to `fastrack-deutsch` — any in-flight dev builds need a rebuild for deep links.
- **Mobile SQLite filename changed** from `telcfasttrack.db` to `fastrackdeutsch.db`. On first launch post-update, the app will create a fresh DB. No production users → no data migration concern. If pre-launch testers exist, they lose streak/attempt history.
- **iOS `bundleIdentifier` and Android `package` left as `com.telcfasttrack.app`** — deliberate. Changing published app-store identifiers breaks EAS/Expo build continuity and any pre-launch TestFlight / internal-track installs. Flagged as follow-up; change when the user is ready to do a clean rebuild + fresh app-store submission.

### Decisions made

- Kept iOS/Android bundle identifiers (out of issue AC and risky for app-store continuity) — flagged above.
- Mobile DB filename change: treated as in-scope ("any product-brand string (DB name?)") since no production users exist and the old name leaked the legacy brand. Acceptable loss of pre-launch tester state.
- Implementation plan doc: renamed via `git mv`; updated H1 + added rename note; left historical body text (feature comparisons, competitor analysis) under the old name to preserve authorial intent. Find-replace across the whole doc would have been noisier than useful.

### Follow-ups

- Bundle identifier migration (`com.telcfasttrack.app` → `com.fastrackdeutsch.app`) — needs a coordinated rebuild + store resubmit.
- `CLAUDE.md` + `.claude/agents/*` + `.claude/skills/deep-work/SKILL.md` rebrand (out of scope here per orchestrator instruction).
- Pre-existing mobile test infra issue (expo-modules-core ESM parse). Unrelated to this rebrand; already filtered out of CI on main.
