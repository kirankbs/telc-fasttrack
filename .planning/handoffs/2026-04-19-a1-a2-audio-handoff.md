# Handoff — A1 + A2 Audio Complete

**Date:** 2026-04-19
**Branch:** `a1-a2-audio-complete`
**PR:** https://github.com/kirankbs/telc-fasttrack/pull/35
**Session type:** autonomous deep-work (~30 min orchestration, parallel agents)

## What shipped

| Asset | Count | Location |
|-------|-------|----------|
| A1 SSML (mocks 06-10) | 15 | `.planning/audio-prompts/A1_mockNN_listening_partN.ssml` |
| A2 SSML (mocks 01-10) | 30 | `.planning/audio-prompts/A2_mockNN_listening_partN.ssml` |
| A1 MP3 (mocks 06-10) | 15 | `apps/mobile/assets/audio/A1/mock{06..10}/listening_part{1,2,3}.mp3` |
| A2 MP3 (mocks 01-10) | 30 | `apps/mobile/assets/audio/A2/mock{01..10}/listening_part{1,2,3}.mp3` |
| Render script | 1 | `.planning/render_audio.py` |
| Roadmap refresh | 1 | `.planning/content-roadmap.md` |

**Total:** 92 files in commit `dd4dce2`. Zero code changes — all 50 mock JSONs already pointed at the MP3 paths.

## Coverage impact

- **A1:** listening audio 100% complete (was 50% — only 01-05 had MP3s from #33)
- **A2:** listening audio 100% complete (was 0% — first A2 audio ever)
- **Hören section:** now fully functional in web app for both A1 and A2

## Pipeline learnings (captured in render_audio.py)

1. **5000-char sync limit:** GCP `text:synthesize` caps input at 5000 chars. Script auto-chunks at `<voice>...</voice>` element boundaries, synthesizes each chunk, and binary-concats the MP3s — valid since MP3 is a sequence of self-contained frames.
2. **Quota project header:** User ADC credentials (via `gcloud auth print-access-token`) do not attribute quota automatically. Must set `x-goog-user-project: telc-fasttrack-tts` on every request or every call returns `403 PERMISSION_DENIED`. Service accounts don't need this.
3. **Cost:** $3.06 across 191,044 billed characters (WaveNet @ $16/1M). 16 of 45 files required 2-chunk rendering (61 total API calls).

## Content quality notes from audio-designer agents

- **A1 mock07 part2:** club announcement monologue (not dialog) — single Wavenet-B voice, 2 plays
- **A1 mock08/10 part2, A2 mocks:** same-gender scenarios (female receptionist + female patient) are voiced with Wavenet-B (male) for the service role to preserve audio separation — clarity matters more than rigid gender matching
- **Distractors:** all correct answers are explicitly stated in the audio; wrong options (a/c in MCQ) are either absent or contradicted. Verifiable via JSON `explanation` fields.

## Roadmap correction

Prior roadmap assumed B1/B2/C1 content existed because mock JSONs are on disk. Content-strategist agent verified those files are `_stub: true` with `sections: []`. Roadmap now flags this correctly.

## Next deep-work candidates (post-merge)

1. **A2 vocabulary fill** — 800 → 1,300 words to hit Goethe A2 target
2. **A2 pedagogy review** — pedagogy-director sweep of all 10 mocks; last gate before A2 is shippable
3. **B1 real content** — replace stubs, starting with exam-researcher pass on Sprachbausteine section
4. **Speaking practice** — Web Speech API / MediaRecorder
5. **localStorage** — dashboard persistence across tab close

## Reusable render script usage

```bash
# for a future batch (e.g., B1 mocks 01-05 once SSML exists)
# edit TARGETS list in .planning/render_audio.py, then:
python .planning/render_audio.py
```

Requires: `gcloud auth login` as a principal with `roles/serviceusage.serviceUsageConsumer` on `telc-fasttrack-tts`.
