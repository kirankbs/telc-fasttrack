import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';

test.describe('Listening MCQ answer selection and part tab progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/exam/${MOCK}/listening`);
    await page.getByTestId('section-start-btn').click();
  });

  test('Part 1 tab is active; not yet complete', async ({ page }) => {
    await expect(page.getByTestId('part-tab-1')).toHaveClass(/bg-brand-600/);
    await expect(page.getByTestId('part-tab-1')).not.toHaveClass(/bg-pass-surface/);
    await expect(page.getByTestId('part-tab-2')).not.toHaveClass(/bg-brand-600/);
  });

  test('selecting an option applies selected classes; switching deselects previous', async ({ page }) => {
    const optA = page.getByTestId('question-option-A1_m01_L1_q1-a');
    const optB = page.getByTestId('question-option-A1_m01_L1_q1-b');

    await optA.click();
    // Selected state is a 4px left accent, NOT a full brand fill.
    await expect(optA).toHaveAttribute('data-state', 'selected');
    await expect(optA).toHaveClass(/border-l-brand-500/);
    await expect(optA).toHaveClass(/bg-surface-container/);
    await expect(optB).toHaveAttribute('data-state', 'default');

    // Switch to b
    await optB.click();
    await expect(optB).toHaveAttribute('data-state', 'selected');
    await expect(optA).toHaveAttribute('data-state', 'default');
  });

  test('completing Part 1 marks tab bg-pass-surface after navigating away', async ({ page }) => {
    for (const qId of ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }
    await page.getByTestId('section-nav-next').click();
    await expect(page.getByTestId('part-tab-2')).toHaveClass(/bg-brand-600/);
    await expect(page.getByTestId('part-tab-1')).toHaveClass(/bg-pass-surface/);
    await expect(page.getByTestId('part-tab-1')).toHaveClass(/text-pass/);
  });

  test('answers persist across part navigation', async ({ page }) => {
    for (const qId of ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }

    await page.getByTestId('section-nav-next').click();
    await expect(page.getByTestId('part-tab-2')).toHaveClass(/bg-brand-600/);

    await page.getByTestId('part-tab-1').click();
    await expect(page.getByTestId('question-option-A1_m01_L1_q1-a')).toHaveAttribute('data-state', 'selected');
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
    await expect(page.getByTestId('part-tab-2')).toHaveClass(/bg-brand-600/);
  });

  test('Part 2 renders richtig/falsch buttons instead of MCQ options', async ({ page }) => {
    await expect(page.getByTestId('question-option-A1_m01_L2_q1-richtig')).toBeVisible();
    await expect(page.getByTestId('question-option-A1_m01_L2_q1-falsch')).toBeVisible();
  });

  test('selecting richtig applies selected styling, falsch stays neutral', async ({ page }) => {
    const richtig = page.getByTestId('question-option-A1_m01_L2_q1-richtig');
    const falsch = page.getByTestId('question-option-A1_m01_L2_q1-falsch');

    await richtig.click();
    await expect(richtig).toHaveAttribute('data-state', 'selected');
    await expect(richtig).toHaveClass(/border-l-brand-500/);
    await expect(richtig).toHaveClass(/bg-surface-container/);
    await expect(falsch).toHaveAttribute('data-state', 'default');
  });

  test('answering all parts enables submit and shows results', async ({ page }) => {
    await page.getByTestId('part-tab-1').click();
    for (const qId of ['A1_m01_L1_q1', 'A1_m01_L1_q2', 'A1_m01_L1_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }

    await page.getByTestId('part-tab-2').click();
    for (const qId of ['A1_m01_L2_q1', 'A1_m01_L2_q2', 'A1_m01_L2_q3', 'A1_m01_L2_q4', 'A1_m01_L2_q5']) {
      await page.getByTestId(`question-option-${qId}-richtig`).click();
    }

    await page.getByTestId('section-nav-next').click();
    for (const qId of ['A1_m01_L3_q1', 'A1_m01_L3_q2', 'A1_m01_L3_q3']) {
      await page.getByTestId(`question-option-${qId}-a`).click();
    }

    const submitBtn = page.getByTestId('submit-btn');
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();

    await expect(page.getByText(/Bestanden|Nicht bestanden/)).toBeVisible();
    await expect(page.getByTestId('next-section-link')).toBeVisible();
  });
});
