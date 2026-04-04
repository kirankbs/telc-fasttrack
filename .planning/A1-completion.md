# A1 Completion Plan

Status: Grammar UI in progress. Remaining items to reach fully usable state.

---

## Done ✅

- Services: contentLoader, scoringEngine, spacedRepetition, timerService, vocabularyService
- A1 mocks 01–05 (full JSON content, all 4 sections)
- 430 vocabulary words across 18 Goethe A1 categories
- 12 grammar topics with 52 exercises (JSON data)
- 5-tab navigation shell
- Full exam flow: start → listening → reading → writing → speaking → score report
- Vocabulary flashcard session (SM-2 + DB persistence)
- Vocabulary hub screen
- 221 tests passing

## Done ✅ (continued)

- Grammar review UI — hub + topic detail + interactive exercises
- Wire vocab seeding on startup (`_layout.tsx`)

---

## Remaining to reach fully usable A1

Priority order:

### 1. ~~Wire vocab seeding on startup~~ ✅ Done

### 2. Boot test (`npx expo start`)
**What:** Run the app on a simulator, click through every screen.
Known risks:
- `ExamProvider` may not be wired correctly around exam routes
- Route names cast as `any` may have typos
- `expo-audio` `useAudioPlayer` hook may throw on missing file
- Reanimated may need `babel.config.js` plugin check

Fix whatever breaks. Cannot ship without this.

### 3. Generate mock_01 listening audio
**What:** Run Google Cloud TTS to produce MP3s for `assets/audio/A1/mock01/`:
- `listening_part1.mp3`
- `listening_part2.mp3`
- `listening_part3.mp3`

The listening scripts are embedded in `mock_01.json` explanation fields.
The exact curl command is in `telc-fasttrack-implementation-plan.md` section 4.4.
Voice: `de-DE-Wavenet-C` (female) for announcements, `de-DE-Wavenet-B` (male) for dialogues.
Without this, Listening section is completely non-functional.

### 4. Images for Listening Part 1 and Speaking Part 2
**What:** Simple placeholder images for:
- `assets/images/A1/mock01/L1_q1_supermarkt.png`
- `assets/images/A1/mock01/L1_q2_wetter.png`
- `assets/images/A1/mock01/L1_q3_kino.png`
- `assets/images/A1/mock01/speaking_part2_cards.png`

Can use simple hand-drawn or royalty-free icons. Or generate with DALL-E.
Without images, Listening Part 1 MCQ shows grey boxes — functional but ugly.

---

## After A1 is fully usable → A2

Per CLAUDE.md: A1 must have 5+ mocks, 400+ vocab, end-to-end validation before A2 work starts.
All content thresholds are now met. Boot test + audio are the final gates.
