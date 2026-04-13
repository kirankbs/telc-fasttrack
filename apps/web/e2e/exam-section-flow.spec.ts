import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';

const L_PARTS: Record<number, string[]> = {
  1: ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3'],
  2: ['A1_m01_L2_q1', 'A1_m01_L2_q2', 'A1_m01_L2_q3', 'A1_m01_L2_q4', 'A1_m01_L2_q5'],
  3: ['A1_m01_L3_q1', 'A1_m01_L3_q2', 'A1_m01_L3_q3'],
};

const R1_IDS = ['A1_m01_R1_q1', 'A1_m01_R1_q2', 'A1_m01_R1_q3', 'A1_m01_R1_q4', 'A1_m01_R1_q5'];
const R2_IDS = ['A1_m01_R2_q1', 'A1_m01_R2_q2', 'A1_m01_R2_q3', 'A1_m01_R2_q4', 'A1_m01_R2_q5'];
const R3_IDS = ['A1_m01_R3_q1', 'A1_m01_R3_q2', 'A1_m01_R3_q3', 'A1_m01_R3_q4', 'A1_m01_R3_q5'];

test.describe('1a — Hören section flow', () => {
  test('intro → active → timer auto-submits → results with next-section link', async ({ page }) => {
    await page.clock.install({ time: Date.now() });
    await page.goto(`/exam/${MOCK}/listening`);

    // Intro screen
    await expect(page.getByTestId('section-start-btn')).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Hören' })).toBeVisible();
    await expect(page.getByText('20 Minuten')).toBeVisible();
    await expect(page.getByTestId('exam-timer')).not.toBeVisible();

    // Start
    await page.getByTestId('section-start-btn').click();
    await expect(page.getByTestId('exam-timer')).toBeVisible();
    await expect(page.getByTestId('exam-timer')).toContainText('20:00');

    // Part 1 MCQ answers can be selected
    await page.getByTestId(`question-option-${L_PARTS[1][0]}-a`).click();
    await expect(page.getByTestId(`question-option-${L_PARTS[1][0]}-a`)).toHaveClass(/border-brand-primary/);

    // Part 2 has true_false questions without rendered radio options in this component —
    // expire the timer to auto-submit (mirrors telc exam behavior on time-out)
    await page.clock.runFor(20 * 60 * 1000);

    // Results screen visible after auto-submit
    await expect(page.getByText(/\d+\/11/)).toBeVisible();
    await expect(page.getByTestId('next-section-link')).toBeVisible();
    await expect(page.getByTestId('next-section-link')).toHaveAttribute('href', `/exam/${MOCK}/reading`);
  });
});

test.describe('1b — Lesen section flow', () => {
  test('intro → active → answer all → submit → results', async ({ page }) => {
    await page.goto(`/exam/${MOCK}/reading`);

    await expect(page.getByTestId('section-start-btn')).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Lesen' })).toBeVisible();
    await expect(page.getByText('25 Minuten')).toBeVisible();

    await page.getByTestId('section-start-btn').click();
    await expect(page.getByTestId('exam-timer')).toBeVisible();
    await expect(page.getByTestId('exam-timer')).toContainText('25:00');

    // Part 1 — true_false
    for (const qId of R1_IDS) {
      await page.getByTestId(`question-option-${qId}-richtig`).click();
    }

    // Part 2 — matching
    await page.getByTestId('part-tab-2').click();
    const matchLabels = ['a', 'b', 'c', 'd', 'e'];
    for (let i = 0; i < R2_IDS.length; i++) {
      await page.getByTestId(`question-option-${R2_IDS[i]}-${matchLabels[i]}`).click();
    }

    // Part 3 — true_false, also the last part so submit shows here
    await page.getByTestId('part-tab-3').click();
    for (const qId of R3_IDS) {
      await page.getByTestId(`question-option-${qId}-richtig`).click();
    }

    await expect(page.getByTestId('submit-btn')).toBeEnabled();
    await page.getByTestId('submit-btn').click();

    await expect(page.getByText(/\d+\/\d+/)).toBeVisible();
    await expect(page.getByTestId('next-section-link')).toHaveAttribute('href', `/exam/${MOCK}/writing`);
  });
});

test.describe('1c — Schreiben section flow', () => {
  test('intro → active → submit always enabled → results', async ({ page }) => {
    await page.goto(`/exam/${MOCK}/writing`);

    await expect(page.getByTestId('section-start-btn')).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Schreiben' })).toBeVisible();
    await expect(page.getByText('20 Minuten')).toBeVisible();

    await page.getByTestId('section-start-btn').click();
    await expect(page.getByTestId('exam-timer')).toBeVisible();

    // Writing submit is always enabled (self-assessed)
    await expect(page.getByTestId('submit-btn')).toBeEnabled();
    await page.getByTestId('submit-btn').click();

    await expect(page.getByTestId('next-section-link')).toHaveAttribute('href', `/exam/${MOCK}/speaking`);
  });
});

test.describe('1d — Sprechen section flow', () => {
  test('intro without prep time → active with 3 parts → completion', async ({ page }) => {
    await page.goto(`/exam/${MOCK}/speaking`);

    await expect(page.getByTestId('section-start-btn')).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Sprechen' })).toBeVisible();
    await expect(page.getByText('15 Minuten')).toBeVisible();
    // A1 has prepTimeMinutes=0 — no prep time line
    await expect(page.getByText(/Vorbereitungszeit/)).not.toBeVisible();

    await page.getByTestId('section-start-btn').click();

    // 3 part tabs visible
    await expect(page.getByTestId('part-tab-1')).toBeVisible();
    await expect(page.getByTestId('part-tab-2')).toBeVisible();
    await expect(page.getByTestId('part-tab-3')).toBeVisible();

    // Navigate through parts
    await page.getByTestId('section-nav-next').click();
    await page.getByTestId('section-nav-next').click();

    // Now on last part — submit button present
    await expect(page.getByTestId('submit-btn')).toBeVisible();
    await page.getByTestId('submit-btn').click();

    // Completion screen with exam overview link
    await expect(page.getByText('Sprechen abgeschlossen')).toBeVisible();
    await expect(page.getByRole('link', { name: /Prüfungsübersicht/ })).toHaveAttribute(
      'href',
      `/exam/${MOCK}`,
    );
  });
});
