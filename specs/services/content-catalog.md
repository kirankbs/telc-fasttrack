# Content Catalog

> **Last synced:** 2026-04-20 | **Source:** `packages/content/src/catalog.ts`

## Purpose

Provides a flat list of all mock exam metadata entries — one per mock across all five levels. Used by the UI to populate level screens and by the content loader to map level+mockNumber to a file path. Does not load or validate JSON content; that is the content loader's job.

## Interface

### `MockExamEntry`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | `{LEVEL}_mock_{NN}` — matches the `id` field inside `mock_NN.json` |
| `level` | `Level` | One of `A1 \| A2 \| B1 \| B2 \| C1` |
| `mockNumber` | `number` | 1-based index |
| `title` | `string` | Generated as `"{LEVEL} Übungstest {N}: {theme}"` |

### Key functions

```ts
getMocksForLevel(level: Level): MockExamEntry[]
getAvailableLevels(): Level[]
```

`MOCK_EXAM_CATALOG` is the pre-built flat array — 50 entries (10 per level × 5 levels).

## Key Behaviors

### Title generation
Titles are generated programmatically by `generateEntries()`. A hardcoded `titles` map provides the theme suffix per level. The theme is positional — index 0 = mock_01 theme, index 9 = mock_10 theme.

**Current B2 title map (index order):**
```
0: Wissenschaft       mock_01
1: Beruf              mock_02
2: Bildung            mock_03
3: Medien             mock_04
4: Umwelt             mock_05
5: Gesellschaft       mock_06
6: Kultur             mock_07
7: Wirtschaft         mock_08
8: Politik            mock_09
9: Technologie        mock_10
```

**Note:** `mock_01.json` sets its own `title` to `"B2 Übungstest 1: Beruf & Arbeitswelt"` in the JSON file itself, but the catalog generates `"B2 Übungstest 1: Wissenschaft"`. These are out of sync. The catalog title is what the UI renders on the level screen; the JSON title is what the exam runner displays during the exam. If these should match, the B2 titles map index 0 needs updating from `"Wissenschaft"` to `"Beruf & Arbeitswelt"`. [TODO: verify with user — confirm whether catalog titles should match JSON titles, and if so update index 0 of the B2 array.]

## State / Data Flow

The catalog is a static in-memory array — no async loading, no DB. It is imported directly at build time by any component that needs to list available mocks. Entry count and theme strings change only when catalog.ts is edited.

## Edge Cases

- **Stub mocks:** The catalog always lists all 50 entries regardless of whether the underlying JSON exists or is a stub. The UI layer is responsible for checking stub status before launching an exam.
- **Level not found:** `getMocksForLevel` returns an empty array for any `Level` value that has no entries — currently impossible given the static data, but safe for future partial catalogs.
- **Title/JSON mismatch:** See note above. The catalog title and the JSON `title` field are independently maintained. They can diverge silently.

## Dependencies

- `@fastrack/types` — imports `Level` type
- Used by the exam list screen (mobile) and level selection screen (web)

## Notes

- The catalog currently has no `isAvailable` or `isStub` flag. Distinguishing playable from stub mocks requires reading the JSON file. [TODO: verify with user — consider adding an `available: boolean` field to `MockExamEntry` driven by a build-time manifest, rather than requiring runtime file access to check stub status.]
