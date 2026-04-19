# A2 Mock Exams 01-03 Content Contract — Issue #21
## content(A2): first batch of A2 mock exams (Alltag, Familie, Wohnen)

**Date:** 2026-04-19  
**Scope:** `apps/mobile/assets/content/A2/mock_01.json` through `mock_03.json`  
**Themes:** Mock 01 = Alltag, Mock 02 = Familie, Mock 03 = Wohnen

---

## Acceptance Criteria

### 1. File Structure & Metadata

- [ ] Three files exist: `apps/mobile/assets/content/A2/mock_01.json`, `mock_02.json`, `mock_03.json`
- [ ] Each file parses as valid JSON and passes `validateMockExam()` from `@telc/content`
- [ ] Each mock has `level: "A2"`, `version: 1`, and a German title (`"Übungstest 1"` / `2` / `3`)
- [ ] Mock IDs follow pattern: `A2_mock_01`, `A2_mock_02`, `A2_mock_03`

### 2. Listening Section (Hören) — per mock

- [ ] `totalTimeMinutes: 20`
- [ ] Exactly 3 parts:
  - Teil 1: 5 questions, `playCount: 2` (telephone messages, MCQ a/b/c)
  - Teil 2: 5 questions, `playCount: 1` (radio announcements, MCQ a/b/c)
  - Teil 3: 5 questions, `playCount: 1` (short dialogues, MCQ a/b/c)
- [ ] Total: **15 questions** per mock
- [ ] Every question has `id`, `type`, `questionText`, `options` (3 choices for MCQ), `correctAnswer`, `explanation`
- [ ] `correctAnswer` value exists within `options` (or is a valid label like `"a"`, `"b"`, `"c"`)
- [ ] `audioFile` path set on each part (placeholder paths acceptable: `assets/audio/A2/mockXX/listening_partN.mp3`)
- [ ] Instructions in German with `instructionsTranslation` in English

### 3. Reading Section (Lesen) — per mock

- [ ] `totalTimeMinutes: 50` (shared timer with Writing per telc A2 spec)
- [ ] 3 parts with a combined minimum of **15 questions**:
  - Teil 1: Short texts (ads, notices) — MCQ, minimum 5 questions
  - Teil 2: Newspaper/article text — True/False, minimum 5 questions
  - Teil 3: Notices/signs — matching, minimum 5 questions
- [ ] Each part has at least one `ReadingText` with `id`, `type`, and `content` (the passage)
- [ ] `correctAnswer` matches a valid option for MCQ, or `"richtig"`/`"falsch"` for true_false
- [ ] Matching questions use `matchingSources` array with `id` and `label`

### 4. Writing Section (Schreiben) — per mock

- [ ] `totalTimeMinutes: 0` (timer shared with Reading; writing has no separate timer)
- [ ] Exactly 2 tasks:
  - Task 1: `type: "form_fill"` with `formFields` array (minimum 5 fields)
  - Task 2: `type: "short_message"` or `"letter"` with `prompt`, `promptTranslation`, `wordCountMin` (~30), `wordCountMax` (~50)
- [ ] Both tasks have `sampleAnswer` and `scoringCriteria` array
- [ ] Task 2 `requiredPoints` lists 3-4 content points the candidate must address

### 5. Speaking Section (Sprechen) — per mock

- [ ] `totalTimeMinutes: 15`, `prepTimeMinutes: 0` (A2 has no prep time)
- [ ] Exactly 3 parts:
  - Teil 1: `type: "introduce"` — Sich vorstellen
  - Teil 2: `type: "conversation"` — Ein Alltagsgespräch führen
  - Teil 3: `type: "planning"` — Etwas aushandeln
- [ ] Each part has `prompt`, `sampleResponse`, `evaluationTips` (array, min 3 items), `keyPhrases` (array, min 4 phrases)
- [ ] Instructions in German with English translation

### 6. Question ID Format

- [ ] All IDs follow `A2_mXX_SN_qN` pattern (e.g., `A2_m01_L1_q1`, `A2_m02_R3_q5`, `A2_m03_W1_q1`)
  - `XX` = mock number (01/02/03)
  - `S` = section code: `L` (Listening), `R` (Reading), `W` (Writing), `Sp` (Speaking)
  - `N` = part number, `qN` = question number
- [ ] Every question ID is unique across all three mocks (zero duplicates)
- [ ] No ID collisions with existing A1 mock IDs

### 7. CEFR A2 Vocabulary & Language Compliance

- [ ] All German text (questions, passages, explanations, prompts) uses CEFR A2 vocabulary and grammar
- [ ] Sentence structures are more complex than A1 (compound sentences, separable verbs, modal verbs, past tense) but stay below B1 (no Konjunktiv II, no complex subordinate clauses, no Passiv)
- [ ] Topics align with Goethe A2 Wortliste domains: everyday life, family, housing, shopping, travel, health
- [ ] Reading passages are 40-80 words each (longer than A1's 20-40 but shorter than B1)
- [ ] Writing sample answers demonstrate A2-appropriate language (simple Perfekt, denn/weil clauses, basic Dativ)

### 8. Explanation Coverage

- [ ] Every listening and reading question has a non-empty `explanation` field
- [ ] Explanations reference the source text/audio content and explain WHY the correct answer is right (not just restate it)
- [ ] Explanations are written in German at A2+ level (can use slightly higher register for pedagogic clarity)
- [ ] Minimum 20 words per explanation

### 9. Thematic Coherence

- [ ] Mock 01 (Alltag): listening scenarios, reading texts, writing tasks, and speaking prompts center on daily routines, appointments, schedules
- [ ] Mock 02 (Familie): content centers on family relationships, celebrations, household responsibilities
- [ ] Mock 03 (Wohnen): content centers on housing, furniture, neighbors, apartment search, moving

### 10. TypeScript Compliance

- [ ] `npx tsc --noEmit` passes with all three mocks importable via the content loader
- [ ] Each mock's structure satisfies the `MockExam` interface from `@telc/types` — no missing required fields, no extra fields outside the interface

---

## Quality Gates

| Gate | Owner | Check |
|------|-------|-------|
| Structural validity | exam-tester | `validateMockExam()` passes for all 3 mocks; all IDs unique; correctAnswer matches options |
| CEFR compliance | language-checker | Vocabulary audit against Goethe A2 Wortliste; grammar structures within A2 band |
| Pedagogic quality | pedagogy-director | Explanations teach (not just state); distractors are plausible but clearly wrong; difficulty progression within parts |
| Type safety | exam-tester | `npx tsc --noEmit` clean |
| Question count | exam-tester | Automated count: Listening=15, Reading>=15, Writing=2 tasks, Speaking=3 parts per mock |
| Theme adherence | pedagogy-director | Spot-check 3 items per section per mock against stated theme |

---

## Out of Scope

- Audio file generation (MP3s) — separate issue
- A2 vocabulary JSON (`A2_vocabulary.json`) — separate issue
- A2 grammar JSON — separate issue
- Mocks 04-10 — future batch
- UI changes for A2-specific rendering — content-only delivery
