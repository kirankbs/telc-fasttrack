import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';
// A1 listening = 1200s (20 min)
const LISTENING_TOTAL_S = 20 * 60;

test.describe('Timer warning threshold and expiry', () => {
  test('neutral → warning at 5 min remaining → auto-submit on expiry', async ({ page }) => {
    // Install fake clock BEFORE navigation so browser timers are intercepted from page load
    await page.clock.install({ time: Date.now() });
    await page.goto(`/exam/${MOCK}/listening`);
    await page.getByTestId('section-start-btn').click();

    const timer = page.getByTestId('exam-timer');
    await expect(timer).toBeVisible();

    // Neutral state initially (well above 300s remaining)
    await expect(timer).not.toHaveClass(/bg-warning-light/);
    await expect(timer).not.toHaveClass(/bg-error-light/);

    // Advance to 899s elapsed → 301s remaining (1s before warning threshold)
    await page.clock.runFor((LISTENING_TOTAL_S - 301) * 1000);
    await expect(timer).not.toHaveClass(/bg-warning-light/);

    // Run 1 more second → 300s remaining; warning styling kicks in
    await page.clock.runFor(1000);
    await expect(timer).toHaveClass(/bg-warning-light/);
    await expect(timer).toHaveClass(/text-warning/);
    await expect(timer).not.toHaveClass(/bg-error-light/);

    // Run remaining 300s → timer hits 0; component calls onExpire → auto-submits
    // The timer briefly shows bg-error-light before the parent unmounts it on submit,
    // so assert the final state via the results screen instead.
    await page.clock.runFor(300 * 1000);

    // Results screen rendered — auto-submit fired without user clicking submit-btn
    await expect(page.getByText(/\d+\/11/)).toBeVisible();
  });
});
