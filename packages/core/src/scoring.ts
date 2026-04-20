import type {
  MockExam,
  ListeningSection,
  ReadingSection,
  SprachbausteineSection,
} from '@fastrack/types';

export interface SectionScore {
  earned: number;
  max: number;
  percentage: number;
  passed: boolean;
}

export interface ExamScore {
  listening: SectionScore;
  reading: SectionScore;
  writing: SectionScore;
  sprachbausteine?: SectionScore;
  speaking: SectionScore;
  written: SectionScore;
  oral: SectionScore;
  overall: SectionScore;
  passed: boolean;
}

export type ReadinessLevel = 'building' | 'developing' | 'almost' | 'ready';

const PASS_THRESHOLD = 0.6;

function makeSectionScore(earned: number, max: number): SectionScore {
  const percentage = max > 0 ? earned / max : 0;
  return {
    earned,
    max,
    percentage,
    passed: percentage >= PASS_THRESHOLD,
  };
}

function combineScores(...scores: SectionScore[]): SectionScore {
  const earned = scores.reduce((sum, s) => sum + s.earned, 0);
  const max = scores.reduce((sum, s) => sum + s.max, 0);
  return makeSectionScore(earned, max);
}

export interface QuestionResponse {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  points?: number;
}

export function calculateSectionScore(
  userAnswers: Record<string, string>,
  section: ListeningSection | ReadingSection
): SectionScore {
  let earned = 0;
  let max = 0;

  for (const part of section.parts) {
    for (const question of part.questions) {
      max += 1;
      const answer = userAnswers[question.id];
      if (answer !== undefined && answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        earned += 1;
      }
    }
  }

  return makeSectionScore(earned, max);
}

export function scoreSprachbausteine(
  userAnswers: Record<string, string>,
  section: SprachbausteineSection
): SectionScore {
  let earned = 0;
  let max = 0;

  for (const part of section.parts) {
    for (const q of part.questions) {
      max += 1;
      const key = `sprachbausteine_${part.partNumber}_${q.blankNumber}`;
      const answer = userAnswers[key];
      if (answer !== undefined && answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        earned += 1;
      }
    }
  }

  return makeSectionScore(earned, max);
}

export function calculateExamScore(
  responses: QuestionResponse[],
  exam: MockExam
): ExamScore {
  const responseMap = new Map<string, QuestionResponse>(
    responses.map((r) => [r.questionId, r])
  );

  // Listening
  let listeningEarned = 0;
  let listeningMax = 0;
  for (const part of exam.sections.listening.parts) {
    for (const q of part.questions) {
      listeningMax += 1;
      const r = responseMap.get(q.id);
      if (r !== undefined && r.userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        listeningEarned += 1;
      }
    }
  }
  const listening = makeSectionScore(listeningEarned, listeningMax);

  // Reading
  let readingEarned = 0;
  let readingMax = 0;
  for (const part of exam.sections.reading.parts) {
    for (const q of part.questions) {
      readingMax += 1;
      const r = responseMap.get(q.id);
      if (r !== undefined && r.userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        readingEarned += 1;
      }
    }
  }
  const reading = makeSectionScore(readingEarned, readingMax);

  // Writing
  let writingEarned = 0;
  let writingMax = 0;
  for (const task of exam.sections.writing.tasks) {
    const taskMax = task.scoringCriteria.reduce((s: number, c) => s + c.maxPoints, 0);
    writingMax += taskMax;
    const taskKey = `writing_task_${task.taskNumber}`;
    const r = responseMap.get(taskKey);
    if (r !== undefined && r.points !== undefined) {
      writingEarned += Math.min(r.points, taskMax);
    }
  }
  const writing = makeSectionScore(writingEarned, writingMax);

  // Sprachbausteine (B1+)
  let sprachbausteine: SectionScore | undefined;
  if (exam.sections.sprachbausteine !== undefined) {
    const userAnswers: Record<string, string> = {};
    for (const [id, r] of responseMap) {
      userAnswers[id] = r.userAnswer;
    }
    sprachbausteine = scoreSprachbausteine(userAnswers, exam.sections.sprachbausteine);
  }

  // Speaking
  let speakingEarned = 0;
  let speakingMax = 0;
  for (const part of exam.sections.speaking.parts) {
    const partMax = 8;
    speakingMax += partMax;
    const partKey = `speaking_part_${part.partNumber}`;
    const r = responseMap.get(partKey);
    if (r !== undefined && r.points !== undefined) {
      speakingEarned += Math.min(r.points, partMax);
    }
  }
  const speaking = makeSectionScore(speakingEarned, speakingMax);

  // Aggregate
  const writtenComponents: SectionScore[] = [listening, reading, writing];
  if (sprachbausteine !== undefined) {
    writtenComponents.push(sprachbausteine);
  }
  const written = combineScores(...writtenComponents);
  const oral = speaking;
  const overall = combineScores(written, oral);
  const passed = written.passed && oral.passed;

  return {
    listening,
    reading,
    writing,
    sprachbausteine,
    speaking,
    written,
    oral,
    overall,
    passed,
  };
}

export function getReadinessLevel(percentage: number): ReadinessLevel {
  if (percentage >= 0.75) return 'ready';
  if (percentage >= 0.6) return 'almost';
  if (percentage >= 0.4) return 'developing';
  return 'building';
}

export function formatScore(score: SectionScore): string {
  const pct = Math.round(score.percentage * 100);
  return `${score.earned}/${score.max} (${pct}%)`;
}
