import { test, expect } from '@playwright/test';

const MOCK = 'A1_mock_01';

test.describe('Writing form-fill, word count, and Musterlösung toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/exam/${MOCK}/writing`);
    await page.getByTestId('section-start-btn').click();
    // Wait for active exam UI to be present
    await expect(page.getByRole('heading', { name: 'Schreiben' })).toBeVisible();
  });

  test('Task 1 form_fill — 5 labeled inputs render; typed value persists', async ({ page }) => {
    const labels = ['Vorname', 'Nachname', 'Alter', 'Adresse', 'Telefonnummer'];

    // All 5 labels visible somewhere on the page (form_fill task)
    for (const label of labels) {
      await expect(page.locator('label', { hasText: label }).first()).toBeVisible();
    }

    // Type into the Vorname input (first text input)
    const inputs = page.locator('input[type="text"]');
    await inputs.first().fill('Maria');
    await expect(inputs.first()).toHaveValue('Maria');
  });

  test('Task 2 textarea — word count updates on input', async ({ page }) => {
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveClass(/resize-y/);

    // Word count display (exact text in a <p> element)
    const wordCount = page.locator('p').filter({ hasText: /^\d+ Wörter$/ });

    await expect(wordCount).toContainText('0 Wörter');

    await textarea.fill('Hallo Welt');
    await expect(wordCount).toContainText('2 Wörter');

    // Whitespace-normalised
    await textarea.fill('  Hallo   Welt  ');
    await expect(wordCount).toContainText('2 Wörter');
  });

  test('Musterlösung toggle reveals and hides sample answer', async ({ page }) => {
    // First sample-answer-toggle on the page (Task 1 form_fill may or may not have one;
    // Task 2 short_message always has sampleAnswer)
    const toggles = page.getByTestId('sample-answer-toggle');
    const firstToggle = toggles.first();
    await expect(firstToggle).toBeVisible();

    // details element closed initially
    const details = page.locator('details').first();
    await expect(details).not.toHaveAttribute('open');

    await firstToggle.click();
    await expect(details).toHaveAttribute('open');

    // Click again to close
    await firstToggle.click();
    await expect(details).not.toHaveAttribute('open');
  });

  test('submit always enabled; clicking shows next-section-link to speaking', async ({ page }) => {
    await expect(page.getByTestId('submit-btn')).toBeEnabled();
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('next-section-link')).toHaveAttribute(
      'href',
      `/exam/${MOCK}/speaking`,
    );
  });
});
