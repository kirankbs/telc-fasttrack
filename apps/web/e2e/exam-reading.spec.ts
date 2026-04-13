import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';

test.describe('Reading question type rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/exam/${MOCK}/reading`);
    await page.getByTestId('section-start-btn').click();
  });

  test('Part 1 — true/false: richtig and falsch options exist and switch selection', async ({ page }) => {
    const richtig = page.getByTestId('question-option-A1_m01_R1_q1-richtig');
    const falsch = page.getByTestId('question-option-A1_m01_R1_q1-falsch');

    await expect(richtig).toBeVisible();
    await expect(falsch).toBeVisible();

    await richtig.click();
    await expect(richtig).toHaveClass(/border-brand-primary/);
    await expect(falsch).not.toHaveClass(/border-brand-primary/);

    await falsch.click();
    await expect(falsch).toHaveClass(/border-brand-primary/);
    await expect(richtig).not.toHaveClass(/border-brand-primary/);
  });

  test('Part 2 — matching: tiles a–h visible; clicking marks selection', async ({ page }) => {
    await page.getByTestId('part-tab-2').click();

    // All 8 ad tiles are rendered
    for (const label of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      await expect(page.getByText(label).first()).toBeVisible();
    }

    // Click tile 'b' for first matching question
    const opt = page.getByTestId('question-option-A1_m01_R2_q1-b');
    await opt.click();
    await expect(opt).toHaveClass(/border-brand-primary/);
  });

  test('Part 3 — true/false same pattern as Part 1', async ({ page }) => {
    await page.getByTestId('part-tab-3').click();

    const richtig = page.getByTestId('question-option-A1_m01_R3_q1-richtig');
    const falsch = page.getByTestId('question-option-A1_m01_R3_q1-falsch');

    await richtig.click();
    await expect(richtig).toHaveClass(/border-brand-primary/);

    await falsch.click();
    await expect(falsch).toHaveClass(/border-brand-primary/);
    await expect(richtig).not.toHaveClass(/border-brand-primary/);
  });

  test('submit stays disabled until all 15 questions answered', async ({ page }) => {
    // submit-btn only renders on the last part (Part 3) — navigate there first to check state

    // Answer Part 1
    for (const qId of ['A1_m01_R1_q1', 'A1_m01_R1_q2', 'A1_m01_R1_q3', 'A1_m01_R1_q4', 'A1_m01_R1_q5']) {
      await page.getByTestId(`question-option-${qId}-richtig`).click();
    }

    // Move to Part 2
    await page.getByTestId('part-tab-2').click();

    // Answer Part 2 — matching
    const matchingLabels = ['a', 'b', 'c', 'd', 'e'];
    const r2Ids = ['A1_m01_R2_q1', 'A1_m01_R2_q2', 'A1_m01_R2_q3', 'A1_m01_R2_q4', 'A1_m01_R2_q5'];
    for (let i = 0; i < r2Ids.length; i++) {
      await page.getByTestId(`question-option-${r2Ids[i]}-${matchingLabels[i]}`).click();
    }

    // Move to Part 3 — submit-btn now visible but disabled (Part 3 not yet answered)
    await page.getByTestId('part-tab-3').click();
    await expect(page.getByTestId('submit-btn')).toBeDisabled();

    // Answer Part 3
    for (const qId of ['A1_m01_R3_q1', 'A1_m01_R3_q2', 'A1_m01_R3_q3', 'A1_m01_R3_q4', 'A1_m01_R3_q5']) {
      await page.getByTestId(`question-option-${qId}-richtig`).click();
    }

    await expect(page.getByTestId('submit-btn')).toBeEnabled();
  });
});
