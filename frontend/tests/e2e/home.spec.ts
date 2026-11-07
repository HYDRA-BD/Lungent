import { test, expect } from '@playwright/test'

test.describe('Lungent Landing Page Baseline', () => {
  test('should display home page baseline elements', async ({ page }) => {
    // When local server is running or URL is available
    await page.goto('/')
    await expect(page).toHaveTitle(/Lungent/i)
  })
})
