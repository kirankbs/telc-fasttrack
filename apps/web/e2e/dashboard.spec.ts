import { test, expect } from '@playwright/test';

test.describe('Dashboard — Phase 2 redesign', () => {
  test('renders hero with named stage (not percentage) and zero-state CTA', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('readiness-hero')).toBeVisible();
    await expect(page.getByTestId('readiness-stage-name')).toHaveText(
      'Building foundation',
    );
    const cta = page.getByTestId('readiness-cta');
    await expect(cta).toHaveText('Start your first exam');
    // Hero must never contain a percentage number.
    const heroText = (await page.getByTestId('readiness-hero').textContent()) ?? '';
    expect(heroText).not.toMatch(/\d{1,3}\s*%/);
  });

  test('renders 3 stat cards (no "Sektionen") and week grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('stat-mocks')).toBeVisible();
    await expect(page.getByTestId('stat-average')).toBeVisible();
    await expect(page.getByTestId('stat-time')).toBeVisible();
    await expect(page.locator('[data-testid="stat-sections"]')).toHaveCount(0);
    await expect(page.getByTestId('week-grid')).toBeVisible();
    // 7 squares.
    for (let i = 0; i < 7; i++) {
      await expect(page.getByTestId(`week-grid-day-${i}`)).toBeVisible();
    }
  });

  test('level tab switch works and CTA routes to first mock', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('level-tab-A2').click();
    await expect(page.getByTestId('level-tab-A2')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByTestId('level-tab-A1').click();
    const cta = page.getByTestId('readiness-cta');
    // Zero state: CTA routes to the first A1 mock.
    await expect(cta).toHaveAttribute('href', '/exam/A1_mock_01');
    await cta.click();
    await expect(page).toHaveURL(/\/exam\/A1_mock_01$/);
  });
});
