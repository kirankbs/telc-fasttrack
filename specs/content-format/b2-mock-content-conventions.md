# B2 Mock Exam Content Conventions

> **Last synced:** 2026-04-20 | **Source:** `apps/mobile/assets/content/B2/mock_01.json`, `.planning/audio-prompts/B2_mock01_listening_part{1,2,3}.ssml`, `.planning/research/B2-exam-format.md`

## Purpose

Documents the structural rules, item counts, and authoring conventions that apply to all B2 mocks. `mock_01.json` is the worked example — mocks 02–10 must follow these conventions exactly. Deviations require an explicit note here.

## Exam Structure

| Section | Parts | Items | Max Points | Time |
|---------|-------|-------|------------|------|
| Hören | 3 | 20 | 75 | 20 min |
| Lesen | 3 | 20 | 75 | 90 min |
| Sprachbausteine | 2 | 20 | 30 | included in reading time |
| Schreiben | 1 (2 prompts) | 2 tasks | 45 | 30 min |
| Sprechen | 3 | 3 | 75 | 15 min + 20 min prep |

Pass threshold: 60% in both written sections (Hören+Lesen+Schreiben+Sprachbausteine) and oral (Sprechen).

## Hören (Listening)

### Part breakdown

| Part | Format | Items | Play rule |
|------|--------|-------|-----------|
| Teil 1 | 5 short news bulletins, true/false | 5 | `playCount: 1` |
| Teil 2 | Expert interview, true/false | 10 | `playCount: 1` |
| Teil 3 | 5 short professional announcements, 3-option MCQ | 5 | `playCount: 1` |

**`playCount: 1` is mandatory on all three parts.** This is the B2 single-play rule — no item in the listening section may be heard twice. This intentionally mirrors real telc B2 exam conditions and tests authentic comprehension, not memory on second pass. Authors must never set `playCount: 2` on any B2 listening part.

### Trap design conventions
- Teil 1: Each bulletin contains at least one lexical hedge or quantitative mismatch that creates a plausible false positive. The `explanation` field must identify the specific trap word or phrase.
- Teil 2: Interview questions are designed around B2 hedging patterns — `"Man hört oft ... aber"`, `"überwiegend"`, `"nach wie vor"`. The trap must be named explicitly in `explanation`.
- Teil 3: MCQ distractors must reuse vocabulary from the audio to create false familiarity. Correct answers require inference, not surface matching.

### Question ID pattern
`B2_m{NN}_L{PartNum}_q{ItemNum}` — e.g. `B2_m01_L2_q7`

### `audioTimestamp` field
Required on all listening questions. Value is seconds from audio start to the moment the answer evidence is spoken. Used for post-exam review to jump the player to the relevant passage.

## Lesen (Reading)

### Part breakdown

| Part | Format | Items |
|------|--------|-------|
| Teil 1 | 10 headings → 5 texts (5 distractor headings) | 10 |
| Teil 2 | Long article (~500+ words), 5 inference-only MCQ | 5 |
| Teil 3 | 10 situations → 12 ads (includes ≥1 `"x"` no-match) | 10 |

**Lesen Teil 3 must include at least one `"x"` no-match situation per mock.** This calibration rule (from `.planning/research/B2-exam-format.md`) ensures candidates practice the no-match option rather than assuming every situation maps to an ad.

### Lesen Teil 2 text length
Feature article must exceed 500 words. MCQs must test inference — no answer should be directly quotable from a single sentence. If a candidate can find the answer by scanning for a keyword, the question is too easy for B2.

## Sprachbausteine

### Part breakdown

| Part | Type | Items | Option count |
|------|------|-------|-------------|
| Teil 1 | Close text, 4-option MCQ | 10 | **4 (a/b/c/d)** |
| Teil 2 | Close text, word bank | 10 | **15 (a–o), 5 unused** |

**Teil 1 uses 4 options — this is the primary structural difference from B1 Teil 1 (which uses 3).** Rendering components must not assume 3 options for `mcq` type Sprachbausteine questions. The correct option can land at any position (a, b, c, or d) and answers must be distributed across positions to avoid pattern bias.

### B2 grammar features tested in Teil 1
Each Sprachbausteine Teil 1 item must test a named B2 grammar feature. The `explanation` field must state the feature name. Features established in mock_01 as the canonical set:

