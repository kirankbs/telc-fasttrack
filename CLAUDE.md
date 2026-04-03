# Telc-FastTrack

German exam prep app for telc A1 through C1. Offline-first, content-driven. "Spend X hours. Pass telc."

## Stack

- **Framework:** Expo SDK 52+ / React Native / TypeScript
- **Navigation:** expo-router (file-based) with bottom tabs — 5 tabs: Home, Practice, Exam, Resources, Settings
- **Database:** expo-sqlite (offline-first, no backend)
- **State:** React Context + useReducer
- **Animations:** react-native-reanimated (never use legacy Animated API)
- **Audio:** expo-audio (listening playback) + expo-speech (vocabulary TTS)
- **Speech recognition:** @jamsch/expo-speech-recognition (speaking practice)

## Architecture

Content is bundled JSON + pre-generated MP3 audio. No network calls in core learning flow.

- **Mock exams:** `assets/content/{level}/mock_XX.json` — 10 per level, target
- **Audio:** `assets/audio/{level}/mockXX/` — pre-generated Google Cloud WaveNet MP3s
- **Vocabulary:** `src/data/vocabulary/{level}_vocabulary.json`
- **Grammar:** `src/data/grammar/{level}_grammar.json`
- **DB:** 8 SQLite tables (see `src/services/database.ts`)

## Key Files

| File | Purpose |
|------|---------|
| `src/types/exam.ts` | MockExam TypeScript interfaces — canonical definition |
| `src/utils/theme.ts` | Design tokens — NEVER hardcode hex values |
| `src/services/database.ts` | SQLite schema + migration support |
| `src/services/scoringEngine.ts` | telc scoring logic (60% pass threshold per section) |
| `src/services/spacedRepetition.ts` | SM-2 algorithm for vocabulary flashcards |
| `src/services/studyPlanEngine.ts` | "X hours to pass" daily recommendations |
| `src/app/_layout.tsx` | Root layout (5 bottom tabs) |
| `telc-fasttrack-implementation-plan.md` | Full requirements doc — all agents reference this |

## Content Schema

Mock exams follow the `MockExam` TypeScript interface in `src/types/exam.ts`. See requirements doc section 7 for the full definition with all sub-types (ListeningSection, ReadingSection, WritingSection, SpeakingSection).

Mock exam file naming: `assets/content/A1/mock_01.json` through `mock_10.json`

## Testing

```bash
npx tsc --noEmit          # type check
npx jest --no-cache --forceExit   # run all tests
```

Tests live in `__tests__/` mirroring `src/` structure.

## Code Patterns

- **Colors/typography:** import from `src/utils/theme.ts` — never hardcode hex
- **Database:** always async (`database.execAsync`, `getAllAsync`, `getFirstAsync`)
- **Animations:** `useAnimatedStyle`, `useSharedValue`, `withSpring`, `withTiming` from reanimated
- **Navigation:** typed expo-router routes, cast as `any` only with explanatory comment
- **Content loading:** via `src/services/contentLoader.ts`
- **Timer:** via `src/services/timerService.ts` (per-section limits per telc spec)

## Telc Exam Key Facts

- **Pass threshold:** 60% in BOTH written AND oral (applies to all levels)
- **A1:** 65 min written, 15 min oral. Sections: Hören (20 min, ~24 pts), Lesen (25 min, ~24 pts), Schreiben (20 min, ~12 pts), Sprechen (15 min, ~24 pts)
- **Sprachbausteine:** B1+ only (cloze exercises)
- **Speaking prep time:** 20 min for B1 and B2, 0 for A1/A2/C1
- **A1 vocab target:** 650 words (Goethe A1 Wortliste)

## Priority

**A1 = 80% of initial effort.** Do not build A2+ content until A1 has 5+ complete mocks, 400+ vocabulary words, and end-to-end exam simulation validated.

## Agent Team

11 agents in `.claude/agents/`. Orchestrated via the `/deep-work` skill.

See `.claude/AGENTS-GUIDE.md` for the full trigger table and team overview.

## Git

- Never run `git add`, `git commit`, or `git push`
- Always provide the full command block at the end for the user to execute
- Feature work goes in `.worktrees/<branch-name>` — run `git fetch origin && git pull origin main` first
- No Co-Authored-By or AI attribution in commits
