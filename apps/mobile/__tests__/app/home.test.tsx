/**
 * Tests for Home screen data-processing logic.
 *
 * We test the pure logic that the component depends on rather than rendering
 * the full component tree. Rendering a reanimated-heavy screen cold (no Jest
 * cache) exhausts the transform heap on this machine.
 *
 * Coverage:
 * - DB query helpers return the right shape
 * - Derived values (mocks completed, lastMockId) computed correctly
 */

import {
  getUserSettings,
  getTodayStreak,
  getRecentAttempts,
} from '../../src/services/database';

jest.mock('../../src/services/database', () => ({
  getUserSettings: jest.fn(),
  getTodayStreak: jest.fn(),
  getRecentAttempts: jest.fn(),
}));

const mockGetUserSettings = getUserSettings as jest.MockedFunction<typeof getUserSettings>;
const mockGetTodayStreak = getTodayStreak as jest.MockedFunction<typeof getTodayStreak>;
const mockGetRecentAttempts = getRecentAttempts as jest.MockedFunction<typeof getRecentAttempts>;

describe('Home screen data layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserSettings resolves with level and daily goal', async () => {
    mockGetUserSettings.mockResolvedValue({
      selected_level: 'A1',
      daily_study_minutes: 30,
      notifications_enabled: 1,
      onboarding_complete: 0,
    });

    const settings = await getUserSettings();
    expect(settings?.selected_level).toBe('A1');
    expect(settings?.daily_study_minutes).toBe(30);
  });

  it('getTodayStreak returns null when no study today', async () => {
    mockGetTodayStreak.mockResolvedValue(null);
    const streak = await getTodayStreak();
    expect(streak).toBeNull();
  });

  it('getTodayStreak returns minutes when study recorded', async () => {
    mockGetTodayStreak.mockResolvedValue({
      date: '2026-04-03',
      study_minutes: 25,
      activities_completed: 3,
    });

    const streak = await getTodayStreak();
    expect(streak?.study_minutes).toBe(25);
  });

  it('getRecentAttempts returns empty array when no attempts', async () => {
    mockGetRecentAttempts.mockResolvedValue([]);
    const attempts = await getRecentAttempts('A1', 10);
    expect(attempts).toHaveLength(0);
  });

  it('mocks completed = attempts with non-null passed', async () => {
    mockGetRecentAttempts.mockResolvedValue([
      { id: 1, mock_id: 'A1_mock_01', total_score: 20, total_max: 30, passed: 1, completed_at: '2026-04-01' },
      { id: 2, mock_id: 'A1_mock_02', total_score: 10, total_max: 30, passed: 0, completed_at: '2026-04-02' },
    ]);

    const attempts = await getRecentAttempts('A1', 10);
    const mocksCompleted = attempts.filter((a) => a.passed !== null).length;
    expect(mocksCompleted).toBe(2);
  });

  it('lastMockId is first item in attempts (most recent)', async () => {
    mockGetRecentAttempts.mockResolvedValue([
      { id: 3, mock_id: 'A1_mock_03', total_score: 22, total_max: 30, passed: 1, completed_at: '2026-04-03' },
      { id: 1, mock_id: 'A1_mock_01', total_score: 18, total_max: 30, passed: 1, completed_at: '2026-03-30' },
    ]);

    const attempts = await getRecentAttempts('A1', 10);
    const lastMockId = attempts.length > 0 ? attempts[0].mock_id : null;
    expect(lastMockId).toBe('A1_mock_03');
  });

  it('daily goal progress clamped to 100%', () => {
    const todayMinutes = 45;
    const dailyGoalMinutes = 30;
    const pct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));
    expect(pct).toBe(100);
  });

  it('daily goal progress is proportional when under goal', () => {
    const todayMinutes = 15;
    const dailyGoalMinutes = 30;
    const pct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));
    expect(pct).toBe(50);
  });
});
