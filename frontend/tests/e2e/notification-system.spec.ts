import { test, expect } from '@playwright/test'

test.describe('Phase 1.19 — Notification and Communication System', () => {
  test('1. Patient Notification Center displays notifications and non-diagnostic reassurance', async ({
    page,
  }) => {
    await page.goto('/patient/notifications')

    await expect(page).toHaveTitle(/Notifications/i)
    await expect(page.locator('text=Specialist Referral Scheduled').first()).toBeVisible()

    // Non-diagnostic reassurance notice
    await expect(
      page.locator('text=do not constitute a confirmed medical diagnosis of lung cancer')
    ).toBeVisible()

    // Filter by Unread
    const unreadBtn = page.getByRole('button', { name: /Unread/i })
    await expect(unreadBtn).toBeVisible()
    await unreadBtn.click()

    // Filter by All
    const allBtn = page.getByRole('button', { name: /^All/i })
    await expect(allBtn).toBeVisible()
    await allBtn.click()
  })

  test('2. Patient can switch to Delivery Preferences tab and see locked mandatory safety alerts', async ({
    page,
  }) => {
    await page.goto('/patient/notifications')

    // Click "Delivery Preferences"
    const prefsBtn = page.getByRole('button', { name: /Delivery Preferences/i })
    await expect(prefsBtn).toBeVisible()
    await prefsBtn.click()

    // Delivery channels header
    await expect(page.locator('text=Delivery Channels')).toBeVisible()
    await expect(page.locator('text=In-App Notifications')).toBeVisible()
    await expect(page.locator('text=SMS Alerts')).toBeVisible()
    await expect(page.locator('text=Email Notifications')).toBeVisible()

    // Categories and mandatory safety lock
    await expect(page.locator('text=Notification Categories')).toBeVisible()
    await expect(page.locator('text=Urgent Clinical Escalations & Account Security')).toBeVisible()
    await expect(page.locator('text=Mandatory').first()).toBeVisible()

    // Switch back to feed
    const backBtn = page.getByRole('button', { name: /Back to Feed/i })
    await expect(backBtn).toBeVisible()
    await backBtn.click()
    await expect(page.locator('text=Specialist Referral Scheduled').first()).toBeVisible()
  })

  test('3. Clinical Notifications Workspace displays urgent escalation and non-suppression protocol', async ({
    page,
  }) => {
    await page.goto('/clinical/notifications')

    await expect(page).toHaveTitle(/Clinical Notifications/i)
    await expect(page.locator('text=Clinical Notifications & Urgent Alerts')).toBeVisible()

    // Non-suppression protocol banner
    await expect(
      page.locator('text=Clinical Safety & Non-Suppression Protocol')
    ).toBeVisible()
    await expect(
      page.locator('text=never suppress urgent clinical triage alerts')
    ).toBeVisible()

    // Check critical clinical escalation
    await expect(
      page.locator('text=CRITICAL CLINICAL ESCALATION: Unexplained Hemoptysis')
    ).toBeVisible()
  })

  test('4. Healthcare Worker Workspace displays community intake notifications', async ({
    page,
  }) => {
    await page.goto('/healthcare-worker/notifications')

    await expect(page).toHaveTitle(/Worker Notifications/i)
    await expect(page.locator('text=Healthcare Worker Notifications')).toBeVisible()

    // Assigned patient intake notification
    await expect(page.locator('text=New Patient Intake Assigned')).toBeVisible()
    await expect(
      page.locator('text=Kamal Hossain (LGT-2026-7V4Y9Q) has been assigned')
    ).toBeVisible()
  })

  test('5. Admin Delivery Monitor displays operational telemetry, gateways, and dispatch logs', async ({
    page,
  }) => {
    await page.goto('/admin/notifications')

    await expect(page).toHaveTitle(/Notification Delivery Monitor/i)
    await expect(
      page.locator('text=Notification Dispatch & Gateway Monitor')
    ).toBeVisible()

    // Operational KPI cards
    await expect(page.locator('text=Total Notifications').first()).toBeVisible()
    await expect(page.locator('text=Success Rate').first()).toBeVisible()
    await expect(page.locator('text=Failed Deliveries').first()).toBeVisible()
    await expect(page.locator('text=Channel Breakdown').first()).toBeVisible()

    // Communication Gateways status
    await expect(page.locator('text=Bangladesh SMS Gateway')).toBeVisible()
    await expect(page.getByText('Transactional Clinical Email', { exact: true })).toBeVisible()

    // Recent dispatch logs table
    await expect(page.locator('text=Recent Dispatch & Delivery Logs')).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })
})
