import { test, expect } from '@playwright/test'

test.describe('Healthcare Worker Workspace (Phase 1.10)', () => {
  test('renders operational dashboard with metrics, facility switcher, and task list', async ({ page }) => {
    await page.goto('/healthcare-worker')

    // Check workspace title and active facility switcher
    await expect(page.getByText('Healthcare Worker Workspace').first()).toBeVisible()
    await expect(page.getByLabel('Switch Active Facility')).toBeVisible()

    // Verify key metrics
    await expect(page.getByText('Assigned Patients')).toBeVisible()
    await expect(page.getByText('Recently Registered')).toBeVisible()
    await expect(page.getByText('Incomplete Profiles')).toBeVisible()
    await expect(page.getByText('Active Assessments')).toBeVisible()
    await expect(page.getByText('Pending Tasks', { exact: true })).toBeVisible()

    // Verify quick action shortcuts
    await expect(page.getByRole('link', { name: 'Register Patient', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Assessment', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Completion Queue.*profiles/i })).toBeVisible()

    // Verify recent patients table
    await expect(page.getByText('Recently Assigned & Registered Patients')).toBeVisible()
    await expect(page.getByRole('table').first()).toBeVisible()

    // Verify completion status pills
    await expect(page.getByText(/Record/i).first()).toBeVisible()
  })

  test('facility switcher allows switching between registered centers', async ({ page }) => {
    await page.goto('/healthcare-worker')

    const switcher = page.getByLabel('Switch Active Facility')
    await expect(switcher).toBeVisible()

    // Verify options exist
    const options = await switcher.locator('option').allInnerTexts()
    expect(options.length).toBeGreaterThanOrEqual(1)
  })

  test('initiates assessment workflow modal with clinical safety warning', async ({ page }) => {
    await page.goto('/healthcare-worker')
    await page.waitForTimeout(500)

    // Click Start Assessment button
    const assessBtn = page.getByRole('button', { name: 'Start Assessment', exact: true })
    await assessBtn.click()

    // Modal should be visible
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText('Initiate Patient Assessment Workflow')).toBeVisible()

    // Clinical safety notice must be present
    await expect(modal.getByText(/Clinical Safety Notice/i)).toBeVisible()

    // Category options must be present
    await expect(
      modal.locator('option[value="lung_cancer_risk"]')
    ).toHaveText(/Lung Cancer Risk Estimation/i)

    // Close modal
    await modal.getByLabel('Close dialog').click()
    await expect(modal).not.toBeVisible()
  })

  test('navigates to assessment workflows page with filter and safety notice', async ({ page }) => {
    await page.goto('/healthcare-worker/assessments')

    await expect(page.getByRole('heading', { name: 'Patient Assessment Workflows' })).toBeVisible()
    await expect(page.getByText(/Mandatory Clinical Safety Notice/i)).toBeVisible()

    // Check filters
    await expect(page.getByPlaceholder('Search by patient name or ID...')).toBeVisible()
    await expect(page.getByLabel('Filter by category')).toBeVisible()
    await expect(page.getByLabel('Filter by status')).toBeVisible()

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Patient' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Assessment Category' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Clinical Review' })).toBeVisible()
  })

  test('displays completion queue with missing clinical items and navigation shortcuts', async ({ page }) => {
    await page.goto('/healthcare-worker/completion-queue')

    await expect(page.getByRole('heading', { name: 'Patient Information Completion Queue' })).toBeVisible()
    await expect(page.getByText('Target Threshold')).toBeVisible()
    await expect(page.getByText('80%')).toBeVisible()

    // Check filter buttons
    await expect(page.getByRole('button', { name: /All/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Incomplete/i })).toBeVisible()

    // Completeness cards
    const completeBtns = page.getByRole('button', { name: /Complete Record/i })
    if (await completeBtns.count() > 0) {
      await expect(completeBtns.first()).toBeVisible()
    }
  })

  test('manages operational tasks and creates new task', async ({ page }) => {
    await page.goto('/healthcare-worker/tasks')
    await page.waitForTimeout(500)

    await expect(page.getByRole('heading', { name: 'Operational Tasks & Field Priorities' })).toBeVisible()
    const createTaskBtn = page.getByRole('button', { name: 'Create Task', exact: true })
    await expect(createTaskBtn).toBeVisible()

    // Open create task modal
    await createTaskBtn.click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText('Create Operational Task')).toBeVisible()

    // Fill title
    await modal.getByPlaceholder(/smoking history/i).fill('Verify biomass fuel exposure')
    await modal.getByLabel('Close dialog').click()
    await expect(modal).not.toBeVisible()
  })

  test('views chronological field activity stream', async ({ page }) => {
    await page.goto('/healthcare-worker/activity')

    await expect(page.getByRole('heading', { name: 'Field Activity Stream' })).toBeVisible()
    await expect(page.getByText('Filter by category:')).toBeVisible()

    // Check event items
    const events = page.locator('text=Actor:')
    if (await events.count() > 0) {
      await expect(events.first()).toBeVisible()
    }
  })

  test('supports bilingual localization in Bangla', async ({ page }) => {
    await page.goto('/healthcare-worker')

    // Find language switcher
    const langBtn = page.getByRole('button', { name: /বাংলা|বাং/i })
    if (await langBtn.isVisible()) {
      await langBtn.click()

      // Confirm Bangla UI elements
      await expect(
        page.getByText(/কমিউনিটি স্বাস্থ্যকর্মী ওয়ার্কস্পেস|অপারেশনাল ড্যাশবোর্ড/i).first()
      ).toBeVisible()
    }
  })
})
