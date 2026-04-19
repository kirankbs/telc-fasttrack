# Handoff — A2 Mock Exams 01-03

**Issue:** #21  
**Branch:** a2-mocks-01-03  
**PR:** https://github.com/kirankbs/telc-fasttrack/pull/24  
**CI:** All 4 checks green (Typecheck+Tests, E2E, Vercel Preview, Vercel Preview Comments)

---

## What was built

Three complete A2 mock exams:

| File | Theme | Listening | Reading | Writing | Speaking |
|------|-------|-----------|---------|---------|---------|
| mock_01.json | Alltag (everyday life) | 15 Q (3 parts) | 15 Q (3 parts) | 2 tasks | 3 parts |
| mock_02.json | Familie (family) | 15 Q (3 parts) | 15 Q (3 parts) | 2 tasks | 3 parts |
| mock_03.json | Wohnen (housing) | 15 Q (3 parts) | 15 Q (3 parts) | 2 tasks | 3 parts |

Total: 126 unique structural IDs across all 3 mocks.

## Structure per mock

**Listening (3 parts, 15 questions):**
- Part 1: 5 MCQ, playCount 2 — telephone messages
- Part 2: 5 MCQ, playCount 1 — radio announcements
- Part 3: 5 MCQ, playCount 1 — short conversations

**Reading (3 parts, 15 questions, totalTimeMinutes 50):**
- Part 1: 5 matching — ads/notices matched to situations
- Part 2: 5 true_false — newspaper/article passage
- Part 3: 5 MCQ — notices and signs

**Writing (0 minutes — shared timer with Reading):**
- Task 1: form_fill (6 fields each)
- Task 2: short_message (30–50 words, 3 required content points)

**Speaking (15 minutes, prepTimeMinutes 0):**
- Part 1: introduce
- Part 2: conversation
- Part 3: planning

## Quality checks run

- JSON validity: python3 json.load — all 3 pass
- Duplicate ID check: 126 unique IDs, 0 duplicates
- Correct answer validation: all MCQ answers match a/b/c options; all true_false use richtig/falsch
- Question counts verified per AC contract
- pnpm typecheck: 2 packages, 0 errors

## CEFR A2 compliance

- All listening/reading/writing/speaking content uses A2 vocabulary
- Perfekt tense used in Listening Part 3 and Speaking samples
- Modalverben (können, müssen, wollen, dürfen) throughout
- No Konjunktiv II, no Passiv, no complex subordinate clauses
- Compound sentences with und/aber/oder throughout
- Reading passages are 60-80 words (within 40-80 target)
- Writing sample answers demonstrate correct A2-level Perfekt + basic Dativ

## What's next

- Audio file generation for A2/mock01–03 (separate issue)
- A2 vocabulary JSON (separate issue)
- A2 mocks 04-10 (future batch)
- product-owner sign-off on PR #24
