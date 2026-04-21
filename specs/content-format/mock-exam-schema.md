# Mock Exam Schema

> **Last synced:** 2026-04-20 | **Source:** `packages/types/src/exam.ts`

## Purpose

Canonical TypeScript interfaces for all mock exam JSON files. Every `mock_XX.json` under `apps/mobile/assets/content/{level}/` is expected to conform to `MockExam`. The schema is shared across the mobile and web apps via `@fastrack/types`.

## Interface

### Top-level `MockExam`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | `{LEVEL}_mock_{NN}` — e.g. `B2_mock_01` |
| `level` | `Level` | yes | `A1 \| A2 \| B1 \| B2 \| C1` |
| `title` | `string` | yes | Display title, e.g. `"B2 Übungstest 1: Beruf & Arbeitswelt"` |
| `version` | `number` | yes | Content version; increment on breaking changes |
| `sections.listening` | `ListeningSection` | yes | |
| `sections.reading` | `ReadingSection` | yes | |
| `sections.writing` | `WritingSection` | yes | |
| `sections.sprachbausteine` | `SprachbausteineSection` | no | B1+ only |
| `sections.speaking` | `SpeakingSection` | yes | |

### `ListeningPart`

| Field | Type | Notes |
|-------|------|-------|
| `audioFile` | `string` | Relative path from app root, e.g. `assets/audio/B2/mock01/listening_part1.mp3` |
| `playCount` | `number` | Enforced by the exam runner. **B2 rule: always 1.** A1/A2: 2, B1: 1. |
| `questions[].audioTimestamp` | `number?` | Seconds into the audio where the answer evidence occurs. Used for post-exam review navigation. |

### `SprachbausteineQuestion`

| Field | Type | Notes |
|-------|------|-------|
| `type` | `'mcq' \| 'word_bank'` | Teil 1 = `mcq`, Teil 2 = `word_bank` |
| `options` | `string[]` | **B2 Teil 1: exactly 4 options** (`a/b/c/d`). **B1 Teil 1: 3 options** (`a/b/c`). Teil 2 (all levels): 15 options (`a–o`), 5 unused per text. |

### `WritingTask`

`type` field valid values: `'form_fill' | 'short_message' | 'letter' | 'essay'`. B2 writing uses `'letter'` (Beschwerdebrief/formeller Brief) and `'essay'` (Stellungnahme). The B2 task presents **two prompts (A and B)** — the candidate selects one. [TODO: verify with user — schema has a single `WritingTask`, but B2 mock_01 wraps both prompts inside one task; confirm whether future mocks should use two separate `WritingTask` entries or keep both prompts in one task's `prompt` field.]

### `SpeakingSection`

| Field | Notes |
|-------|-------|
| `prepTimeMinutes` | B1 and B2: 20 min. A1, A2, C1: 0. |
| `parts[].type` | B2 uses `'presentation'`, `'discussion'`, `'planning'`. A1/A2 use `'introduce'`, `'picture_cards'`, `'und_du'`. |

## Key Behaviors

### Level-gated `sprachbausteine`
The field is `optional` on `MockExam.sections`. A1 and A2 mocks omit it entirely. B1+ mocks must include it. The exam runner should guard against absent `sprachbausteine` rather than assuming presence.

### `playCount` enforcement
The `playCount` value in each `ListeningPart` is the single source of truth for how many times the audio may play during the exam. The exam runner is expected to read this field and disable replay once the count is reached. Content authors must not override the level rule in JSON — B2 mocks must always carry `playCount: 1`.

### Question IDs
IDs follow the pattern `{LEVEL}_m{NN}_{SectionCode}{PartNum}_q{ItemNum}` — e.g. `B2_m01_L1_q3`. The section codes are `L` (Listening), `R` (Reading), `SB` (Sprachbausteine), `W` (Writing), `SP` (Speaking). IDs must be unique within a mock and stable across versions unless the question changes materially.

### `explanation` field (all question types)
Mandatory on every question. Serves two purposes: (1) post-attempt review in the app, (2) makes the mock function as a teaching artefact. At B2, explanations are expected to name the specific grammar feature tested (e.g. "Passiv-Perfekt", "Partizipialattribut", "Funktionsverbgefüge") and gloss any above-B2 vocabulary inline.

## Edge Cases

- **Stub files:** A `_stub: true` key at the top level indicates placeholder content. The exam runner (and validator) must reject stubs and not expose them as playable mocks. Stub files have no `sections` key.
- **Missing audio:** If the MP3 referenced by `audioFile` does not exist, the exam runner must surface a clear error rather than silently failing. The listening section cannot proceed without audio. [TODO: verify with user — confirm how the web app handles missing audio vs mobile.]
- **Word bank distractors:** Teil 2 `word_bank` questions all share the same 15-option list even though only 10 blanks exist. The 5 unused words are intentional distractors. Renderers must display the full 15-option list once per part, not per question.

## Dependencies

- `@fastrack/types` — this file IS the types package; consumed by both apps and `@fastrack/core`
- `packages/content/src/catalog.ts` — uses `Level` from this file
- `apps/mobile/src/services/database.ts` — persists `ExamAttempt` which mirrors section score fields from this schema

## Notes

- B2 Sprachbausteine Teil 1 uses **4 options (a/b/c/d)**, not 3. This is the primary structural difference from B1 Teil 1 (3 options). Rendering components must not hardcode option count.
- `ReadingText.type` enum (`'email' | 'ad' | 'notice' | 'article' | 'letter'`) does not currently include a `'heading'` type. Lesen Teil 1 at B2 involves matching 10 headings to 5 texts with 5 distractors — the headings are stored as question `questionText` fields, not as `ReadingText` entries. [TODO: verify with user — this works for content storage but may need a dedicated heading type for renderer clarity.]
