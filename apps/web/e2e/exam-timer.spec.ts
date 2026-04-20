import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';
// A1 listening = 1200s (20 min)
const LISTENING_TOTAL_S = 20 * 60;

test.describe('Timer warning threshold and expiry', () => {
  test('neutral -> warning amber at 5 min -> NEVER red on expiry', async ({ page }) => {
    await page.clock.install({ time: Date.now() });
    await page.goto(`/exam/${MOCK}/listening`);
    await page.getByTestId('section-start-btn').click();

    const timer = page.getByTestId('exam-timer');
    await expect(timer).toBeVisible();

    // Default tone at start — no warning, no red.
    await expect(timer).not.toHaveClass(/bg-warning-surface/);
    await expect(timer).not.toHaveClass(/bg-error/);
    await expect(timer).not.toHaveClass(/bg-fail/);

    // 301s remaining (one tick before warning threshold)
    await page.clock.runFor((LISTENING_TOTAL_S - 301) * 1000);
    await expect(timer).not.toHaveClass(/bg-warning-surface/);

    // 300s -> warning amber kicks in
    await page.clock.runFor(1000);
    await expect(timer).toHaveClass(/bg-warning-surface/);
    await expect(timer).toHaveClass(/text-warning/);
    // Ethics gate: must never be red, anywhere.
    await expect(timer).not.toHaveClass(/bg-error/);
    await expect(timer).not.toHaveClass(/bg-fail/);
    await expect(timer).not.toHaveClass(/text-error/);
    await expect(timer).not.toHaveClass(/text-fail/);

    // Run down to 0 -> auto-submit flips to the results screen.
    await page.clock.runFor(300 * 1000);

    await expect(page.getByText(/\d+\/11/)).toBeVisible();
  });
});
