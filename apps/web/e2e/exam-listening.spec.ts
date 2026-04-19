import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';

test.describe('Listening MCQ answer selection and part tab progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/exam/${MOCK}/listening`);
    await page.getByTestId('section-start-btn').click();
  });

  test('Part 1 tab is active; not yet complete', async ({ page }) => {
    await expect(page.getByTestId('part-tab-1')).toHaveClass(/bg-brand-primary/);
    await expect(page.getByTestId('part-tab-1')).not.toHaveClass(/bg-success-light/);
    await expect(page.getByTestId('part-tab-2')).not.toHaveClass(/bg-brand-primary/);
  });

  test('selecting an option applies selected classes; switching deselects previous', async ({ page }) => {
    const optA = page.getByTestId('question-option-A1_m01_L1_q1-a');
    const optB = page.getByTestId('question-option-A1_m01_L1_q1-b');

    await optA.click();
    await expect(optA).toHaveClass(/border-brand-primary/);
    await expect(optA).toHaveClass(/bg-brand-primary-surface/);
    await expect(optB).not.toHaveClass(/border-brand-primary/);

    // Switch to b
    await optB.click();
    await expect(optB).toHaveClass(/border-brand-primary/);
    await expect(optA).not.toHaveClass(/border-brand-primary/);
  });

  test('completing Part 1 marks tab bg-success-light after navigating away', async ({ page }) => {
    for (const qId of ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }
    // Navigate away from Part 1 — success class only shows when tab is not active
    await page.getByTestId('section-nav-next').click();
    await expect(page.getByTestId('part-tab-2')).toHaveClass(/bg-brand-primary/);
    await expect(page.getByTestId('part-tab-1')).toHaveClass(/bg-success-light/);
    await expect(page.getByTestId('part-tab-1')).toHaveClass(/text-success/);
  });

  test('answers persist across part navigation', async ({ page }) => {
    // Answer all of Part 1
    for (const qId of ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }

    // Go to Part 2
    await page.getByTestId('section-nav-next').click();
    await expect(page.getByTestId('part-tab-2')).toHaveClass(/bg-brand-primary/);

    // Come back to Part 1
    await page.getByTestId('part-tab-1').click();
    // First question still marked
    await expect(page.getByTestId('question-option-A1_m01_L1_q1-a')).toHaveClass(/border-brand-primary/);
  });

  test('prev button is disabled on Part 1', async ({ page }) => {
    await expect(page.getByTestId('section-nav-prev')).toBeDisabled();
  });
});

test.describe('Listening Part 2 true_false rendering and submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/exam/${MOCK}/listening`);
    await page.getByTestId('section-start-btn').click();
    await page.getByTestId('section-nav-next').click();
    await expect(page.getByTestId('part-tab-2')).toHaveClass(/bg-brand-primary/);
  });

  test('Part 2 renders richtig/falsch buttons instead of MCQ options', async ({ page }) => {
    await expect(page.getByTestId('question-option-A1_m01_L2_q1-richtig')).toBeVisible();
    await expect(page.getByTestId('question-option-A1_m01_L2_q1-falsch')).toBeVisible();
  });

  test('selecting richtig applies selected styling, falsch stays neutral', async ({ page }) => {
    const richtig = page.getByTestId('question-option-A1_m01_L2_q1-richtig');
    const falsch = page.getByTestId('question-option-A1_m01_L2_q1-falsch');

    await richtig.click();
    await expect(richtig).toHaveClass(/border-brand-primary/);
    await expect(richtig).toHaveClass(/bg-brand-primary-surface/);
    await expect(falsch).not.toHaveClass(/border-brand-primary/);
  });

  test('answering all parts enables submit and shows results', async ({ page }) => {
    // Answer Part 1 MCQ questions first
    await page.getByTestId('part-tab-1').click();
    for (const qId of ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }

    // Answer Part 2 true_false questions
    await page.getByTestId('part-tab-2').click();
    for (const qId of ['A1_m01_L2_q1', 'A1_m01_L2_q2', 'A1_m01_L2_q3', 'A1_m01_L2_q4', 'A1_m01_L2_q5']) {
      await page.getByTestId(`question-option-${qId}-richtig`).click();
    }

    // Answer Part 3 MCQ questions
    await page.getByTestId('section-nav-next').click();
    for (const qId of ['A1_m01_L3_q1', 'A1_m01_L3_q2', 'A1_m01_L3_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }

    // Submit
    const submitBtn = page.getByTestId('submit-btn');
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();

    // Results screen shows score
    await expect(page.getByText(/Bestanden|Nicht bestanden/)).toBeVisible();
    await expect(page.getByTestId('next-section-link')).toBeVisible();
  });
});
