# Audio Player Contract — Issue #33
## feat(web): audio player for Listening section with Web Speech API fallback

**Date:** 2026-04-12  
**Scope:** `apps/web/src/components/exam/ListeningExam.tsx`, new `apps/web/src/hooks/useAudioPlayer.ts`, `packages/types/src/exam.ts`

---

## Schema Prerequisite

The `ListeningPart` interface currently has `audioFile` (MP3 path) but no transcript text for TTS fallback. Before this feature ships:

- [ ] Add optional `audioTranscript?: string` field to `ListeningPart` in `packages/types/src/exam.ts` — the full German text that Web Speech API speaks when MP3 is unavailable
- [ ] Populate `audioTranscript` in at least mock_01 through mock_03 so the fallback path is testable

---

## Acceptance Criteria

### Happy Path — MP3 Playback
- [ ] Clicking the play button on a listening part starts playback of the MP3 file referenced by `part.audioFile`
- [ ] Play button toggles to a pause icon during playback; clicking pause stops playback at the current position
- [ ] A visible progress bar shows elapsed time relative to total duration; it updates smoothly during playback
- [ ] Play count display reads "Abspielen 1/2" (or "1/1" for parts with `playCount: 1`) and increments after each complete play-through
- [ ] After the first play-through completes, playback resets to the start and the counter advances (e.g. "Abspielen 2/2")
- [ ] Once all allowed plays are exhausted, the play button is disabled and the display reads "Abspielen 2/2 — fertig"
- [ ] Audio auto-starts when a part first becomes active (user navigates to it or section transitions to `active` phase)

### Happy Path — Web Speech API Fallback
- [ ] When the MP3 file fails to load (404, network error, decode error), the player falls back to Web Speech API with `lang: 'de-DE'` and `rate: 0.9`
- [ ] TTS speaks the `audioTranscript` text from the part data; if `audioTranscript` is missing, falls back to `instructions` text
- [ ] Play/pause controls work identically to MP3 mode — pause calls `speechSynthesis.pause()`, resume calls `speechSynthesis.resume()`
- [ ] Progress indicator shows an animated pulse or spinner (no timeline bar, since TTS duration is unpredictable)
- [ ] Play count tracking works the same: TTS `onend` event triggers the counter increment and auto-replay logic
- [ ] `rate: 0.9` is applied so learners hear slightly slower-than-natural German

### Empty / Missing States
- [ ] If `audioFile` is `null`/`undefined` AND `audioTranscript` is empty/missing, the player shows a disabled state with text "Kein Audio verfügbar" (no audio available)
- [ ] If `playCount` is 0 or missing, treat as 1 (defensive default)

### Edge Cases
- [ ] **Browser without German voice:** if `speechSynthesis.getVoices()` returns no `de-DE` voice, show a warning banner "Keine deutsche Stimme verfügbar — bitte installieren Sie ein deutsches Sprachpaket" and disable the play button (do not crash)
- [ ] **User clicks "Nächster Teil" mid-playback:** current audio (MP3 or TTS) stops immediately; the new part's audio does NOT auto-start (user must click play) — prevents overlapping audio
- [ ] **User clicks part tab mid-playback:** same behavior as above — stop current, do not auto-start new
- [ ] **Rapid play/pause toggling:** debounce or guard so that rapid clicks do not produce overlapping audio streams or corrupt the play counter
- [ ] **Part revisit after exhausting plays:** returning to a part where all plays are used keeps the player in disabled/finished state — no extra plays on revisit
- [ ] **Timer expires mid-playback:** audio stops when `phase` transitions to `submitted`
- [ ] **Page visibility change (tab switch):** MP3 continues playing (browser default); TTS continues (no intervention needed)

### Accessibility
- [ ] Play/pause button has `aria-label` that reflects current state: "Audio abspielen" / "Audio pausieren" / "Audio nicht verfügbar"
- [ ] Progress bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] Play count display is in a `<span>` with `aria-live="polite"` so screen readers announce counter changes
- [ ] Keyboard: play/pause button is focusable and activates on Enter/Space
- [ ] Fallback warning banner (no German voice) has `role="alert"`

### Quality Gates
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Audio logic is extracted into a custom hook (`useAudioPlayer`) that accepts `{ audioFile, audioTranscript, playCount }` and returns `{ play, pause, isPlaying, currentPlay, totalPlays, progress, isFinished, isFallback, error }`
- [ ] Hook cleans up on unmount: pauses MP3 (`audio.pause()`), cancels TTS (`speechSynthesis.cancel()`), revokes any object URLs
- [ ] Unit tests cover: play count exhaustion, fallback trigger on MP3 error, disabled state when no audio source exists, cleanup on unmount
- [ ] Playwright E2E: navigate to listening section, verify player renders, verify play count display updates (mock audio or stub `HTMLAudioElement`)
- [ ] No regressions in existing ListeningExam tests (MCQ rendering, true_false, scoring, part navigation)
- [ ] The static placeholder (lines 172-185 in current ListeningExam.tsx) is fully replaced — no `[Vorschau]` badge remains
