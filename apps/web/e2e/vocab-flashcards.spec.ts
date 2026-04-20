import { test, expect } from '@playwright/test';

test.describe('Vocabulary flashcard session', () => {
  test('completes a full session and reaches the end screen with honest stats', async ({
    page,
  }) => {
    await page.goto('/vocab');
    // Pick A1 from the level grid → enters the flashcard session screen
    await page.getByTestId('start-review-A1').click();
    await expect(page.getByTestId('start-review')).toBeVisible();
    await page.getByTestId('start-review').click();

    // Progress label lives in the breadcrumb row, not on the card
    const progress = page.getByTestId('card-progress');
    await expect(progress).toBeVisible();

    // Flip hint is visible on the first card
    await expect(page.getByTestId('flashcard-flip-hint')).toBeVisible();

    // Flip the first card → hint must disappear for the rest of the session
    await page.getByTestId('flip-button').click();
    await expect(page.getByTestId('grade-buttons')).toBeVisible();

    // Two equal-weight buttons only
    await expect(page.getByTestId('grade-2')).toHaveText('Noch lernen');
    await expect(page.getByTestId('grade-4')).toHaveText('Gewusst');

    // First card: grade known, then confirm the hint is gone for the rest.
    await page.getByTestId('grade-4').click();
    await expect(page.getByTestId('flashcard-flip-hint')).not.toBeVisible();

    // Read the session size from the progress label ("Karte 1 von N") and
    // burn through the remaining N-1 cards. The session size is hardcoded
    // in FlashcardSession.tsx, but reading it from the DOM keeps the test
    // resilient to future tweaks.
    const match = (await progress.textContent())?.match(/von\s+(\d+)/);
    const sessionSize = match ? Number(match[1]) : 20;
    expect(sessionSize).toBeGreaterThan(1);

    for (let i = 1; i < sessionSize; i++) {
      await page.getByTestId('flip-button').click();
      // Alternate grades so the summary has both "sicher" and "zum Wiederholen" buckets.
      const testid = i % 2 === 0 ? 'grade-4' : 'grade-2';
      await page.getByTestId(testid).click();
    }

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
