// telc exam TypeScript interfaces
// This file is the canonical definition. All agents reference this.
// Source: telc-fasttrack-implementation-plan.md section 7

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface MockExam {
  id: string;                    // "A1_mock_01"
  level: Level;
  title: string;                 // "Übungstest 1"
  version: number;               // content version for updates
  sections: {
    listening: ListeningSection;
    reading: ReadingSection;
    writing: WritingSection;
    sprachbausteine?: SprachbausteineSection; // B1+ only
    speaking: SpeakingSection;
  };
}

// --- LISTENING ---

export interface ListeningSection {
  totalTimeMinutes: number;
  parts: ListeningPart[];
}

export interface ListeningPart {
  partNumber: number;
  instructions: string;
  instructionsTranslation: string;
  audioFile: string;             // path: assets/audio/{level}/mock{NN}/listening_part{N}.mp3
  playCount: number;             // 1 or 2 (A1: parts 1+2 twice, part 3 once)
  questions: ListeningQuestion[];
}

export interface ListeningQuestion {
  id: string;                    // "A1_m01_L1_q1"
  type: 'mcq' | 'true_false' | 'matching';
  questionText: string;
  questionImage?: string;        // path: assets/images/{level}/mock{NN}/...
  options?: string[];            // for mcq
  correctAnswer: string;        // "a" | "b" | "c" | "richtig" | "falsch"
  explanation: string;
  audioTimestamp?: number;       // seconds into audio where answer clue appears
}

// --- READING ---

export interface ReadingSection {
  totalTimeMinutes: number;
  parts: ReadingPart[];
}

export interface ReadingPart {
  partNumber: number;
  instructions: string;
  instructionsTranslation: string;
  texts: ReadingText[];
  questions: ReadingQuestion[];
}

export interface ReadingText {
  id: string;
  type: 'email' | 'ad' | 'notice' | 'article' | 'letter';
  content: string;
  source?: string;
}

export interface ReadingQuestion {
  id: string;
  type: 'true_false' | 'mcq' | 'matching';
  questionText: string;
  relatedTextId?: string;
  options?: string[];
  matchingSources?: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
}

// --- WRITING ---

export interface WritingSection {
  totalTimeMinutes: number;
  tasks: WritingTask[];
}

export interface WritingTask {
  taskNumber: number;
  type: 'form_fill' | 'short_message' | 'letter' | 'essay';
  instructions: string;
  instructionsTranslation: string;
  formFields?: FormField[];      // for form_fill
  prompt?: string;               // for short_message/letter/essay
  promptTranslation?: string;
  requiredPoints?: string[];
  wordCountMin?: number;
  wordCountMax?: number;
  sampleAnswer: string;
  scoringCriteria: ScoringCriteria[];
}

export interface FormField {
  label: string;
  correctAnswer: string;
  hint?: string;
}

export interface ScoringCriteria {
  criterion: string;             // "Aufgabenerfüllung"
  maxPoints: number;
  description: string;
}

// --- SPRACHBAUSTEINE (B1+) ---

export interface SprachbausteineSection {
  parts: SprachbausteinePart[];
}

export interface SprachbausteinePart {
  partNumber: number;
  instructions: string;
  text: string;                  // text with blanks: ___[1]___, ___[2]___
  questions: SprachbausteineQuestion[];
}

export interface SprachbausteineQuestion {
  blankNumber: number;
  type: 'mcq' | 'word_bank';
  options: string[];             // 3 for B1 MCQ, 15 for word bank
  correctAnswer: string;
  explanation: string;
}

// --- SPEAKING ---

export interface SpeakingSection {
  totalTimeMinutes: number;
  prepTimeMinutes: number;       // 0 for A1/A2/C1, 20 for B1/B2
  parts: SpeakingPart[];
}

export type SpeakingPartType =
  | 'introduce'      // A1: Sich vorstellen
  | 'picture_cards'  // A1: Bild und Wortkarte
  | 'und_du'         // A1: "Und du?" Q&A
  | 'conversation'   // A2/B1: Alltagsgespräch
  | 'planning'       // B1/B2: Gemeinsam planen
  | 'presentation'   // B2/C1: Präsentation
  | 'discussion';    // B2/C1: Diskussion

export interface SpeakingPart {
  partNumber: number;
  instructions: string;
  instructionsTranslation: string;
  type: SpeakingPartType;
  prompt: string;
  promptImage?: string;
  sampleResponse: string;
  sampleAudioFile?: string;
  evaluationTips: string[];
  keyPhrases: string[];
}

// --- VOCABULARY ---

export interface VocabularyItem {
  id: number;
  level: Level;
  german: string;
  english: string;
  article?: string;              // der | die | das
  plural?: string;
  exampleSentence?: string;
  topic: string;                 // Wortgruppenliste category
  audioFile?: string;
  // SM-2 spaced repetition fields
  easeFactor: number;            // default 2.5
  intervalDays: number;          // default 0
  repetitions: number;           // default 0
  nextReviewDate?: string;       // ISO date string
  lastReviewedAt?: string;
}

// --- GRAMMAR ---

export interface GrammarTopic {
  id: number;
  level: Level;
  topic: string;                 // "Perfekt mit haben"
  explanation: string;
  examples: string[];            // JSON array of example sentences
  exercises?: GrammarExercise[];
  orderIndex: number;
}

export interface GrammarExercise {
  type: 'fill_blank' | 'mcq' | 'reorder';
  prompt: string;
  correctAnswer: string;
  explanation: string;
}

// --- PROGRESS ---

export interface ExamAttempt {
  id: number;
  level: Level;
  mockId: string;
  startedAt: string;
  completedAt?: string;
  listeningScore?: number;
  listeningMax?: number;
  readingScore?: number;
  readingMax?: number;
  writingScore?: number;
  writingMax?: number;
  sprachbausteineScore?: number;
  sprachbausteineMax?: number;
  speakingScore?: number;
  speakingMax?: number;
  totalScore?: number;
  totalMax?: number;
  passed?: boolean;
  timeSpentSeconds?: number;
}

export interface UserProgress {
  level: Level;
  hoursCompleted: number;
  averageMockScore: number;
  allSectionsAbove60: boolean;
  sectionScores: number[];
  vocabReviewed: number;
  currentStreak: number;
}
