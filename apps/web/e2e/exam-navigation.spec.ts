import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';

async function completeListening(page: import('@playwright/test').Page) {
  // Listening Part 2 has true_false questions without rendered MCQ options in the current
  // ListeningExam component — expire the timer to auto-submit instead
  await page.clock.install({ time: Date.now() });
  await page.goto(`/exam/${MOCK}/listening`);
  await page.getByTestId('section-start-btn').click();
  await page.clock.runFor(20 * 60 * 1000);
  // Wait for results screen
  await page.getByTestId('next-section-link').waitFor({ state: 'visible' });
}

async function completeReading(page: import('@playwright/test').Page) {
  await page.goto(`/exam/${MOCK}/reading`);
  await page.getByTestId('section-start-btn').click();

  const r1 = ['A1_m01_R1_q1', 'A1_m01_R1_q2', 'A1_m01_R1_q3', 'A1_m01_R1_q4', 'A1_m01_R1_q5'];
  const r2 = ['A1_m01_R2_q1', 'A1_m01_R2_q2', 'A1_m01_R2_q3', 'A1_m01_R2_q4', 'A1_m01_R2_q5'];
  const r3 = ['A1_m01_R3_q1', 'A1_m01_R3_q2', 'A1_m01_R3_q3', 'A1_m01_R3_q4', 'A1_m01_R3_q5'];
  const matchingLabels = ['a', 'b', 'c', 'd', 'e'];

  for (const qId of r1) await page.getByTestId(`question-option-${qId}-richtig`).click();
  await page.getByTestId('part-tab-2').click();
  for (let i = 0; i < r2.length; i++) {
    await page.getByTestId(`question-option-${r2[i]}-${matchingLabels[i]}`).click();
  }
  await page.getByTestId('part-tab-3').click();
  for (const qId of r3) await page.getByTestId(`question-option-${qId}-richtig`).click();
  await page.getByTestId('submit-btn').click();
}

async function completeWriting(page: import('@playwright/test').Page) {
  await page.goto(`/exam/${MOCK}/writing`);
  await page.getByTestId('section-start-btn').click();
  await page.getByTestId('submit-btn').click();
}

async function completeSpeaking(page: import('@playwright/test').Page) {
  await page.goto(`/exam/${MOCK}/speaking`);
  await page.getByTestId('section-start-btn').click();
  await page.getByTestId('section-nav-next').click();
  await page.getByTestId('section-nav-next').click();
  await page.getByTestId('submit-btn').click();
}

test.describe('Section navigation chain', () => {
  test('exam detail page shows section start links', async ({ page }) => {
    await page.goto(`/exam/${MOCK}`);
    // Section cards contain "Hören", "Lesen", "Schreiben", "Sprechen" headings
    await expect(page.getByText('Hören').first()).toBeVisible();
    await expect(page.getByText('Lesen').first()).toBeVisible();
    await expect(page.getByText('Schreiben').first()).toBeVisible();
    await expect(page.getByText('Sprechen').first()).toBeVisible();

    // Links to section routes exist
    await expect(page.locator(`a[href="/exam/${MOCK}/listening"]`).first()).toBeVisible();
    await expect(page.locator(`a[href="/exam/${MOCK}/reading"]`).first()).toBeVisible();
    await expect(page.locator(`a[href="/exam/${MOCK}/writing"]`).first()).toBeVisible();
    await expect(page.locator(`a[href="/exam/${MOCK}/speaking"]`).first()).toBeVisible();

    // Clicking a listening link navigates to intro
    await page.locator(`a[href="/exam/${MOCK}/listening"]`).first().click();
    await expect(page).toHaveURL(`/exam/${MOCK}/listening`);
    await expect(page.getByTestId('section-start-btn')).toBeVisible();
  });

  test('Listening → Reading link chain', async ({ page }) => {
    await completeListening(page);

    const link = page.getByTestId('next-section-link');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Lesen');
    await link.click();

    await expect(page).toHaveURL(`/exam/${MOCK}/reading`);
    await expect(page.getByTestId('section-start-btn')).toBeVisible();
  });

  test('Reading → Writing link chain', async ({ page }) => {
    await completeReading(page);

    const link = page.getByTestId('next-section-link');
    await expect(link).toContainText('Schreiben');
    await link.click();

    await expect(page).toHaveURL(`/exam/${MOCK}/writing`);
    await expect(page.getByTestId('section-start-btn')).toBeVisible();
  });

  test('Writing → Speaking link chain', async ({ page }) => {
    await completeWriting(page);

    const link = page.getByTestId('next-section-link');
    await expect(link).toContainText('Sprechen');
    await link.click();

    await expect(page).toHaveURL(`/exam/${MOCK}/speaking`);
    await expect(page.getByTestId('section-start-btn')).toBeVisible();
  });

  test('Speaking completion → Prüfungsübersicht', async ({ page }) => {
    await completeSpeaking(page);

    await expect(page.getByText('Sprechen abgeschlossen')).toBeVisible();
    const link = page.getByRole('link', { name: /Prüfungsübersicht/ });
    await link.click();

    await expect(page).toHaveURL(`/exam/${MOCK}`);
  });
});