- Passiv-Perfekt (`wurde ... gemacht` / `ist ... worden`)
- Relativpronomen (gender + case agreement)
- Funktionsverbgefüge (`in Anspruch nehmen`, `in Betracht ziehen`, etc.)
- Modalverb + Konjunktiv vs. Indikativ contrast
- Genitiv-Präpositionen (`angesichts`, `trotz`, `wegen`, `aufgrund`)
- Koordinierende Konnektoren with structural constraints (`sondern` requires negation, `aber auch` does not)
- Partizipialattribute (Partizip I vs. II vs. Gerundivum `zu+Partizip`)
- Nominalisierung vs. Adjektiv (prädikativ vs. attributiv, endungslos vs. flektiert)
- Deklination in Relativsätzen and dass-Sätzen
- Inversion after conditional `Sollte...`

### Teil 2 word bank
15 options must cover different word classes. The 5 unused words should be plausible distractors for multiple blanks, not obviously wrong. Authors must verify no unused word could unambiguously fit any blank.

## Schreiben (Writing)

Candidates choose between two prompts:
- **Option A:** Formal complaint letter (Beschwerdebrief) — professional register, specific factual demands
- **Option B:** Stellungnahme / argumentative essay — must argue a position, not merely describe

Both prompts must be provided in every B2 mock. The task is stored as a single `WritingTask` entry with both options described in the `prompt` field. `sampleAnswer` covers one option only — note which option is answered.

**B2 scoring note:** A D (lowest grade) in either criterion I (Inhalt) or III (Sprachliche Angemessenheit) results in 0 points for the entire writing task. The `scoringCriteria` array in the JSON captures this via `description` fields; the exam runner does not automatically apply this rule — it is for human scoring reference only.

## Sprechen (Speaking)

| Part | Type | Duration | Notes |
|------|------|----------|-------|
| Teil 1 | `presentation` | ~3 min/candidate | **Candidate A and B receive different topic cards** |
| Teil 2 | `discussion` | ~5 min shared | Both see the same provocative statement |
| Teil 3 | `planning` | ~5 min shared | Both see the same task; must reach a joint decision |

`prepTimeMinutes: 20` on the `SpeakingSection`. This applies to B2 (and B1). A1, A2, C1 have `prepTimeMinutes: 0`.

Speaking parts are not scored automatically. The `evaluationTips` and `keyPhrases` arrays are displayed post-practice for self-assessment.

## Audio Pipeline (SSML Conventions)

SSML scripts live at `.planning/audio-prompts/{LEVEL}_mock{NN}_listening_part{N}.ssml`. These are source scripts for TTS generation; the compiled MP3s go to `assets/audio/{LEVEL}/mock{NN}/listening_part{N}.mp3`.

### B2-specific SSML rules (differ from B1)

| Parameter | B1 | B2 |
|-----------|----|----|
| `prosody rate` | `"slow"` (narrator/content) | `"1.0"` everywhere — natural speed, no slowing |
| Initial pause after instructions | 3s | **10s** — candidates need time to read all 5 statements before audio starts |
| Pause between Teil 1/3 items | 2s | **5s** — longer gaps for note-taking at B2 |
| Teil 2 item-level pauses | Individual breaks | None — interview flows continuously; no breaks between questions |
| Narrator voice | `de-DE-Wavenet-C` (female) | `de-DE-Wavenet-C` (female) — same |
| Content voices Teil 1 | B/C (2 voices) | **B/A/D** (3 voices rotating for news variety) |
| Content voices Teil 2 | single speaker or pairs | Named characters: `de-DE-Wavenet-E` (Moderator), `de-DE-Wavenet-F` (Dr. Richter) |
| Content voices Teil 3 | varied | B/A/D/F/E — one voice per announcement |

### Rationale for 10s pause after instructions
At B2, Teil 1 instructions ask candidates to pre-read all 5 true/false statements before the first audio clip plays. A 3s pause (B1 convention) is too short to read 5 full German sentences. 10s matches the telc exam administration guidance.

### Rationale for no item-level pauses in Teil 2
The Teil 2 interview is presented as a continuous uninterrupted recording. Inserting pauses between questions would break the naturalistic register and give candidates artificial processing time that doesn't exist in the real exam. This is a deliberate difficulty calibration.

## Content Theme

mock_01 theme: **Beruf & Arbeitswelt** (Bewerbung, Weiterbildung, Homeoffice, Work-Life-Balance). Vocabulary throughout is consistently professional/workplace register. All proper nouns (institutions, names) are fictional but realistic.

## Calibration Rules for mocks 02–10

1. Keep `playCount: 1` on all listening parts — non-negotiable
2. Always use 4 options in Sprachbausteine Teil 1
3. Always include ≥1 `"x"` no-match in Lesen Teil 3
4. Provide two writing prompts (A and B) per mock
5. Speaking Teil 1 must give different topic cards to candidate A and B
6. Every `explanation` must name the B2 grammar feature being tested (Sprachbausteine) or the specific trap (Listening)
7. Gloss every above-B2 word inside the `explanation` field where it appears
