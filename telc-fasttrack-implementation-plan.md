# Telc-FastTrack — Complete Implementation Plan for Claude Code

> **App Vision:** "Spend X hours. Pass telc." — A practical, exam-focused German language prep app that consolidates mock exams, drills, and resources so candidates can pass telc A1 through C1 with focused study.
>
> **Slogan:** "20 Stunden. 1 Zertifikat." (scales per level)

---

## Table of Contents

1. [Exam Structure Reference (A1–C1)](#1-exam-structure-reference-a1c1)
2. [Free Public Resources & Content Sources](#2-free-public-resources--content-sources)
3. [CEFR Vocabulary & Grammar Scope per Level](#3-cefr-vocabulary--grammar-scope-per-level)
4. [TTS Strategy & Cost Analysis](#4-tts-strategy--cost-analysis)
5. [Tech Stack & Architecture](#5-tech-stack--architecture)
6. [Database Schema](#6-database-schema)
7. [Content Data Structures (JSON Schemas)](#7-content-data-structures-json-schemas)
8. [Project File Structure](#8-project-file-structure)
9. [Screen-by-Screen UI Flow](#9-screen-by-screen-ui-flow)
10. [Content Generation Pipeline](#10-content-generation-pipeline)
11. [Study Plan Engine ("X Hours to Pass")](#11-study-plan-engine-x-hours-to-pass)
12. [Implementation Phases](#12-implementation-phases)
13. [Key NPM Packages](#13-key-npm-packages)

---

## 1. Exam Structure Reference (A1–C1)

### 1.1 telc Deutsch A1 (Start Deutsch 1)

| Section | Duration | Tasks | Points | Details |
|---------|----------|-------|--------|---------|
| **Listening** | ~20 min | 3 parts | ~24 pts | Part 1: 3 MCQ with images; Part 2: 5 True/False on announcements; Part 3: 3 MCQ from dialogues. Audio played twice (Part 1,2) or once (Part 3). |
| **Reading** | ~25 min | 3 parts | ~24 pts | Part 1: 5 T/F on two short emails/notes; Part 2: 5 matching (source a/b from ads/flyers); Part 3: 5 T/F on public notices/signs. |
| **Writing** | ~20 min | 2 tasks | ~12 pts | Task 1: Fill a form with 5 blanks (name, date, preference); Task 2: Write short note ~30-40 words (invite, daily routine, apology). |
| **Speaking** | ~15 min | 3 parts | ~24 pts | Part 1: Introduce yourself (name, age, country, hobby); Part 2: Picture+word card matching (6 each); Part 3: "Und du?" Q&A with word cards. Usually 4 candidates. |

- **Written exam total:** 65 minutes
- **Pass threshold:** 60% in BOTH written and oral sections
- **Recommended study:** 100-150 lesson hours
- **Exam cannot be taken as partial exam** (must take both parts same day)

### 1.2 telc Deutsch A2 (Start Deutsch 2)

**Source:** Verified from official telc Deutsch A2 Übungstest 1 (ISBN 978-3-936753-00-8)

| Section | Duration | Tasks | Points | Details |
|---------|----------|-------|--------|---------|
| **Listening (Hören)** | ~20 min | 3 parts | 15 pts | Teil 1: 5 telephone messages — fill in missing info (played twice); Teil 2: 5 radio announcements — MCQ a/b/c (played once); Teil 3: 5 dialogues — MCQ a/b/c (played once) |
| **Reading (Lesen)** | 50 min (shared with Writing) | 3 parts | 15 pts | Teil 1: Short texts (ads, notices) — MCQ; Teil 2: Newspaper text — T/F; Teil 3: Notices/signs — matching |
| **Writing (Schreiben)** | (included in 50 min) | 2 tasks | 15 pts | Task 1: Fill in a form; Task 2: Write a short letter (~30-50 words) |
| **Speaking (Sprechen)** | ~15 min | 3 parts | 15 pts | Teil 1: Sich vorstellen (~3 min); Teil 2: Ein Alltagsgespräch führen (~4 min); Teil 3: Etwas aushandeln (~4 min) |

- **Written exam total:** 80 minutes (10 min formalities + 20 min Hören + 50 min Lesen/Schreiben)
- **Total points:** 60
- **Pass threshold:** 60% (36/60 = ausreichend)
- **Grading scale:** 54-60 sehr gut; 48-53.5 gut; 42-47.5 befriedigend; 36-41.5 ausreichend; 0-35.5 teilgenommen
- **Cannot be taken as partial exam**
- **Recommended study:** 200-300 lesson hours

### 1.3 telc Deutsch B1 (Zertifikat Deutsch)

| Section | Duration | Tasks | Points | Details |
|---------|----------|-------|--------|---------|
| **Reading** | 90 min (shared w/ Sprachbausteine) | 3 parts | 75 pts (25 each) | Teil 1: Global understanding — match headings to texts; Teil 2: Detailed understanding — read text, answer 5 MCQ; Teil 3: Selective understanding — match 10 situations to 12 ads |
| **Sprachbausteine** | (included in 90 min) | 2 parts | 30 pts | Teil 1: 10 MCQ cloze (3 options each); Teil 2: 10 gap-fill from 15 word bank |
| **Listening** | 30 min | 3 parts | 75 pts (25 each) | Teil 1: 5 dialogues — T/F; Teil 2: 10 MCQ on broadcast; Teil 3: 5 MCQ on conversation |
| **Writing** | 30 min | 1 task | 45 pts | Write a semi-formal letter (~150 words) responding to a prompt. Greeting, body, closing required. |
| **Speaking** | 15 min (+ 20 min prep) | 3 parts | 75 pts (25 each) | Teil 1: Contact — introduce, ask partner about themselves; Teil 2: Conversation about a topic; Teil 3: Gemeinsam planen — plan something together |

- **Written exam total:** 2.5 hours (150 min)
- **Pass threshold:** 60% in BOTH written AND oral (i.e., 135/225 written + 45/75 oral)
- **Recommended study:** ~500 lesson hours
- **20 min preparation time** before speaking

### 1.4 telc Deutsch B2

**Source:** Verified from official telc Deutsch B2 Übungstest/Modelltest and deutsch-pruefung.de

| Section | Duration | Tasks | Points | Details |
|---------|----------|-------|--------|---------|
| **Reading (Leseverstehen)** | 90 min (shared w/ Sprachbausteine) | 3 parts | 75 pts | Teil 1: Global — match 5 texts to 10 headings (25 pts, 5 pts each); Teil 2: Detailed — read text + 5 MCQ a/b/c (25 pts, 5 pts each); Teil 3: Selective — 12 texts, match 10 situations (25 pts, 2.5 pts each) |
| **Sprachbausteine** | (included in 90 min) | 2 parts | 30 pts | Teil 1: 10 MCQ cloze, 4 options each (15 pts, 1.5 pts each); Teil 2: 10 gap-fill from 15 word bank (15 pts, 1.5 pts each) |
| **Listening (Hörverstehen)** | ~20 min | 3 parts | 75 pts | Teil 1: News broadcast — 5 T/F statements (25 pts); Teil 2: Radio interview — 10 T/F statements (25 pts); Teil 3: Short presentations/talks — 5 matching items (25 pts). All played ONCE only. |
| **Writing (Schriftlicher Ausdruck)** | 30 min | 1 task (choose 1 of 2) | 45 pts | Write a semi-formal/formal letter (~200 words). Choose from 2 prompts (e.g., Beschwerdebrief or Bewerbung). Scored on 3 criteria × 5 points × multiplied by 3. |
| **Speaking (Mündlicher Ausdruck)** | 15 min (+ 20 min prep) | 3 parts | 75 pts | Teil 1: Present a personal experience (~1.5 min presentation + partner Q&A, ~5 min total, 25 pts); Teil 2: Discussion on controversial topic from text (~5 min, 25 pts); Teil 3: Gemeinsam planen — plan something together (~5 min, 25 pts) |

- **Written exam total:** 2 hrs 20 min (140 min)
- **Total points:** 300 (written 225 + oral 75)
- **Pass threshold:** 60% in BOTH written (135/225) AND oral (45/75) separately
- **CAN be taken as partial exam** — if you fail one part, retake only that part within 1 year
- **Recommended study:** 700-800 lesson hours
- **Topic areas (16 categories):** Personal Info, Body/Health, Home, Places, Daily Life, Food/Drink, Education/Training, Work/Career, Business/Consumption, Services, Nature/Environment, Travel/Transport, Leisure/Entertainment, Media/Technology, Society/Government, Relationships/Cultures

### 1.5 telc Deutsch C1 Hochschule (verified from official Übungstest 1 Testformat table)

| Section | Duration | Tasks | Points | Details |
|---------|----------|-------|--------|---------|
| **Leseverstehen** | 90 min (shared w/ Sprachbausteine) | 3 parts + Globalverstehen | 48 pts | Teil 1: Textrekonstruktion — 6 Zuordnungsaufgaben (8 sentences → fill 6 gaps, 12 pts); Teil 2: Selektives Verstehen — 6 Zuordnungsaufgaben (match statements to paragraphs a-e, 12 pts); Teil 3: Detailverstehen — 11 richtig/falsch/nicht im Text (22 pts); Globalverstehen — 1 Makroaufgabe: choose best title (2 pts) |
| **Sprachbausteine** | (included in 90 min reading block) | 1 part | 22 pts | 22 × 4-option MCQ cloze (Grammatik und Lexik) |
| *20 min break* | | | | |
| **Hörverstehen** | ~40 min | 3 parts | 48 pts | Teil 1: Globalverstehen — 8 Zuordnungsaufgaben (match summaries to speakers, 8 pts); Teil 2: Detailverstehen — 10 × 3-option MCQ (20 pts); Teil 3: Informationstransfer — 10 items, fill in specific information from audio (20 pts) |
| **Schriftlicher Ausdruck** | 70 min | 1 task | 48 pts | Write argumentative essay (Erörterung/Stellungnahme). Evaluated on 4 criteria (A/B/C/D): Aufgabengerechtheit, Textorganisation, Kommunikative Gestaltung, Korrektheit |
| **Mündlicher Ausdruck** | 16 min (+ 20 min prep) | 3 parts | 48 pts | Teil 1a: Präsentation (6 pts); Teil 1b: Zusammenfassung + Anschlussfragen (4 pts); Teil 2: Diskussion (6 pts); + 32 pts for sprachliche Angemessenheit. Pair exam (Paarprüfung). |

- **Written exam total:** 3 hrs 40 min (including 20-min break)
- **Total points:** 214 (Schriftlich: 166 = Lesen 48 + Sprachbausteine 22 + Hören 48 + Schreiben 48; Mündlich: 48)
- **Pass threshold:** 60% in BOTH written (≥99 pts) AND oral (≥29 pts) sections
- **Recommended study:** 1000+ lesson hours
- **C1 Hochschule:** Accepted for university admission across Germany (alongside TestDaF, DSH, Goethe C2)
- **Can retake single part** within 1 calendar year if only one part failed

### Summary — Pass Requirements All Levels

| Level | Written Duration | Oral Duration | Pass % | Study Hours |
|-------|-----------------|---------------|--------|-------------|
| A1 | 65 min | 15 min | 60% each part | 100-150 hrs |
| A2 | 80 min | 15 min | 60% each part | 200-300 hrs |
| B1 | 150 min | 15 min (+20 prep) | 60% each part | ~500 hrs |
| B2 | 140 min | 15 min (+20 prep) | 60% each part | 700-800 hrs |
| C1 Hochschule | 200 min (+20 break) | 16 min (+20 prep) | 60% each part (≥99 written, ≥29 oral) | 1000+ hrs |

---

## 2. Free Public Resources & Content Sources

### 2.1 Official telc Resources (FREE)

All official Übungstests (mock exams) are downloadable free from telc.net with audio files:

| Level | Resource | URL |
|-------|----------|-----|
| A1 | Übungstest 1 Start Deutsch 1 (PDF + Audio) | https://www.telc.net → Start Deutsch 1 → Download Mock Examination |
| A2 | Übungstest 1 Start Deutsch 2 (PDF + Audio) | https://www.telc.net → Start Deutsch 2 → Download Mock Examination |
| A2·B1 | Übungstest Deutsch-Test für Zuwanderer (PDF + Audio) | https://www.telc.net → DTZ → Download |
| B1 | Übungstest 1 Zertifikat Deutsch (PDF + Audio) | https://www.telc.net → Zertifikat Deutsch → Download Mock Examination |
| B2 | Übungstest 1 (PDF + Audio) + Exam Preparation Tips | https://www.telc.net → telc Deutsch B2 → Download Mock Examination |
| C1 | Übungstest 1 (PDF + Audio) | https://telc.hu/wp-content/uploads/2021/11/DE_C1_Mock_1.pdf |
| C1 Hochschule | Übungstest 1 (PDF + Audio) | https://www.telc.net → C1 Hochschule → Download |
| All levels | Free teaching downloads (audio, worksheets, handouts) | https://www.telc.net/en/teaching-materials/free-downloads/ |

### 2.2 Goethe-Institut Resources (FREE)

| Resource | URL |
|----------|-----|
| A1 Exam Training (interactive online) | https://www.goethe.de/en/spr/prf/ueb/pa1.html |
| A1 Wortliste (650 entries) | https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf |
| A1 Fit in Deutsch 1 Wortliste | https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A1_Fit1_Wortliste.pdf |
| A2 Wortliste | Available via Goethe-Institut Prüfungsziele/Testbeschreibung |
| B1 Wortliste (~2,400 entries) | Available via Goethe-Zertifikat B1 documentation |
| A1 Online Course Vocabulary (Ch 1-18) | https://lernen.goethe.de/deutschonline/A1/PDF/EN/A1_deutschonline_course_vocabulary_1-18.pdf |
| All levels: Model exams + practice | https://www.goethe.de → Sprache → Prüfungen → Übungsmaterialien |

### 2.3 Deutsche Welle (DW) Resources (FREE)

| Resource | Description |
|----------|-------------|
| Nicos Weg (A1-B1) | Interactive video series with exercises |
| Top-Thema (B1-B2) | Weekly news articles with audio and exercises |
| Langsam gesprochene Nachrichten | Daily slow-speed news (B2-C1) |
| Deutsch Interaktiv (A1-B1) | 30-unit course with exercises |

### 2.4 YouTube Channels for telc Prep

| Channel | Focus |
|---------|-------|
| Deutsch mit Marija | B1, B2, C1 telc exam prep (Schreiben templates, Sprechen tips) |
| Easy German | Conversation, listening practice, street interviews |
| Learn German with Anja | Grammar explanations A1-B2 |
| Deutsch für Euch | Grammar and culture A1-C1 |
| Benjamin (Pair of Socks) | telc B1 strategies, Sprachbausteine patterns |

### 2.5 Other Free Resources

| Resource | URL/Description |
|----------|----------------|
| Schubert Verlag Online-Aufgaben | https://www.schubert-verlag.de — Free exercises A1-C1 |
| Aspekte Neu online exercises | Klett publisher companion exercises (B1+, B2, C1) |
| Anki shared decks | Goethe A1 Wortliste deck (ankiweb.net/shared/info/293204297) |
| heylama.com vocabulary lists | 15+ free German vocab lists A1-C1 with frequency scores |
| Grammatik Aktiv (book series) | A1-B1 and B2-C1 grammar reference |

### 2.6 Resources to Link in App (not reproduce)

The app's "Resources" section will link to these. We do NOT copy copyrighted content — we link and reference.

---

## 3. CEFR Vocabulary & Grammar Scope per Level

### 3.1 Vocabulary Count per Level

| Level | Approximate Vocabulary | Source |
|-------|----------------------|--------|
| A1 | ~650 words | Goethe A1 Wortliste |
| A2 | ~1,300 words (cumulative) | Goethe A2 Wortliste |
| B1 | ~2,400 words (cumulative) | Goethe B1 Wortliste |
| B2 | ~4,000+ words (cumulative) | Profile Deutsch / telc specifications |
| C1 | ~6,000+ words (cumulative) | Profile Deutsch / telc specifications |

### 3.2 Topic Areas per Level

**A1 Topics (18 categories from Goethe Wortliste):**
Persönliche Angaben, Wohnung, Umwelt, Reisen/Verkehr, Verpflegung, Einkaufen, Öffentliche/private Dienstleistungen, Körper/Gesundheit, Arbeit/Beruf, Ausbildung, Sprache/Schrift, Freizeit/Unterhaltung, Persönliche Beziehungen, Politik/Gesellschaft, Zeit, Ort/Raum, Menge/Maß, Kommunikation

**A2 Topics:** All A1 + expanded everyday situations (doctor visits, bank, post office, neighbor interactions, simple complaints)

**B1 Topics:** All A2 + work situations, current events, family/hobbies discussions, opinions/reasons, travel planning, media

**B2 Topics:** All B1 + abstract topics, arguments/counterarguments, professional contexts, news/politics, education, environment

**C1 Topics:** All B2 + academic texts, complex arguments, nuanced opinions, specialist topics, irony/humor

### 3.3 Grammar Scope per Level

| Level | Key Grammar Topics |
|-------|-------------------|
| **A1** | Present tense (regular + sein/haben), basic word order (SVO), W-Fragen, Ja/Nein questions, definite/indefinite articles (Nom/Akk), possessive pronouns, negation (nicht/kein), separable verbs, modal verbs (können, möchten), imperative (Sie-form), numbers, time expressions, prepositions (in, an, auf + Dat for location) |
| **A2** | Past tenses (Perfekt with haben/sein, Präteritum of sein/haben/modals), dative case, two-way prepositions, comparative/superlative, reflexive verbs, subordinate clauses (weil, dass, wenn), personal pronouns (Akk/Dat), werden + future, ordinal numbers |
| **B1** | Konjunktiv II (würde + hätte/wäre), passive voice (Präsens/Perfekt), relative clauses, Plusquamperfekt, indirect speech (basic), infinitive + zu, double infinitive, prepositions + Genitiv, obwohl/trotzdem, damit/um...zu, connectors (deshalb, trotzdem, außerdem) |
| **B2** | Passive with modals, Konjunktiv I (reported speech), Partizip I/II as adjectives, extended adjective constructions, nominal style, subjunctive in conditions, compound sentences, advanced connectors (je...desto, sowohl...als auch, weder...noch) |
| **C1** | Advanced Konjunktiv I/II, subjunctive replacements (Modalpartikeln), complex nominal phrases, academic register, text reconstruction, nuanced modal particles, advanced passive constructions, Funktionsverbgefüge |

---

## 4. TTS Strategy & Cost Analysis

### 4.1 Recommended Approach: Hybrid (Pre-generated + On-device)

**Strategy:** Pre-generate all exam listening audio using a cloud TTS API during content creation, then bundle as MP3 files in the app. Use on-device TTS (`expo-speech`) for vocabulary flashcards and ad-hoc pronunciation.

**Why hybrid?**
- Exam listening sections need CONSISTENT, high-quality audio (multiple speakers, realistic pace)
- Pre-generated audio ensures offline functionality (critical for exam simulation)
- On-device TTS is free and instant for vocabulary items
- Avoids per-user API costs

### 4.2 TTS Service Comparison for Audio Generation

| Service | Price per 1M chars | German Quality | Notes |
|---------|-------------------|----------------|-------|
| **Google Cloud TTS** | $4 (Standard), $16 (WaveNet/Neural) | Excellent | 1M chars/month free (WaveNet). Best multilingual quality. Multiple German voices (male/female). SSML support. |
| **Amazon Polly** | $4 (Standard), $16 (Neural) | Very Good | 5M chars/month free (first year). Good German voices. |
| **Azure Cognitive TTS** | $16 (Neural) | Excellent | 500K chars/month free. Custom Neural Voice available. Best SSML support. |
| **OpenAI TTS** | $15 (Standard), $30 (HD) | Good | Simple API. Limited voice selection (11 preset). No voice cloning. |
| **ElevenLabs** | ~$180 (subscription-based) | Premium | Most realistic. Expensive. Voice cloning available. Great for exam-quality audio. |
| **Coqui TTS** | Free (open-source) | Moderate | Self-hosted. Requires GPU for generation. Variable German quality. |

### 4.3 Recommended: Google Cloud TTS (WaveNet)

**Why Google Cloud TTS:**
- 1 million characters/month FREE for WaveNet voices
- Excellent German neural voices (multiple speakers: male, female, young, old)
- SSML support for pauses, speed control, emphasis — critical for exam audio
- Simple REST API for batch generation
- Total estimated audio content: ~300,000 characters across all levels = well within free tier for initial content

**Cost Estimate for Full Content Generation:**
- A1 (10 mocks × ~2,000 chars per listening script): ~20,000 chars
- A2 (10 mocks × ~3,000 chars): ~30,000 chars
- B1 (10 mocks × ~5,000 chars): ~50,000 chars
- B2 (10 mocks × ~7,000 chars): ~70,000 chars
- C1 (10 mocks × ~10,000 chars): ~100,000 chars
- Vocabulary/phrases audio: ~30,000 chars
- **Total: ~300,000 characters = FREE within Google Cloud TTS free tier**
- Even at WaveNet pricing ($16/1M chars): **$4.80 total**

### 4.4 Audio Generation Script (for Claude Code)

```bash
# Generate audio from SSML script
curl -X POST "https://texttospeech.googleapis.com/v1/text:synthesize" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {"ssml": "<speak>Guten Tag. Mein Name ist Anna. <break time=\"500ms\"/> Ich komme aus Berlin.</speak>"},
    "voice": {"languageCode": "de-DE", "name": "de-DE-Wavenet-C", "ssmlGender": "FEMALE"},
    "audioConfig": {"audioEncoding": "MP3", "speakingRate": 0.9}
  }' | jq -r '.audioContent' | base64 --decode > output.mp3
```

**German Voice Options (Google Cloud):**
- `de-DE-Wavenet-A` (Female)
- `de-DE-Wavenet-B` (Male)
- `de-DE-Wavenet-C` (Female, different timbre)
- `de-DE-Wavenet-D` (Male, different timbre)
- `de-DE-Wavenet-E` (Male)
- `de-DE-Wavenet-F` (Female)

### 4.5 Alternative: Free Open-Source TTS for Self-Generation

If zero-cost is critical, the developer can use:
- **Piper TTS** (open-source, runs locally, decent German voices)
- **Coqui TTS** (open-source, needs GPU)
- These would generate audio files locally that are then bundled in the app

---

## 5. Tech Stack & Architecture

### 5.1 Core Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | React Native (Expo SDK 52+) |
| **Language** | TypeScript |
| **Navigation** | React Navigation v7 (bottom tabs + stack) |
| **Database** | expo-sqlite (offline-first) |
| **Audio Playback** | expo-audio (for pre-recorded listening sections) |
| **On-device TTS** | expo-speech (for vocabulary pronunciation) |
| **Audio Recording** | expo-audio (for speaking practice recording) |
| **Speech Recognition** | @jamsch/expo-speech-recognition (for speaking evaluation) |
| **State Management** | React Context + useReducer (lightweight) |
| **Animations** | react-native-reanimated |
| **Build System** | EAS Build + EAS Submit |
| **Icons** | @expo/vector-icons (MaterialCommunityIcons) |

### 5.2 Architecture Principles

1. **Offline-First:** All content (questions, audio files, vocab) bundled in app assets or downloaded on first launch. No internet required for practice.
2. **Content-Driven:** All exam content is JSON-defined. Adding new mock exams = adding new JSON files. No code changes needed for content updates.
3. **Level-Agnostic Engine:** The same question/answer engine handles all levels. Content JSON defines the structure, not the code.
4. **SM-2 Spaced Repetition:** Vocabulary and grammar flashcards use the SM-2 algorithm (matching Big Challenge app pattern).
5. **Realistic Timer:** Exam simulation mode enforces real exam timing per section.

### 5.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    App Shell                         │
│  ┌──────────┬──────────┬───────────┬──────────────┐ │
│  │Dashboard │ Practice │ExamSim   │ Resources    │ │
│  │Screen    │ Screen   │Screen    │ Screen       │ │
│  └──────────┴──────────┴───────────┴──────────────┘ │
│                        │                             │
│  ┌─────────────────────┴──────────────────────────┐ │
│  │              Core Engine Layer                  │ │
│  │  ┌──────────┬───────────┬────────┬──────────┐  │ │
│  │  │Question  │Timer      │Scoring │Progress  │  │ │
│  │  │Renderer  │Controller │Engine  │Tracker   │  │ │
│  │  └──────────┴───────────┴────────┴──────────┘  │ │
│  │  ┌──────────┬───────────┬────────┬──────────┐  │ │
│  │  │Audio     │Speech     │SR/TTS  │Flashcard │  │ │
│  │  │Player    │Recorder   │Bridge  │SM-2      │  │ │
│  │  └──────────┴───────────┴────────┴──────────┘  │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐ │
│  │              Data Layer (SQLite)                │ │
│  │  ┌──────────┬───────────┬────────┬──────────┐  │ │
│  │  │Content   │Progress   │Vocab   │Settings  │  │ │
│  │  │Tables    │Tables     │Tables  │Table     │  │ │
│  │  └──────────┴───────────┴────────┴──────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐ │
│  │           Asset Layer (Bundled)                  │ │
│  │  ┌──────────┬───────────┬────────────────────┐ │ │
│  │  │JSON      │MP3 Audio  │Images (for tasks)  │ │ │
│  │  │Content   │Files      │                    │ │ │
│  │  └──────────┴───────────┴────────────────────┘ │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 6. Database Schema

```sql
-- User progress and settings
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_level TEXT NOT NULL DEFAULT 'A1', -- A1|A2|B1|B2|C1
  display_name TEXT,
  target_exam_date TEXT, -- ISO date
  daily_goal_minutes INTEGER DEFAULT 30,
  study_reminder_time TEXT DEFAULT '19:00',
  notifications_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Track which levels are "unlocked" or active
CREATE TABLE user_levels (
  level TEXT PRIMARY KEY, -- A1|A2|B1|B2|C1
  is_active INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,
  target_hours INTEGER NOT NULL, -- 20 for A1, 30 for A2, etc.
  readiness_score REAL DEFAULT 0.0, -- 0.0 to 1.0
  last_studied_at TEXT
);

-- Mock exam attempts
CREATE TABLE exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  mock_id TEXT NOT NULL, -- e.g. "A1_mock_01"
  mode TEXT NOT NULL, -- 'exam_sim' | 'practice'
  started_at TEXT NOT NULL,
  completed_at TEXT,
  -- Section scores (nullable if not yet completed)
  listening_score REAL,
  listening_max REAL,
  reading_score REAL,
  reading_max REAL,
  writing_score REAL,
  writing_max REAL,
  sprachbausteine_score REAL, -- B1+ only
  sprachbausteine_max REAL,
  speaking_score REAL, -- self-assessed or AI-assessed
  speaking_max REAL,
  total_score REAL,
  total_max REAL,
  passed INTEGER, -- 0 or 1
  time_spent_seconds INTEGER
);

-- Individual question responses (for analytics)
CREATE TABLE question_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_attempt_id INTEGER,
  level TEXT NOT NULL,
  mock_id TEXT NOT NULL,
  section TEXT NOT NULL, -- listening|reading|writing|sprachbausteine|speaking
  part INTEGER NOT NULL, -- 1, 2, 3
  question_index INTEGER NOT NULL,
  user_answer TEXT,
  correct_answer TEXT,
  is_correct INTEGER,
  time_spent_seconds INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_attempt_id) REFERENCES exam_attempts(id)
);

-- Vocabulary flashcards with SM-2 spaced repetition
CREATE TABLE vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL, -- A1|A2|B1|B2|C1
  german TEXT NOT NULL,
  english TEXT NOT NULL,
  article TEXT, -- der|die|das (for nouns)
  plural TEXT,
  example_sentence TEXT,
  topic TEXT, -- from Wortgruppenliste categories
  audio_file TEXT, -- path to pronunciation audio
  -- SM-2 fields
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_date TEXT,
  last_reviewed_at TEXT
);

-- Grammar rules database
CREATE TABLE grammar_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  topic TEXT NOT NULL, -- e.g. "Perfekt mit haben"
  explanation TEXT NOT NULL,
  examples TEXT NOT NULL, -- JSON array of example sentences
  exercises TEXT, -- JSON array of exercise items
  order_index INTEGER NOT NULL
);

-- Study sessions log
CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- exam_sim|practice|vocab|grammar|listening|reading|writing|speaking
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER,
  score REAL, -- percentage if applicable
  items_completed INTEGER DEFAULT 0
);

-- Streak tracking
CREATE TABLE streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL, -- YYYY-MM-DD
  study_minutes INTEGER DEFAULT 0,
  activities_completed INTEGER DEFAULT 0
);

-- Bookmarked/flagged questions for review
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  mock_id TEXT NOT NULL,
  section TEXT NOT NULL,
  part INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 7. Content Data Structures (JSON Schemas)

### 7.1 Mock Exam Structure

```typescript
// types/exam.ts

interface MockExam {
  id: string;                    // "A1_mock_01"
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  title: string;                 // "Übungstest 1"
  version: number;               // content version for updates
  sections: {
    listening: ListeningSection;
    reading: ReadingSection;
    writing: WritingSection;
    sprachbausteine?: SprachbausteineSection;  // B1+ only
    speaking: SpeakingSection;
  };
}

// --- LISTENING ---

interface ListeningSection {
  totalTimeMinutes: number;      // 20 for A1, 30 for B1, etc.
  parts: ListeningPart[];
}

interface ListeningPart {
  partNumber: number;
  instructions: string;          // in German
  instructionsTranslation: string; // in English
  audioFile: string;             // path to audio file
  playCount: number;             // 1 or 2
  questions: ListeningQuestion[];
}

interface ListeningQuestion {
  id: string;
  type: "mcq" | "true_false" | "matching";
  questionText: string;
  questionImage?: string;        // path to image (for A1 picture-based MCQ)
  options?: string[];            // for MCQ
  correctAnswer: string;        // "a" | "b" | "c" | "richtig" | "falsch"
  explanation: string;           // why this answer is correct
  audioTimestamp?: number;       // seconds into audio where answer clue appears
}

// --- READING ---

interface ReadingSection {
  totalTimeMinutes: number;
  parts: ReadingPart[];
}

interface ReadingPart {
  partNumber: number;
  instructions: string;
  instructionsTranslation: string;
  texts: ReadingText[];          // the passage(s) to read
  questions: ReadingQuestion[];
}

interface ReadingText {
  id: string;
  type: "email" | "ad" | "notice" | "article" | "letter";
  content: string;               // the text content
  source?: string;               // e.g. "Zeitung", "Website"
}

interface ReadingQuestion {
  id: string;
  type: "true_false" | "mcq" | "matching";
  questionText: string;
  relatedTextId?: string;        // which text this question refers to
  options?: string[];
  matchingSources?: { id: string; label: string }[];  // for matching tasks
  correctAnswer: string;
  explanation: string;
}

// --- WRITING ---

interface WritingSection {
  totalTimeMinutes: number;
  tasks: WritingTask[];
}

interface WritingTask {
  taskNumber: number;
  type: "form_fill" | "short_message" | "letter" | "essay";
  instructions: string;
  instructionsTranslation: string;
  // For form_fill:
  formFields?: FormField[];
  // For short_message/letter/essay:
  prompt?: string;
  promptTranslation?: string;
  requiredPoints?: string[];     // points that must be addressed
  wordCountMin?: number;
  wordCountMax?: number;
  sampleAnswer: string;          // model answer for comparison
  scoringCriteria: ScoringCriteria[];
}

interface FormField {
  label: string;
  correctAnswer: string;
  hint?: string;
}

interface ScoringCriteria {
  criterion: string;             // e.g. "Aufgabenerfüllung"
  maxPoints: number;
  description: string;
}

// --- SPRACHBAUSTEINE (B1+) ---

interface SprachbausteineSection {
  parts: SprachbausteinePart[];
}

interface SprachbausteinePart {
  partNumber: number;
  instructions: string;
  text: string;                  // text with blanks marked as ___[1]___, ___[2]___, etc.
  questions: SprachbausteineQuestion[];
}

interface SprachbausteineQuestion {
  blankNumber: number;
  type: "mcq" | "word_bank";
  options: string[];             // 3 for B1 MCQ, 15 for word bank
  correctAnswer: string;
  explanation: string;
}

// --- SPEAKING ---

interface SpeakingSection {
  totalTimeMinutes: number;
  prepTimeMinutes: number;       // 0 for A1, 20 for B1/B2, 0 for C1
  parts: SpeakingPart[];
}

interface SpeakingPart {
  partNumber: number;
  instructions: string;
  instructionsTranslation: string;
  type: "introduce" | "picture_cards" | "und_du" | "conversation" | "planning" | "presentation" | "discussion";
  prompt: string;
  promptImage?: string;
  sampleResponse: string;        // model answer text
  sampleAudioFile?: string;      // model answer audio
  evaluationTips: string[];
  keyPhrases: string[];          // useful phrases for this task
}
```

### 7.2 Example A1 Mock Content (JSON)

```json
{
  "id": "A1_mock_01",
  "level": "A1",
  "title": "Übungstest 1",
  "version": 1,
  "sections": {
    "listening": {
      "totalTimeMinutes": 20,
      "parts": [
        {
          "partNumber": 1,
          "instructions": "Was ist richtig? Kreuzen Sie an: a, b oder c.",
          "instructionsTranslation": "What is correct? Mark: a, b or c.",
          "audioFile": "assets/audio/A1/mock01/listening_part1.mp3",
          "playCount": 2,
          "questions": [
            {
              "id": "A1_m01_L1_q1",
              "type": "mcq",
              "questionText": "Wo ist das Museum?",
              "questionImage": "assets/images/A1/mock01/L1_q1_museum.png",
              "options": [
                "a) Links neben der Kirche",
                "b) Rechts neben dem Bahnhof",
                "c) Am Marktplatz"
              ],
              "correctAnswer": "c",
              "explanation": "Im Dialog sagt die Frau: 'Das Museum ist direkt am Marktplatz.'",
              "audioTimestamp": 15
            }
          ]
        }
      ]
    },
    "reading": {
      "totalTimeMinutes": 25,
      "parts": [
        {
          "partNumber": 1,
          "instructions": "Lesen Sie die Texte und die Aufgaben. Kreuzen Sie an: Richtig oder Falsch.",
          "instructionsTranslation": "Read the texts and tasks. Mark: True or False.",
          "texts": [
            {
              "id": "A1_m01_R1_text1",
              "type": "email",
              "content": "Liebe Maria,\n\nam Samstag ziehe ich in meine neue Wohnung um. Die Wohnung hat drei Zimmer: ein Schlafzimmer, ein Wohnzimmer und eine Küche. Das Schlafzimmer ist sehr hell. Kannst du mir beim Umzug helfen?\n\nViele Grüße\nAnna"
            }
          ],
          "questions": [
            {
              "id": "A1_m01_R1_q1",
              "type": "true_false",
              "questionText": "Anna hat eine neue Wohnung.",
              "relatedTextId": "A1_m01_R1_text1",
              "correctAnswer": "richtig",
              "explanation": "Anna schreibt 'am Samstag ziehe ich in meine neue Wohnung um'."
            },
            {
              "id": "A1_m01_R1_q2",
              "type": "true_false",
              "questionText": "Das Schlafzimmer ist dunkel.",
              "relatedTextId": "A1_m01_R1_text1",
              "correctAnswer": "falsch",
              "explanation": "Anna schreibt 'Das Schlafzimmer ist sehr hell' (= bright), nicht dunkel."
            }
          ]
        }
      ]
    },
    "writing": {
      "totalTimeMinutes": 20,
      "tasks": [
        {
          "taskNumber": 1,
          "type": "form_fill",
          "instructions": "Ihr Freund Björn möchte Mitglied im Sportverein 'Fit24' werden. Füllen Sie das Formular aus.",
          "instructionsTranslation": "Your friend Björn wants to join the sports club 'Fit24'. Fill in the form.",
          "formFields": [
            { "label": "Geburtsdatum", "correctAnswer": "15.03.1990", "hint": "Björn ist am 15. März 1990 geboren." },
            { "label": "Beruf", "correctAnswer": "Lehrer", "hint": "Björn arbeitet als Lehrer." },
            { "label": "Sportart", "correctAnswer": "Schwimmen", "hint": "Björn möchte schwimmen." },
            { "label": "Mitgliedschaft ab", "correctAnswer": "01.04.2025", "hint": "Ab April 2025." },
            { "label": "Telefonnummer", "correctAnswer": "0176-1234567", "hint": "Björns Nummer." }
          ]
        },
        {
          "taskNumber": 2,
          "type": "short_message",
          "instructions": "Sie möchten am Samstag mit Ihrer Freundin Maria wandern gehen. Schreiben Sie eine Nachricht.",
          "instructionsTranslation": "You want to go hiking with your friend Maria on Saturday. Write a message.",
          "requiredPoints": ["Wanderung vorschlagen", "Treffpunkt", "Uhrzeit"],
          "wordCountMin": 30,
          "wordCountMax": 40,
          "sampleAnswer": "Liebe Maria,\nam Samstag möchte ich wandern gehen. Kommst du mit? Wir treffen uns um 10 Uhr am Bahnhof.\nViele Grüße\nAnna",
          "scoringCriteria": [
            { "criterion": "Aufgabenerfüllung", "maxPoints": 4, "description": "All required points addressed" },
            { "criterion": "Kommunikative Gestaltung", "maxPoints": 4, "description": "Greeting, closing, coherent" },
            { "criterion": "Korrektheit", "maxPoints": 4, "description": "Grammar and spelling" }
          ]
        }
      ]
    },
    "speaking": {
      "totalTimeMinutes": 15,
      "prepTimeMinutes": 0,
      "parts": [
        {
          "partNumber": 1,
          "instructions": "Stellen Sie sich bitte vor.",
          "instructionsTranslation": "Please introduce yourself.",
          "type": "introduce",
          "prompt": "Name? Alter? Land? Wohnort? Sprachen? Beruf? Hobby?",
          "sampleResponse": "Hallo, mein Name ist Kiran. Ich bin 35 Jahre alt. Ich komme aus Indien und wohne jetzt in Berlin. Ich spreche Hindi, Englisch und ein bisschen Deutsch. Ich bin Ingenieur von Beruf. Mein Hobby ist Lesen.",
          "sampleAudioFile": "assets/audio/A1/mock01/speaking_part1_sample.mp3",
          "evaluationTips": ["Speak slowly and clearly", "Cover at least 4 of the 7 points", "Use complete sentences"],
          "keyPhrases": ["Mein Name ist...", "Ich bin ... Jahre alt.", "Ich komme aus...", "Ich wohne in...", "Ich spreche...", "Ich bin ... von Beruf.", "Mein Hobby ist..."]
        }
      ]
    }
  }
}
```

---

## 8. Project File Structure

```
telc-fasttrack/
├── app.json                          # Expo config
├── tsconfig.json
├── package.json
├── eas.json                          # EAS Build config
├── babel.config.js
│
├── src/
│   ├── app/                          # Expo Router screens
│   │   ├── _layout.tsx               # Root layout (tabs)
│   │   ├── index.tsx                 # Dashboard/Home
│   │   ├── practice/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Level & section selection
│   │   │   ├── listening.tsx         # Listening practice
│   │   │   ├── reading.tsx           # Reading practice
│   │   │   ├── writing.tsx           # Writing practice
│   │   │   ├── speaking.tsx          # Speaking practice
│   │   │   ├── sprachbausteine.tsx   # Grammar/vocab cloze
│   │   │   └── vocabulary.tsx        # Flashcard drill
│   │   ├── exam/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Mock exam selection
│   │   │   ├── simulator.tsx         # Full exam simulation
│   │   │   └── results.tsx           # Score report
│   │   ├── resources/
│   │   │   ├── index.tsx             # Links to external resources
│   │   │   └── grammar.tsx           # Grammar reference per level
│   │   └── settings/
│   │       └── index.tsx             # Settings, level selection
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Timer.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── StreakCounter.tsx
│   │   ├── exam/                     # Exam-specific components
│   │   │   ├── MCQQuestion.tsx
│   │   │   ├── TrueFalseQuestion.tsx
│   │   │   ├── MatchingQuestion.tsx
│   │   │   ├── FormFillQuestion.tsx
│   │   │   ├── WritingTask.tsx
│   │   │   ├── SpeakingTask.tsx
│   │   │   ├── AudioPlayer.tsx       # Listening section audio
│   │   │   ├── VoiceRecorder.tsx     # Speaking practice recorder
│   │   │   └── SectionHeader.tsx
│   │   ├── flashcard/
│   │   │   ├── FlashCard.tsx
│   │   │   └── FlashCardDeck.tsx
│   │   └── dashboard/
│   │       ├── LevelSelector.tsx
│   │       ├── StudyPlanWidget.tsx
│   │       ├── ProgressChart.tsx
│   │       └── ReadinessGauge.tsx
│   │
│   ├── services/
│   │   ├── database.ts               # SQLite initialization & migrations
│   │   ├── contentLoader.ts          # Load JSON content from assets
│   │   ├── scoringEngine.ts          # Calculate scores per telc criteria
│   │   ├── progressTracker.ts        # Track & compute progress/readiness
│   │   ├── spacedRepetition.ts       # SM-2 algorithm for vocab
│   │   ├── audioService.ts           # Audio playback management
│   │   ├── speechService.ts          # TTS + speech recognition
│   │   ├── timerService.ts           # Exam timer management
│   │   └── studyPlanEngine.ts        # "X hours to pass" algorithm
│   │
│   ├── hooks/
│   │   ├── useDatabase.ts
│   │   ├── useExam.ts
│   │   ├── useTimer.ts
│   │   ├── useAudioPlayer.ts
│   │   └── useProgress.ts
│   │
│   ├── context/
│   │   ├── AppContext.tsx             # Global app state
│   │   ├── ExamContext.tsx            # Active exam state
│   │   └── LevelContext.tsx           # Current level context
│   │
│   ├── types/
│   │   ├── exam.ts                   # All exam-related types (from §7)
│   │   ├── progress.ts               # Progress tracking types
│   │   ├── vocabulary.ts             # Vocab/flashcard types
│   │   └── navigation.ts             # Route param types
│   │
│   ├── utils/
│   │   ├── constants.ts              # Level configs, timing, scoring
│   │   ├── helpers.ts                # Formatting, scoring calc
│   │   └── theme.ts                  # Colors, typography
│   │
│   └── data/                         # Seed data (loaded into SQLite)
│       ├── vocabulary/
│       │   ├── A1_vocabulary.json
│       │   ├── A2_vocabulary.json
│       │   ├── B1_vocabulary.json
│       │   ├── B2_vocabulary.json
│       │   └── C1_vocabulary.json
│       └── grammar/
│           ├── A1_grammar.json
│           ├── A2_grammar.json
│           ├── B1_grammar.json
│           ├── B2_grammar.json
│           └── C1_grammar.json
│
├── assets/
│   ├── content/                      # Mock exam JSON files
│   │   ├── A1/
│   │   │   ├── mock_01.json
│   │   │   ├── mock_02.json
│   │   │   └── ... (10 per level)
│   │   ├── A2/
│   │   ├── B1/
│   │   ├── B2/
│   │   └── C1/
│   ├── audio/                        # Pre-generated TTS audio
│   │   ├── A1/
│   │   │   ├── mock01/
│   │   │   │   ├── listening_part1.mp3
│   │   │   │   ├── listening_part2.mp3
│   │   │   │   ├── listening_part3.mp3
│   │   │   │   └── speaking_part1_sample.mp3
│   │   │   └── mock02/
│   │   ├── A2/
│   │   ├── B1/
│   │   ├── B2/
│   │   └── C1/
│   ├── images/                       # Task images (signs, ads, etc.)
│   │   ├── A1/
│   │   ├── A2/
│   │   └── ...
│   ├── fonts/
│   └── icon.png
│
└── scripts/
    ├── generateAudio.ts              # TTS audio generation script
    ├── seedDatabase.ts               # Initial DB seeding
    └── validateContent.ts            # Validate JSON content structure
```

---

## 9. Screen-by-Screen UI Flow

### 9.1 Dashboard (Home Tab)

```
┌──────────────────────────┐
│  🇩🇪  Telc-FastTrack     │
│                          │
│  ┌──────────────────────┐│
│  │ Level: [A1 ▼]        ││
│  │ "20 Stunden.         ││
│  │  1 Zertifikat."      ││
│  └──────────────────────┘│
│                          │
│  ⏱ 4.5 / 20 Stunden     │
│  ████████░░░░░░░ 22%     │
│                          │
│  📊 Readiness Score: 35% │
│  ┌─────────────────┐    │
│  │ [Radial gauge]   │    │
│  │   Not Ready → Ready  │
│  └─────────────────┘    │
│                          │
│  🔥 Streak: 5 Tage      │
│                          │
│  Section Breakdown:      │
│  Hören:    ██████░░ 60%  │
│  Lesen:    ████████ 80%  │
│  Schreiben:████░░░░ 40%  │
│  Sprechen: ███░░░░░ 30%  │
│                          │
│  [Start Practice]        │
│  [Take Mock Exam]        │
│                          │
│ ─── ─── ─── ─── ─── ─── │
│ 🏠   📝   📋   📚   ⚙️  │
│ Home Practice Exam Res. Set│
└──────────────────────────┘
```

### 9.2 Practice Tab

```
┌──────────────────────────┐
│  Practice Mode   [A1 ▼]  │
│                          │
│  ┌────────┐ ┌────────┐  │
│  │ 🎧     │ │ 📖     │  │
│  │ Hören  │ │ Lesen  │  │
│  │ 12/30  │ │ 18/30  │  │
│  └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐  │
│  │ ✏️     │ │ 🗣     │  │
│  │Schreib.│ │Sprechen│  │
│  │ 5/20   │ │ 3/15   │  │
│  └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐  │
│  │ 🔤     │ │ 📇     │  │
│  │Sprach- │ │ Vokabel│  │
│  │bausteine││Trainer │  │
│  │ (B1+)  │ │ 45/650 │  │
│  └────────┘ └────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ 📝 Grammatik       │  │
│  │ Reference & Drills │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### 9.3 Exam Simulator Flow

```
Select Mock → Section Order → Answer → Next Section → Score Report

┌──────────────────────────┐
│  Übungstest 1 — A1       │
│                          │
│  ⏱ 18:32 remaining      │
│  ═══════════════════     │
│                          │
│  Teil 1: Hören           │
│  Frage 2 von 3           │
│                          │
│  [▶️ Audio abspielen]    │
│  ▬▬▬▬▬●▬▬▬▬▬▬▬▬ 0:45   │
│                          │
│  Wo ist das Museum?      │
│                          │
│  ○ a) Links neben der    │
│       Kirche             │
│  ● b) Rechts neben dem   │
│       Bahnhof            │
│  ○ c) Am Marktplatz      │
│                          │
│  [← Zurück] [Weiter →]  │
│                          │
│  2/11 Fragen beantwortet │
│  ▓▓░░░░░░░░░             │
└──────────────────────────┘
```

### 9.4 Score Report

```
┌──────────────────────────┐
│  📊 Ergebnis             │
│  Übungstest 1 — A1       │
│                          │
│  Gesamt: 72% ✅ BESTANDEN│
│                          │
│  ┌───────────────┬──────┐│
│  │ Hören         │ 75%  ││
│  │ ████████████░░│      ││
│  ├───────────────┼──────┤│
│  │ Lesen         │ 80%  ││
│  │ █████████████░│      ││
│  ├───────────────┼──────┤│
│  │ Schreiben     │ 58%  ││
│  │ █████████░░░░░│ ⚠️   ││
│  ├───────────────┼──────┤│
│  │ Sprechen      │ 75%  ││
│  │ ████████████░░│      ││
│  └───────────────┴──────┘│
│                          │
│  ⚠️ Schreiben needs work │
│  Tip: Practice form-fill │
│  and short messages      │
│                          │
│  [Review Answers]        │
│  [Try Another Mock]      │
│  [Practice Weak Areas]   │
└──────────────────────────┘
```

### 9.5 Resources Tab

```
┌──────────────────────────┐
│  📚 Ressourcen    [A1 ▼] │
│                          │
│  Official Mock Exams     │
│  ┌────────────────────┐  │
│  │ 📄 telc A1 Übungs- │  │
│  │   test (PDF+Audio)  │  │
│  │   [Open Link →]     │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ 📄 Goethe A1       │  │
│  │   Exam Training     │  │
│  │   [Open Link →]     │  │
│  └────────────────────┘  │
│                          │
│  Vocabulary Lists        │
│  ┌────────────────────┐  │
│  │ 📝 Goethe A1       │  │
│  │   Wortliste (PDF)   │  │
│  │   [Open Link →]     │  │
│  └────────────────────┘  │
│                          │
│  Video Channels          │
│  ┌────────────────────┐  │
│  │ 🎬 Easy German     │  │
│  │ 🎬 Deutsch m/Marija│  │
│  │ 🎬 DW Nicos Weg    │  │
│  └────────────────────┘  │
│                          │
│  Grammar Reference       │
│  ┌────────────────────┐  │
│  │ [View A1 Grammar →]│  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## 10. Content Generation Pipeline

### 10.1 Strategy

The app ships with **10 original mock exams per level** (50 total across A1-C1). These are created using LLMs (Claude) with strict constraints to match telc format and CEFR-level vocabulary.

### 10.2 Content Generation Workflow

```
Step 1: TEMPLATE DEFINITION
    - Define exact question count, types, timing per level (from §1)
    - Create JSON schema validators (from §7)

Step 2: TOPIC MATRIX
    - Map all 18 Wortgruppenliste categories per level
    - Ensure each mock covers different topic combinations
    - No two mocks have overlapping reading texts or listening scenarios

Step 3: TEXT GENERATION (Claude)
    - Generate texts within CEFR level vocabulary constraints
    - Reading texts: emails, ads, notices, articles (per level spec)
    - Listening scripts: dialogues, announcements, interviews
    - Writing prompts + model answers
    - Speaking prompts + key phrases
    - Use Goethe Wortliste as vocabulary constraint filter

Step 4: QUESTION GENERATION
    - For each text: generate questions matching telc task types
    - Include explanations for every answer
    - Validate difficulty stays within CEFR level

Step 5: AUDIO GENERATION
    - Convert listening scripts to SSML
    - Generate audio via Google Cloud TTS (multiple voices for dialogues)
    - Add appropriate pauses, speed variations per level
    - A1: slower speed (0.85x), B2/C1: natural speed (1.0x)

Step 6: VALIDATION
    - Run JSON schema validation on all content
    - Cross-check vocabulary against Wortliste
    - Test-run mock exams in app
    - Review by German speaker (ideally telc-experienced)

Step 7: BUNDLE
    - Package JSON + audio into app assets
    - Generate vocabulary flashcard decks from mock content
```

### 10.3 Content Generation Prompt Template (for Claude)

```markdown
Generate a complete telc Deutsch [LEVEL] mock exam (Übungstest) in JSON format.

CONSTRAINTS:
- Use ONLY vocabulary from the Goethe [LEVEL] Wortliste
- Follow the exact telc [LEVEL] exam structure (see spec below)
- All texts must be original (do not copy from existing exams)
- Topics for this mock: [TOPIC_1], [TOPIC_2], [TOPIC_3]
- Reading texts should be 50-80 words (A1) / 100-150 words (B1) / 200-300 words (B2)
- Include explanations for every correct answer in German and English
- Include 3-5 key vocabulary items per question for flashcard extraction

OUTPUT: Valid JSON matching the MockExam TypeScript interface.
```

---

## 11. Study Plan Engine ("X Hours to Pass")

### 11.1 Hours-to-Pass Matrix

| Level | Target Hours in App | Breakdown |
|-------|-------------------|-----------|
| **A1** | 20 hours | 5h vocab + 5h listening + 4h reading + 3h writing + 3h speaking |
| **A2** | 30 hours | 7h vocab + 7h listening + 6h reading + 5h writing + 5h speaking |
| **B1** | 40 hours | 8h vocab/grammar + 10h listening + 8h reading + 7h writing + 7h speaking |
| **B2** | 50 hours | 10h vocab/grammar + 12h listening + 10h reading + 9h writing + 9h speaking |
| **C1** | 60 hours | 12h vocab/grammar + 14h listening + 12h reading + 11h writing + 11h speaking |

> NOTE: These are *focused exam prep* hours, assuming the candidate has already completed general coursework at the appropriate level. For absolute beginners at A1, 20 hours of focused mock exam practice on top of 80-100 hours of general learning.

### 11.2 Study Plan Algorithm

```typescript
interface StudyPlan {
  level: string;
  targetHours: number;
  dailyMinutes: number;           // user-configured
  estimatedDays: number;
  phases: StudyPhase[];
}

interface StudyPhase {
  name: string;
  percentage: number;             // % of total hours
  activities: Activity[];
}

// Phase distribution:
// Phase 1: Foundation (30%) — vocab flashcards, grammar review, familiarize with format
// Phase 2: Section Practice (40%) — targeted drills per section (listening, reading, etc.)
// Phase 3: Mock Exams (30%) — full timed mock exams, review weak areas

// Daily recommendation algorithm:
function getDailyPlan(userProgress, weakAreas, studyPlan) {
  // 1. Check streak — if missed yesterday, start with easy warm-up
  // 2. Prioritize weak areas (lowest section scores)
  // 3. Spaced repetition vocab due today
  // 4. Alternate sections to avoid fatigue
  // 5. Every 3rd day: mini-mock (1 section timed)
  // 6. Every 7th day: full mock exam
  // 7. Final 3 days: only full mocks
}
```

### 11.3 Readiness Score Calculation

```typescript
function calculateReadiness(level: string, progress: UserProgress): number {
  const weights = {
    mockExamAverage: 0.40,      // Average mock exam score
    sectionMinimums: 0.25,      // All sections above 60%?
    hoursCompleted: 0.15,       // % of target hours completed
    vocabMastery: 0.10,         // % of level vocab reviewed
    streakConsistency: 0.10,    // Study consistency
  };

  const mockScore = progress.averageMockScore / 100;
  const sectionMin = progress.allSectionsAbove60 ? 1.0 : Math.min(...progress.sectionScores) / 60;
  const hours = Math.min(progress.hoursCompleted / targetHours[level], 1.0);
  const vocab = progress.vocabReviewed / totalVocab[level];
  const streak = Math.min(progress.currentStreak / 14, 1.0); // 14-day streak = max

  return (
    mockScore * weights.mockExamAverage +
    sectionMin * weights.sectionMinimums +
    hours * weights.hoursCompleted +
    vocab * weights.vocabMastery +
    streak * weights.streakConsistency
  );
  // Returns 0.0–1.0, displayed as percentage
  // 0.8+ = "Ready to take the exam!"
  // 0.6–0.8 = "Almost there, keep practicing"
  // <0.6 = "More study needed"
}
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Project scaffolding, database, navigation, basic UI

- [ ] Initialize Expo project with TypeScript
- [ ] Set up Expo Router with bottom tab navigation (5 tabs)
- [ ] Implement SQLite database with all tables from §6
- [ ] Create seed data loading service
- [ ] Build UI component library (Button, Card, ProgressBar, Timer, Badge)
- [ ] Implement theme/styling system
- [ ] Create level selector and settings screen
- [ ] Build dashboard skeleton with progress widgets

### Phase 2: Core Engine (Week 3-4)
**Goal:** Question rendering, scoring, timer, audio

- [ ] Build question renderer components (MCQ, T/F, Matching, FormFill)
- [ ] Implement scoring engine matching telc criteria per level
- [ ] Build timer service with pause/resume and per-section limits
- [ ] Integrate expo-audio for listening section playback
- [ ] Build audio player component with play/pause/replay controls
- [ ] Implement writing task component (text input + word counter)
- [ ] Build speaking task component with voice recorder
- [ ] Create exam flow controller (section navigation, progress tracking)

### Phase 3: Content — A1 Complete (Week 5-6)
**Goal:** Full A1 with 10 mock exams, vocab, grammar

- [ ] Generate 10 A1 mock exam JSON files using Claude
- [ ] Generate A1 listening audio using Google Cloud TTS
- [ ] Create A1 vocabulary flashcard deck (650 words from Goethe Wortliste)
- [ ] Create A1 grammar reference content
- [ ] Implement SM-2 spaced repetition for vocabulary
- [ ] Build flashcard UI (flip card, swipe correct/incorrect)
- [ ] Validate all A1 content with JSON schema
- [ ] Test full A1 exam simulation end-to-end

### Phase 4: Exam Simulator & Practice Mode (Week 7-8)
**Goal:** Complete exam simulation and section-focused practice

- [ ] Build exam simulator screen (full timed mock with section transitions)
- [ ] Build practice mode screen (pick section, untimed, instant feedback)
- [ ] Implement score report screen with section breakdown
- [ ] Build "Review Answers" screen showing correct/incorrect with explanations
- [ ] Add answer bookmarking for later review
- [ ] Build weak area identification and recommendation engine

### Phase 5: Progress & Gamification (Week 9-10)
**Goal:** Study plan, streaks, readiness, notifications

- [ ] Implement study plan engine ("X hours to pass")
- [ ] Build daily recommendation algorithm
- [ ] Implement readiness score calculation and gauge display
- [ ] Build streak tracking with calendar heatmap
- [ ] Add achievement badges system
- [ ] Implement push notifications (study reminders via expo-notifications)
- [ ] Build progress chart (score trends over time)

### Phase 6: Content Expansion — A2, B1 (Week 11-14)
**Goal:** A2 and B1 complete with 10 mocks each

- [ ] Generate A2 content (10 mocks + vocab + grammar)
- [ ] Generate A2 audio files
- [ ] Add Sprachbausteine component (B1+)
- [ ] Generate B1 content (10 mocks + vocab + grammar + Sprachbausteine)
- [ ] Generate B1 audio files
- [ ] Add speaking prep timer (20 min for B1)
- [ ] Test A2 and B1 exam simulations

### Phase 7: Content Expansion — B2, C1 (Week 15-18)
**Goal:** B2 and C1 complete

- [ ] Generate B2 content (10 mocks + vocab + grammar)
- [ ] Generate B2 audio files
- [ ] Generate C1 content (10 mocks + vocab + grammar)
- [ ] Generate C1 audio files
- [ ] Add C1-specific features (no prep time, presentation task)
- [ ] Test B2 and C1 exam simulations

### Phase 8: Resources & Polish (Week 19-20)
**Goal:** Resources section, polish, testing

- [ ] Build resources screen with curated links per level
- [ ] Build grammar reference browser
- [ ] UI polish (animations, transitions, loading states)
- [ ] Accessibility review
- [ ] Performance optimization (lazy loading, audio preloading)
- [ ] Beta testing with German learners
- [ ] Bug fixes and content corrections

### Phase 9: Release (Week 21-22)
**Goal:** App store submission

- [ ] EAS Build for iOS and Android
- [ ] App Store screenshots and metadata
- [ ] Play Store listing
- [ ] Landing page (optional — could use kirankbs.com subdomain)
- [ ] Submit to app stores

---

## 13. Key NPM Packages

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-sqlite": "~15.0.0",
    "expo-audio": "~0.3.0",
    "expo-speech": "~13.0.0",
    "expo-file-system": "~18.0.0",
    "expo-notifications": "~0.29.0",
    "expo-haptics": "~14.0.0",
    "expo-linking": "~7.0.0",
    "@expo/vector-icons": "^14.0.0",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-safe-area-context": "~4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "~15.8.0",
    "date-fns": "^3.0.0",
    "@jamsch/expo-speech-recognition": "^0.4.0"
  },
  "devDependencies": {
    "typescript": "~5.3.0",
    "@types/react": "~18.2.0",
    "jest": "^29.0.0",
    "@testing-library/react-native": "^12.0.0"
  }
}
```

---

## Appendix A: Competitor Analysis — What Exists & What's Missing

### Existing Apps (Researched April 2026)

| App | Platform | Levels | Pricing | Strengths | Weaknesses |
|-----|----------|--------|---------|-----------|------------|
| **German Exam Prep (Efe Kaptan)** | iOS + Android | A1-C1 (Goethe + telc) | Subscription (monthly/6-month) | 50 mock tests, listening with audio, speaking dialogues, writing prompts, flashcards, module selection, progress tracking | Subscription model, no offline mode mentioned, no spaced repetition, no "readiness score", no study plan engine |
| **Telc A1/B1/B2 German (Muhammad Hamada)** | Separate iOS + Android apps per level | A1, B1, B2 (separate apps) | Free with ads / Premium ad-free | Complete exam coverage per level, multi-language UI (EN/DE/ES/AR), realistic mock exams, instant scoring, cloud backup | Fragmented (SEPARATE APP per level — must download 3+ apps), app updates have deleted user progress (per App Store reviews), no vocab/grammar integration, ad-supported |
| **Gibi** | iOS + Android | Goethe + telc speaking only | One-time €35–€45 (tiered) | AI speaking feedback within seconds, mock tests matching real format, 24/7 AI speaking coach, high-scoring sample student answers, smart topic bank | Speaking-ONLY (no reading/writing/listening practice), expensive one-time, not comprehensive exam prep |
| **DeutschExam.ai** | Web platform (no native app) | A1, A2, B1, B2, DTZ | Freemium + subscription per level | 100+ AI mock exams, 500+ audio questions, AI writing/speaking feedback, instant grading, progress tracking | Web-only (NO mobile app), no offline support, no C1, subscription per level, limited free tier |
| **Anki (community decks)** | All platforms | A1-B1 (Goethe Wortliste decks) | Free | Powerful spaced repetition, Goethe A1 Wortliste deck exists on AnkiWeb | No exam simulation whatsoever, no listening/writing/speaking practice, steep learning curve, ugly UI |

### Gap Analysis — Where Telc-FastTrack Wins

| Feature | Competitors | Telc-FastTrack |
|---------|------------|----------------|
| **Offline-first** | Most require internet | Full offline with bundled audio + SQLite |
| **"X hours to pass" study plan** | None offer this | Adaptive daily plan with readiness gauge |
| **All levels A1-C1 in one app** | Most cover 1-3 levels | All 5 levels, unlockable |
| **Free / no subscription** | All charge subscriptions | Free core (or one-time purchase) |
| **Spaced repetition for vocab** | Only Anki (separate app) | Built-in SM-2 flashcards per level |
| **Pre-generated native TTS audio** | Some use device TTS or recorded | Google Cloud WaveNet (multiple voices, SSML-controlled speed/pauses) |
| **Exam readiness prediction** | DeutschExam has pass probability | Weighted readiness score across 5 dimensions |
| **Curated external resources** | Links scattered in blogs | In-app Resources tab with curated links per level |
| **Writing task evaluation** | DeutschExam has AI feedback | Sample answer comparison + scoring criteria checklist |
| **Open content pipeline** | Proprietary content | LLM-generated, CEFR-constrained, community-expandable |

### Key Differentiator

No existing app combines: (1) realistic telc exam simulator with proper timing, (2) spaced repetition vocabulary tied to exam content, (3) adaptive study plans with hour-based readiness prediction, (4) all 5 levels A1-C1, (5) offline-first — in a single free/one-time-purchase mobile app. DeutschExam.ai comes closest but is web-only and subscription-based.

---

## Appendix B: What This Plan Does Better Than the ChatGPT Report

| Aspect | ChatGPT Deep Research | This Plan |
|--------|----------------------|-----------|
| **Exam structure** | Generic overview, mixed A1 focus | Detailed per-level breakdown A1–C1 with exact sections, timing, points, pass thresholds |
| **Content schema** | None — just prose descriptions | Complete TypeScript interfaces + example JSON with real mock content |
| **Database design** | Not included | Full SQLite schema with 8 tables, SM-2 fields, streak tracking |
| **File structure** | Not included | Complete project tree with 50+ files mapped |
| **TTS strategy** | Mentioned "native speakers" (expensive, slow) | Hybrid strategy with cost analysis, Google Cloud TTS free tier, SSML examples, voice names |
| **Study plan engine** | "20 hours" mentioned once | Algorithm with readiness scoring, daily recommendation logic, phase breakdown |
| **Implementation phases** | 7 generic bullet points | 9 detailed phases with 80+ specific tasks across 22 weeks |
| **Public resources** | 3-4 references | 25+ curated free resources with URLs per level |
| **Multi-level** | A1 only | A1–C1 with level-specific features (Sprachbausteine, prep time, task types) |
| **Scoring** | "match telc criteria" | Exact pass thresholds per level, section weighting, scoring criteria JSON |
| **Claude Code ready** | Would need significant interpretation | Copy-paste ready: schemas, file structure, package.json, SQL, TypeScript types |

---

## Appendix C: First 3 Commands for Claude Code

```bash
# 1. Initialize the project
npx create-expo-app telc-fasttrack --template expo-template-blank-typescript

# 2. Install core dependencies
cd telc-fasttrack && npx expo install expo-router expo-sqlite expo-audio expo-speech expo-file-system expo-notifications expo-haptics react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-svg @expo/vector-icons date-fns

# 3. Set up the file structure
mkdir -p src/{app/{practice,exam,resources,settings},components/{ui,exam,flashcard,dashboard},services,hooks,context,types,utils,data/{vocabulary,grammar}} assets/{content/{A1,A2,B1,B2,C1},audio/{A1,A2,B1,B2,C1},images/{A1,A2,B1,B2,C1},fonts} scripts
```

---

*This plan was built from primary research of telc.net official specifications, Goethe-Institut CEFR documentation, TTS service pricing pages, and Expo/React Native documentation. Every schema, structure, and recommendation is implementation-ready for Claude Code.*
