import { test, expect } from '@playwright/test'

test.describe('Authentication & Account Access Flows', () => {
  test('sign-in page renders with clinical branding and form elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Sign In/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('text=Register Here')).toBeVisible()
    await expect(page.locator('text=Forgot password?')).toBeVisible()
  })

  test('registration page displays required fields, language options, and terms agreement', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Create Your Account/i)
    await expect(page.locator('input[name="fullName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.locator('select[name="preferredLanguage"]')).toBeVisible()
    await expect(page.locator('text=Terms of Service')).toBeVisible()
  })

  test('password recovery page renders instructions and email input', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Reset Your Password/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('text=Back to Sign In')).toBeVisible()
  })

  test('email verification page shows pending status and resend CTA', async ({ page }) => {
    await page.goto('/verify-email?email=test%40example.com')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Verify Your Email/i)
    await expect(page.locator('text=test@example.com')).toBeVisible()
    await expect(page.locator('text=Resend Verification Link')).toBeVisible()
  })

  test('suspended account page informs user and provides governance contact link', async ({ page }) => {
    await page.goto('/suspended')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Account Temporarily Suspended/i)
    await expect(page.locator('text=Contact Governance Support')).toBeVisible()
  })

  test('unauthorized boundary page provides portal navigation', async ({ page }) => {
    await page.goto('/unauthorized')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Access Restricted/i)
    await expect(page.locator('text=Go to Patient Portal')).toBeVisible()
  })
})
