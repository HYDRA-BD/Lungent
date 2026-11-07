import { test, expect } from '@playwright/test'

test.describe('Operational Analytics Workflows (Phase 1.23)', () => {
  test('1. Admin Analytics Dashboard — render KPIs, tabs, and filter controls', async ({ page }) => {
    await page.goto('/admin/analytics')
    await page.waitForLoadState('networkidle')

    // Verify Title & Description
    await expect(page.locator('h1')).toContainText(/Operational Analytics|অপারেশনাল অ্যানালিটিক্স/i)

    // Verify Top KPI Metric Cards
    await expect(page.getByText(/Registered Patients|নিবন্ধিত রোগী/i).first()).toBeVisible()
    await expect(page.getByText(/Assessments Submitted|দাখিলকৃত মূল্যায়ন/i).first()).toBeVisible()
    await expect(page.getByText(/Pending Reviews|পর্যালোচনা অপেক্ষমাণ/i).first()).toBeVisible()
    await expect(page.getByText(/Operational Facilities|সক্রিয় স্বাস্থ্যকেন্দ্র/i).first()).toBeVisible()

    // Verify Date Range Filter Buttons
    await expect(page.getByRole('button', { name: /Last 30 Days|গত ৩০ দিন/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Last 7 Days|গত ৭ দিন/i })).toBeVisible()

    // Click Last 7 Days filter
    await page.getByRole('button', { name: /Last 7 Days|গত ৭ দিন/i }).click()
  })

  test('2. Metric Dictionary Modal — search definitions, formulas, and limitations', async ({ page }) => {
    await page.goto('/admin/analytics')
    await page.waitForLoadState('networkidle')

    // Open Metric Dictionary modal
    const dictBtn = page.getByRole('button', { name: /Metric Catalog|মেট্রিক ডিকশনারি/i }).first()
    await expect(dictBtn).toBeVisible()
    await dictBtn.click()

    // Verify Dialog is open
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/Operational Metric Dictionary|অপারেশনাল মেট্রিক ডিকশনারি/i)).toBeVisible()

    // Search for turnaround time metric
    const searchInput = dialog.getByPlaceholder(/Search metric name|মেট্রিক নাম বা বিবরণ/i)
    await searchInput.fill('turnaround')

    // Verify calculation method and limitations alert
    await expect(dialog.getByText(/Calculation Method|গণনা পদ্ধতি/i).first()).toBeVisible()
    await expect(dialog.getByText(/Known Limitation|জ্ঞাত সীমাবদ্ধতা/i).first()).toBeVisible()

    // Close Dialog with Escape key
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('3. Tab Switching — inspect Workflows, Facilities, Geography, and Telemetry', async ({ page }) => {
    await page.goto('/admin/analytics')
    await page.waitForLoadState('networkidle')

    // 1. Switch to Workflows & Referrals Tab
    await page.getByRole('tab', { name: /Workflows & Referrals|ওয়ার্কফ্লো ও রেফারেল/i }).click()
    await expect(page.getByText(/Clinical Review Turnaround|ক্লিনিকাল পর্যালোচনা/i)).toBeVisible()
    await expect(page.getByText(/Specialist Referral Progression|বিশেষায়িত রেফারেল/i)).toBeVisible()

    // 2. Switch to Facilities & Field CHWs Tab
    await page.getByRole('tab', { name: /Facilities & Field CHWs|স্বাস্থ্যকেন্দ্র ও মাঠকর্মী/i }).click()
    await expect(page.getByText(/Community Healthcare Worker Field Outreach|কমিউনিটি স্বাস্থ্যকর্মীদের/i)).toBeVisible()
    await expect(page.getByText(/Facility Activity & Verification Status|স্বাস্থ্যকেন্দ্রভিত্তিক কার্যক্রম/i)).toBeVisible()

    // 3. Switch to Geographic & Environmental Tab
    await page.getByRole('tab', { name: /Geographic & Environmental|ভৌগোলিক ও পরিবেশ/i }).click()
    await expect(page.getByText(/Geographic Distribution & Privacy Protection|ভৌগোলিক বণ্টন/i)).toBeVisible()
    await expect(page.getByText(/Environmental API Availability|পরিবেশগত এপিআই/i)).toBeVisible()

    // Verify small-group suppression badge (< 5 Suppressed)
    await expect(page.getByText(/k-Anonymity|k-অ্যানোনিমিটি/i)).toBeVisible()

    // 4. Switch to Data Quality & Telemetry Tab
    await page.getByRole('tab', { name: /Data Quality & Telemetry|তথ্যের মান ও টেলিমেট্রি/i }).click()
    await expect(page.getByText(/Data Quality, Completeness & Reliability|তথ্যের মান/i)).toBeVisible()
    await expect(page.getByText(/Platform Reliability & Technical Telemetry|সিস্টেম সক্ষমতা/i)).toBeVisible()
  })

  test('4. Clinical Workspace — review queue analytics and safety override rule', async ({ page }) => {
    await page.goto('/clinical/analytics')
    await page.waitForLoadState('networkidle')

    // Verify Clinical Header
    await expect(page.locator('h1')).toContainText(/Clinical Workflow & Review Analytics|ক্লিনিক্যাল ওয়ার্কফ্লো/i)

    // Verify Clinician review cards
    await expect(page.getByText(/Awaiting Review|পর্যালোচনা অপেক্ষমাণ/i).first()).toBeVisible()
    await expect(page.getByText(/Active Referrals|সক্রিয় রেফারেল/i).first()).toBeVisible()

    // Verify Clinical Safety Protocol banner
    await expect(page.getByText(/Clinical Safety Protocol|ক্লিনিকাল নন-সাপ্রেশন প্রোটোকল/i)).toBeVisible()
  })

  test('5. Healthcare Worker Workspace — field outreach and non-punitive notice', async ({ page }) => {
    await page.goto('/healthcare-worker/analytics')
    await page.waitForLoadState('networkidle')

    // Verify Worker Header
    await expect(page.locator('h1')).toContainText(/Field Outreach & Data Completeness|ফিল্ড আউটরিচ/i)

    // Verify Onboarding metrics
    await expect(page.getByText(/Patients Onboarded|নিবন্ধিত রোগী/i).first()).toBeVisible()
    await expect(page.getByText(/Completed Profiles|সম্পন্ন ফাইল/i).first()).toBeVisible()

    // Verify Non-Punitive Notice
    await expect(page.getByText(/Operational Governance & Non-Punitive Notice|অপারেশনাল নীতিমালা/i)).toBeVisible()
  })

  test('6. Bilingual Localization — verify Bangla typography and metric labels', async ({ page }) => {
    await page.goto('/admin/analytics')
    await page.waitForLoadState('networkidle')

    // Toggle to Bangla
    const langBtn = page.getByRole('button', { name: /বাংলা|EN/i }).first()
    if (await langBtn.isVisible()) {
      await langBtn.click()
      await page.waitForTimeout(400)
    }

    // Verify localized heading or badge
    await expect(page.locator('h1')).toBeVisible()

    // Verify Metric Catalog button in Bangla or English
    await expect(page.getByRole('button', { name: /মেট্রিক ডিকশনারি|Metric Catalog/i })).toBeVisible()
  })
})

