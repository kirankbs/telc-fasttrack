// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

// -----------------------------------------------------------------------------
// fs-import guard — https://github.com/kirankbs/fastrack-deutsch/issues/110
//
// Four production hangs in 48 hours (2026-04-24/25) all had the same root cause:
//   #102 (fixed PR #103) — loadMockExam called readFile() in /exam routes
//   #104 (fixed PR #105) — loadMockExam called readFile() in /exam subroutes
//   #106 (fixed PR #107) — loadGrammar called readFile() in /grammar routes
//   #108 (fixed PR #109) — loadMockExam called readFile() in /exam/* subroutes
//
// Vercel does not trace sibling-package JSON paths into Lambda bundles, so any
// fs.readFile() against ../mobile/... fails silently with an 8-second cold-start
// hang rather than an immediate error. The fix in every case was to switch to
// static imports via @fastrack/content, which the bundler traces at build time.
//
// This rule blocks re-introducing that pattern in pages, layouts, routes, and
// load* helpers. If you need to add a new fs use case, add an inline disable
// comment with a link explaining why (see the audio API allowlist below).
//
// Audio API allowlist: apps/web/src/app/api/audio/[...path]/route.ts is exempt
// because it serves binary MP3 files from disk — a legitimate fs use case that
// cannot be replaced with static imports. See issue #110 for rationale.
// -----------------------------------------------------------------------------

const FS_MODULES = ['fs', 'fs/promises', 'node:fs', 'node:fs/promises'];

const FS_GUARD_MESSAGE =
  'Do not import fs in app routes or load helpers — use static imports from ' +
  '@fastrack/content instead. ' +
  'Prior incidents: #102, #104, #106, #108 (see https://github.com/kirankbs/fastrack-deutsch/issues/110).';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,

  // TypeScript support — provides the parser so .ts/.tsx files are understood.
  ...tseslint.configs.recommended,

  // React Hooks — register the plugin so inline disable comments referencing
  // react-hooks/exhaustive-deps are resolved. Only the two classic rules are
  // enabled; the stricter v7 rules (set-state-in-effect, refs, immutability)
  // are disabled to avoid surfacing pre-existing patterns that the codebase
  // was intentionally written with.
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Global ignores — files the guard must never touch.
  {
    ignores: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**',
      'eslint.config.mjs',
      'next.config.*',
      'tailwind.config.*',
      'postcss.config.*',
      'vitest.config.*',
      'scripts/**',
    ],
  },

  // Tune noisy built-in rules that produce false positives on this codebase.
  {
    rules: {
      // Produces false positives on conditional-branch assignment patterns
      // (e.g. Dashboard.tsx where ctaMockNumber/continueHref are initialized
      // then conditionally overwritten inside if/else before being returned).
      'no-useless-assignment': 'off',
    },
  },

  // fs guard: only applies to the exact file patterns that caused the incidents.
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/page.ts',
      'src/app/**/route.ts',
      'src/app/**/layout.tsx',
      'src/app/**/layout.ts',
      'src/lib/load*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: FS_MODULES.map((name) => ({
            name,
            message: FS_GUARD_MESSAGE,
          })),
        },
      ],
    },
  },
];
