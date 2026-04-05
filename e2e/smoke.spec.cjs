const { test, expect } = require('@playwright/test');

/**
 * Smoke tests against the Vite dev server (no real Google OAuth).
 * Unauthenticated flows only; the app treats failed /auth/login/success as logged out.
 */
test('landing shows Google sign-in when not authenticated', async ({ page }) => {
  await page.goto('/');
  // Intro uses a div.google-btn (not role="button") for the OAuth entry point
  await expect(page.getByText('Sign in with Google')).toBeVisible({ timeout: 30_000 });
});

test('about page renders heading', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible({ timeout: 30_000 });
});
