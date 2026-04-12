export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface MockExam {
  id: string;
  level: Level;
  title: string;
  version: number;
  sections: {
    listening: ListeningSection;
    reading: ReadingSection;
    writing: WritingSection;
    sprachbausteine?: SprachbausteineSection;
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
  audioFile: string;
  playCount: number;
  questions: ListeningQuestion[];
}

export interface ListeningQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'matching';
  questionText: string;
  questionImage?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  audioTimestamp?: number;
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
  formFields?: FormField[];
  prompt?: string;
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
  criterion: string;
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
  text: string;
  questions: SprachbausteineQuestion[];
}

export interface SprachbausteineQuestion {
  blankNumber: number;
  type: 'mcq' | 'word_bank';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// --- SPEAKING ---

export interface SpeakingSection {
  totalTimeMinutes: number;
  prepTimeMinutes: number;
  parts: SpeakingPart[];
}

export type SpeakingPartType =
  | 'introduce'
  | 'picture_cards'
  | 'und_du'
  | 'conversation'
  | 'planning'
  | 'presentation'
  | 'discussion';

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
  article?: string;
  plural?: string;
  exampleSentence?: string;
  topic: string;
  audioFile?: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate?: string;
  lastReviewedAt?: string;
}

// --- GRAMMAR ---

export interface GrammarTopic {
  id: number;
  level: Level;
  topic: string;
  explanation: string;
  examples: string[];
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
