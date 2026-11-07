import { test, expect } from '@playwright/test'

test.describe('Design System Showcase & Workspaces', () => {
  test('should render design system showcase and tabs', async ({ page }) => {
    await page.goto('/design-system')
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.getByText('Lungent Design System Foundation')).toBeVisible()
    await expect(page.getByRole('tab', { name: /Brand/i })).toBeVisible()
  })

  test('should render clinical workspace shell', async ({ page }) => {
    await page.goto('/clinical')
    await expect(page.getByText('Clinical Decision Support Workspace')).toBeVisible()
    await expect(page.getByText('Kamal Hossain').first()).toBeVisible()
  })
})
