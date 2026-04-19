import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSession,
  saveSection,
  clearSession,
  isSessionComplete,
  hasAnySection,
} from '@/lib/examSession';
import type { ExamSessionState, SectionResult } from '@/lib/examSession';

const mockResult: SectionResult = {
  answers: { q1: 'a', q2: 'b' },
  score: { earned: 8, max: 10, percentage: 0.8, passed: true },
  submittedAt: '2026-04-12T10:00:00.000Z',
};

const writingResult: SectionResult = {
  answers: {},
  taskAnswers: { 1: { _freetext: 'Hallo' } },
  score: { earned: 6, max: 12, percentage: 0.5, passed: false },
  submittedAt: '2026-04-12T10:05:00.000Z',
  selfAssessment: 50,
};

const speakingResult: SectionResult = {
  answers: {},
  score: { earned: 14, max: 24, percentage: 0.583, passed: false },
  submittedAt: '2026-04-12T10:10:00.000Z',
  selfAssessment: 58,
};

describe('examSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession('A1_mock_01')).toBeNull();
    });

    it('returns session after saveSection creates it', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      const session = getSession('A1_mock_01');
      expect(session).not.toBeNull();
      expect(session!.mockId).toBe('A1_mock_01');
      expect(session!.level).toBe('A1');
      expect(session!.sections.listening).toEqual(mockResult);
    });
  });

  describe('saveSection', () => {
    it('creates a new session on first save', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      const session = getSession('A1_mock_01');
      expect(session!.startedAt).toBeDefined();
      expect(session!.sections.listening!.score.earned).toBe(8);
    });

    it('appends to existing session without overwriting other sections', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      saveSection('A1_mock_01', 'A1', 'reading', {
        ...mockResult,
        score: { earned: 6, max: 10, percentage: 0.6, passed: true },
      });
      const session = getSession('A1_mock_01');
      expect(session!.sections.listening!.score.earned).toBe(8);
      expect(session!.sections.reading!.score.earned).toBe(6);
    });

    it('overwrites a section on retake', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      const updated: SectionResult = {
        ...mockResult,
        score: { earned: 10, max: 10, percentage: 1, passed: true },
      };
      saveSection('A1_mock_01', 'A1', 'listening', updated);
      expect(getSession('A1_mock_01')!.sections.listening!.score.earned).toBe(10);
    });

    it('saves writing with taskAnswers and selfAssessment', () => {
      saveSection('A1_mock_01', 'A1', 'writing', writingResult);
      const session = getSession('A1_mock_01');
      expect(session!.sections.writing!.taskAnswers).toEqual({ 1: { _freetext: 'Hallo' } });
      expect(session!.sections.writing!.selfAssessment).toBe(50);
    });
  });

  describe('clearSession', () => {
    it('removes session from storage', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      clearSession('A1_mock_01');
      expect(getSession('A1_mock_01')).toBeNull();
    });

    it('does not affect other mock sessions', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      saveSection('A1_mock_02', 'A1', 'listening', mockResult);
      clearSession('A1_mock_01');
      expect(getSession('A1_mock_01')).toBeNull();
      expect(getSession('A1_mock_02')).not.toBeNull();
    });
  });

  describe('isSessionComplete', () => {
    it('returns false when some sections missing', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      saveSection('A1_mock_01', 'A1', 'reading', mockResult);
      const session = getSession('A1_mock_01')!;
      expect(isSessionComplete(session)).toBe(false);
    });

    it('returns true when all 4 sections present', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      saveSection('A1_mock_01', 'A1', 'reading', mockResult);
      saveSection('A1_mock_01', 'A1', 'writing', writingResult);
      saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);
      const session = getSession('A1_mock_01')!;
      expect(isSessionComplete(session)).toBe(true);
    });
  });

  describe('hasAnySection', () => {
    it('returns false for empty sections', () => {
      const session: ExamSessionState = {
        mockId: 'A1_mock_01',
        level: 'A1',
        startedAt: new Date().toISOString(),
        sections: {},
      };
      expect(hasAnySection(session)).toBe(false);
    });

    it('returns true when at least one section exists', () => {
      saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);
      const session = getSession('A1_mock_01')!;
      expect(hasAnySection(session)).toBe(true);
    });
  });

  describe('serialization round-trip', () => {
    it('preserves all fields through write and read', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      saveSection('A1_mock_01', 'A1', 'reading', mockResult);
      saveSection('A1_mock_01', 'A1', 'writing', writingResult);
      saveSection('A1_mock_01', 'A1', 'speaking', speakingResult);

      const session = getSession('A1_mock_01')!;
      expect(session.mockId).toBe('A1_mock_01');
      expect(session.level).toBe('A1');
      expect(session.sections.listening).toEqual(mockResult);
      expect(session.sections.reading).toEqual(mockResult);
      expect(session.sections.writing).toEqual(writingResult);
      expect(session.sections.speaking).toEqual(speakingResult);
    });
  });

  describe('isolation', () => {
    it('separate mocks have independent sessions', () => {
      saveSection('A1_mock_01', 'A1', 'listening', mockResult);
      saveSection('A1_mock_02', 'A1', 'reading', {
        ...mockResult,
        score: { earned: 5, max: 10, percentage: 0.5, passed: false },
      });

      const s1 = getSession('A1_mock_01')!;
      const s2 = getSession('A1_mock_02')!;
      expect(s1.sections.listening).toBeDefined();
      expect(s1.sections.reading).toBeUndefined();
      expect(s2.sections.reading).toBeDefined();
      expect(s2.sections.listening).toBeUndefined();
    });
  });
});
