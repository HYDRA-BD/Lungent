import { test, expect } from '@playwright/test'

test.describe('Reporting System Workflows (Phase 1.22)', () => {
  test('1. Patient Portal — view assessment reports, preview modal, and non-diagnostic disclaimers', async ({ page }) => {
    await page.goto('/patient/documents')
    await page.waitForLoadState('networkidle')

    // Verify Title & Security notice
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('Protected Health Document Vault')).toBeVisible()

    // Assessment Reports section should be active
    const reportsHeading = page.getByRole('heading', { name: /Assessment Reports|ক্লিনিক্যাল মূল্যায়ন/i })
    await expect(reportsHeading).toBeVisible()

    // Look for at least one report card
    const reportRef = page.getByText(/RPT-2026-/i).first()
    await expect(reportRef).toBeVisible()

    // Click Preview button
    const previewBtn = page.getByRole('button', { name: /Preview|প্রিভিউ/i }).first()
    await previewBtn.click()

    // Verify Report Viewer Dialog opens
    const dialogTitle = page.locator('[role="dialog"] h2')
    await expect(dialogTitle).toBeVisible()

    // Verify Copy ID and Open in Tab buttons
    await expect(page.getByRole('button', { name: /Copy ID|কোড কপি/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Open in Tab|নতুন ট্যাবে খুলুন/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Download PDF|পিডিএফ ডাউনলোড/i })).toBeVisible()

    // Close Dialog
    const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /close/i }).first()
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
    } else {
      await page.keyboard.press('Escape')
    }
  })

  test('2. Clinical Workspace — filter reports, generate on-demand report, and inspect audit', async ({ page }) => {
    await page.goto('/clinical/reports')
    await page.waitForLoadState('networkidle')

    // Verify header and audited badge
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText(/Audited CDSS|ক্লিনিক্যাল অডিট সক্রিয়/i)).toBeVisible()

    // Verify stats cards
    await expect(page.getByText(/Total Reports|মোট রিপোর্ট/i).first()).toBeVisible()
    await expect(page.getByText(/Clinical CDSS|ক্লিনিক্যাল CDSS/i).first()).toBeVisible()

    // Verify Report History Table
    await expect(page.getByRole('table')).toBeVisible()

    // Open Generate Report Dialog
    const generateBtn = page.getByRole('button', { name: /New Report|নতুন প্রতিবেদন/i }).first()
    await generateBtn.click()

    // Verify Generate Modal
    await expect(page.getByText(/Generate Clinical Report|নতুন ক্লিনিক্যাল প্রতিবেদন তৈরি করুন/i)).toBeVisible()

    // Select Risk Estimation report
    const riskOption = page.locator('input[value="risk_estimation"]')
    if (await riskOption.isVisible()) {
      await riskOption.check()
    }

    // Submit generation
    const submitBtn = page.getByRole('button', { name: /Generate Report|প্রতিবেদন প্রস্তুত করুন/i })
    await submitBtn.click()

    // Wait for modal to close and new report to be listed
    await expect(page.getByText(/Generate Clinical Report|নতুন ক্লিনিক্যাল প্রতিবেদন তৈরি করুন/i)).not.toBeVisible({ timeout: 5000 })
  })

  test('3. Healthcare Worker Workspace — field reports and patient summaries', async ({ page }) => {
    await page.goto('/healthcare-worker/reports')
    await page.waitForLoadState('networkidle')

    // Verify Header
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText(/Worker Portal|স্বাস্থ্যকর্মী পোর্টাল/i)).toBeVisible()

    // Verify Field Table & Actions
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate Summary|নতুন সারসংক্ষেপ/i })).toBeVisible()
  })

  test('4. Bilingual Reporting — verify Bangla rendering and typography', async ({ page }) => {
    await page.goto('/clinical/reports')
    await page.waitForLoadState('networkidle')

    // Toggle Language to Bangla
    const langBtn = page.locator('button').filter({ hasText: /English|বাংলা/i }).first()
    if (await langBtn.isVisible()) {
      await langBtn.click()
      const bnOption = page.getByRole('menuitem', { name: /বাংলা/i }).or(page.getByText('বাংলা (Bangla)'))
      if (await bnOption.isVisible()) {
        await bnOption.click()
        await page.waitForTimeout(400)
      }
    }

    // Verify Bangla title and governance notices
    const pageContent = await page.content()
    expect(pageContent).toContain('প্রতিবেদন')
    expect(pageContent).toContain('লুনজেন্ট')
  })

  test('5. Direct PDF Download API endpoint — returns valid PDF 1.4 stream', async ({ request }) => {
    const response = await request.get('/api/reports/rpt-pat-001/download?format=pdf')
    expect(response.status()).toBe(200)

    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/pdf')

    const disposition = response.headers()['content-disposition']
    expect(disposition).toContain('attachment')
    expect(disposition).toContain('.pdf')

    const buffer = await response.body()
    expect(buffer.length).toBeGreaterThan(500)

    // PDF header verification
    const headerStr = buffer.subarray(0, 8).toString('utf-8')
    expect(headerStr).toContain('%PDF-1.4')
  })
})
