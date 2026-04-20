import { test, expect } from '@playwright/test';

test.describe('Vocabulary flashcard session', () => {
  test('completes a 3-card session and reaches the end screen with honest stats', async ({
    page,
  }) => {
    await page.goto('/vocab');
    // Pick A1 from the level grid → enters the flashcard session screen
    await page.getByTestId('start-review-A1').click();
    await expect(page.getByTestId('start-review')).toBeVisible();
    await page.getByTestId('start-review').click();

    // Progress label lives in the breadcrumb row, not on the card
    await expect(page.getByTestId('card-progress')).toBeVisible();

    // Flip hint is visible on the first card
    await expect(page.getByTestId('flashcard-flip-hint')).toBeVisible();

    // Flip the first card → hint must disappear for the rest of the session
    await page.getByTestId('flip-button').click();
    await expect(page.getByTestId('grade-buttons')).toBeVisible();

    // Two equal-weight buttons only
    await expect(page.getByTestId('grade-2')).toHaveText('Noch lernen');
    await expect(page.getByTestId('grade-4')).toHaveText('Gewusst');

    // Burn through three cards
    await page.getByTestId('grade-4').click();
    await expect(page.getByTestId('flashcard-flip-hint')).not.toBeVisible();
    await page.getByTestId('flip-button').click();
    await page.getByTestId('grade-2').click();
    await page.getByTestId('flip-button').click();
    await page.getByTestId('grade-4').click();

    // End of session — 3 honest stats, no percent, no confetti
    const summary = page.getByTestId('session-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Einheit abgeschlossen');
    await expect(summary).toContainText('Wörter geübt');
    await expect(summary).toContainText('sicher');
    await expect(summary).toContainText('zum Wiederholen');
    await expect(page.getByTestId('new-session')).toHaveText('Weiter lernen');
  });
});
