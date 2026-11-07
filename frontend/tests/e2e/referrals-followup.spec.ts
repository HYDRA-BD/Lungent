import { test, expect } from '@playwright/test'

test.describe('Phase 1.18 — Healthcare Referral and Follow-up Management', () => {
  test('1. Clinical Workspace: Renders Referrals Dashboard, KPIs, and Safety Policy', async ({ page }) => {
    await page.goto('/clinical/referrals')

    // Header check
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Specialist Referrals|স্পেশালিস্ট রেফারেল/i)

    // Clinical Safety & Governance Policy check
    await expect(page.getByText('Clinical Safety & Governance Policy')).toBeVisible()
    await expect(page.getByText(/A low asymptomatic risk score or screening ineligibility must never suppress/i)).toBeVisible()
    await expect(page.getByText(/do not constitute a confirmed diagnosis of lung cancer/i)).toBeVisible()

    // Metric Cards
    await expect(page.getByText('Active Referrals')).toBeVisible()
    await expect(page.getByText('Urgent 2-Week-Wait', { exact: true })).toBeVisible()
    await expect(page.getByText('Scheduled Consultations')).toBeVisible()

    // Canonical Referral ID in table
    await expect(page.getByText(/REF-2026-9K2L4P/i)).toBeVisible()
    await expect(page.getByText(/Md. Rafiqul Islam/i).first()).toBeVisible()
  })

  test('2. Clinical Workspace: Opens Create Referral Modal with verified facility choices', async ({ page }) => {
    await page.goto('/clinical/referrals')

    // Find and click Create Referral trigger
    const createBtn = page.getByRole('button', { name: /Create Specialist Referral/i }).first()
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // Modal contents
    await expect(page.getByText(/Initiate Clinical Referral/i)).toBeVisible()
    await expect(page.getByText('Referral Priority Tier *')).toBeVisible()
    await expect(page.getByText(/Urgent 2WW/i).first()).toBeVisible()
    await expect(page.getByText(/Priority/i).first()).toBeVisible()
    await expect(page.getByText('Operational & Verified')).toBeVisible()

    // Close modal
    await page.getByRole('button', { name: /Cancel/i }).click()
    await expect(page.getByText(/Initiate Clinical Referral/i)).not.toBeVisible()
  })

  test('3. Healthcare Worker Workspace: Renders Field Referrals & Follow-Up Tracking', async ({ page }) => {
    await page.goto('/healthcare-worker/referrals')

    // Header check
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Field Referrals & Follow-Up Tracking|ফিল্ড রেফারেল/i)

    // Privacy & Continuity Policy
    await expect(page.getByText(/Field Care Continuity & Patient Privacy/i)).toBeVisible()

    // Metric cards
    await expect(page.getByText('Active Referrals')).toBeVisible()
    await expect(page.getByText('Scheduled Visits')).toBeVisible()

    // Tab toggle to Follow-Up Plans
    const followUpsTab = page.getByRole('tab', { name: /Follow-Up Plans/i })
    await expect(followUpsTab).toBeVisible()
    await followUpsTab.click()

    // Follow-ups table shows scheduled items
    await expect(page.getByText(/Post-Imaging Review/i).first()).toBeVisible()
  })

  test('4. Patient Portal: Displays Active Referrals & Non-Diagnostic Reassurance Notice', async ({ page }) => {
    await page.goto('/patient/referrals')

    // Header check
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Referrals|রেফারেল/i)

    // Non-diagnostic Reassurance Banner
    await expect(page.getByText('Important Clinical Reassurance')).toBeVisible()
    await expect(page.getByText(/It does NOT mean you have lung cancer/i)).toBeVisible()

    // Destination Hospital and Canonical ID
    await expect(page.getByText(/National Institute of Diseases of the Chest and Hospital/i).first()).toBeVisible()
    await expect(page.getByText(/Referral ID:/i).first()).toBeVisible()
  })

  test('5. Clinical Patient Record: Embeds Specialist Referral Action Button', async ({ page }) => {
    // Visit patient Rafiqul Islam
    await page.goto('/clinical/patients/11111111-1111-4111-a111-111111111111')

    // Action button to create referral exists
    const refBtn = page.getByRole('button', { name: /Create Referral|রেফারেল করুন/i })
    await expect(refBtn).toBeVisible()
  })
})
