# Handoff — feat(web): audio player for Listening section (#33)

**PR:** https://github.com/kirankbs/telc-fasttrack/pull/34
**CI:** All 4 checks green
**Branch:** audio-player

## What was built

- `AudioPlayer.tsx` — client component with dual playback: HTML5 Audio for MP3 files, Web Speech API fallback for TTS
- `apps/web/src/app/api/audio/[...path]/route.ts` — Next.js API route serving MP3 files from `apps/mobile/assets/audio/`
- Integrated into `ListeningExam.tsx` — replaces static placeholder
- Play/pause toggle, replay count display ("Abspielen 1/2"), progress bar
- Auto-detects MP3 availability, falls back to `speechSynthesis` with `lang: de-DE`, `rate: 0.9`
- Unit tests for AudioPlayer render states

## Audio files generated (separate from this PR)

15 MP3 files generated via GCP WaveNet TTS in the repo root at `apps/mobile/assets/audio/A1/mock01-05/`. These need to be committed in a follow-up PR or added to the audio-player branch before merge.

## Known gaps

- MP3 files not yet committed to git (18MB in repo root, not in the PR branch)
- A1 mocks 06-10 and all A2 mocks have no SSML scripts or audio yet
- Volume control not implemented (optional per AC)
