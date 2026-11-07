import { test, expect } from '@playwright/test'

test.describe('Phase 1.6 — Patient Identity & Management E2E Suite', () => {
  test('displays centralized patient directory with search, filter, and privacy masking', async ({
    page,
  }) => {
    await page.goto('/healthcare-worker/patients')
    await expect(page).toHaveTitle(/Patient Directory & Registry | Lungent/i)

    // Verify search-before-register banner
    await expect(page.locator('text=Duplicate Prevention Protocol')).toBeVisible()

    // Verify presence of baseline patient records
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()
    await expect(page.locator('text=Md. Rafiqul Islam')).toBeVisible()

    // Verify telephone masking for privacy protection
    await expect(page.locator('text=017••••5678').first()).toBeVisible()

    // Test search filter input
    const searchInput = page.getByPlaceholder(/Search by Lungent Patient ID/i)
    await searchInput.fill('Rafiqul')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.locator('text=Md. Rafiqul Islam')).toBeVisible()
    await expect(page.locator('text=Nasima Begum')).not.toBeVisible()

    // Clear search
    await page.getByRole('button', { name: /Clear Filters/i }).click()
    await expect(page.locator('text=Nasima Begum')).toBeVisible()
  })

  test('enforces mandatory search-before-registration protocol and completes registration', async ({
    page,
  }) => {
    await page.goto('/healthcare-worker/patients/register')
    await expect(page).toHaveTitle(/Patient Identity Registration | Lungent/i)

    // Step 1: Search Verification / Identity Match check
    await expect(page.locator('text=Step 1: Check Existing Records').first()).toBeVisible()

    // Searching an existing patient to detect duplicates
    const nameCheckInput = page.locator('#check-name')
    await nameCheckInput.fill('Rafiqul Islam')
    const phoneCheckInput = page.locator('#check-phone')
    await phoneCheckInput.fill('01712345678')
    await page.getByRole('button', { name: /Search Existing Patients/i }).click()

    // Detects potential matching patient with match score
    await expect(page.locator('text=/Potential Duplicate Matches Detected/i')).toBeVisible()
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()

    // Staff decides this is a distinct new patient and clicks "Confirmed Distinct Person — Proceed to Register"
    const proceedBtn = page.getByRole('button', { name: /Confirmed Distinct Person/i })
    await expect(proceedBtn).toBeVisible()
    await proceedBtn.click()

    // Step 2: Full Intake Form
    await expect(page.locator('text=Step 2 of 2: Patient Identity Profile')).toBeVisible()

    // Fill demographic and contact details
    await page.locator('#reg-fullname').fill('Mohammad Habibur Rahman')
    await page.locator('#reg-age').fill('61')
    await page.locator('label[for="reg-gender-male"]').click()
    await page.locator('#reg-phone').fill('01755443322')
    await page.locator('#reg-district').fill('Dhaka')

    // Submit registration
    const submitBtn = page.getByRole('button', {
      name: /Complete Registration & Assign Patient ID/i,
    })
    await submitBtn.click()

    // Step 3: Success Confirmation with assigned Patient ID
    await expect(page.locator('text=Patient Identity Registered Successfully')).toBeVisible()
    await expect(page.locator('text=Assigned Lungent Patient ID:')).toBeVisible()
  })

  test('views patient identity profile with permanent ID card, copy action, and facility relationships', async ({
    page,
  }) => {
    // Navigate directly to sample patient profile
    await page.goto('/healthcare-worker/patients/11111111-1111-4111-a111-111111111111')
    await expect(page).toHaveTitle(/Md\. Rafiqul Islam \(LGT-2026-8K2M7P\)/i)

    // Verify Lungent Patient ID prominent badge
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()
    await expect(page.locator('text=Verified Identity')).toBeVisible()
    await expect(page.locator('text=Portal Account Linked')).toBeVisible()

    // Verify demographic cards
    await expect(page.locator('text=Demographic Details').first()).toBeVisible()
    await expect(page.locator('text=Contact Details').first()).toBeVisible()
    await expect(page.locator('text=Residential Location').first()).toBeVisible()
    await expect(page.locator('text=Healthcare Facility Relationships').first()).toBeVisible()
    await expect(page.locator('text=Identity Audit Trail').first()).toBeVisible()

    // Test copy button
    const copyBtn = page.locator('button[title="Copy ID"]').first()
    await copyBtn.click()
    await expect(copyBtn.locator('svg')).toBeVisible()
  })

  test('edits patient identity and ensures permanent ID cannot be altered', async ({ page }) => {
    await page.goto('/healthcare-worker/patients/11111111-1111-4111-a111-111111111111/edit')
    await expect(page).toHaveTitle(/Edit Identity/i)

    // Verify permanent ID notice and immutable ID banner
    await expect(page.locator('text=Permanent & Immutable')).toBeVisible()
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()
    await expect(
      page.locator(
        'text=Security Notice: The Lungent Patient ID is permanent and cannot be altered.'
      )
    ).toBeVisible()

    // Update emergency contact and submit
    const emergencyInput = page.locator('#emergencyName')
    await emergencyInput.fill('Fatema Begum Islam')

    const saveBtn = page.getByRole('button', { name: /Save Changes/i })
    await saveBtn.click()

    // Success notice displayed
    await expect(page.locator('text=Patient identity updated successfully.')).toBeVisible()
  })

  test('inspects duplicate candidate queue, criteria comparison, and merge dialog', async ({
    page,
  }) => {
    await page.goto('/healthcare-worker/patients/duplicates')
    await expect(page).toHaveTitle(/Duplicate Candidate Queue | Lungent/i)

    // Tabs are visible
    await expect(page.getByRole('button', { name: /Pending Review/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Resolved \/ Dismissed/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Merged History/i })).toBeVisible()

    // Verify duplicate cards
    await expect(page.locator('text=Match Score: 92%')).toBeVisible()
    await expect(page.locator('text=Detection Criteria:').first()).toBeVisible()
    await expect(page.locator('text=Identical telephone number: 01712345678')).toBeVisible()

    // Comparison cards: Primary vs Candidate
    await expect(page.locator('text=Primary Record').first()).toBeVisible()
    await expect(page.locator('text=Suspected Duplicate Record').first()).toBeVisible()

    // Enforces justification for review
    const dismissBtn = page.getByRole('button', { name: /Dismiss \(Distinct Patients\)/i }).first()
    await dismissBtn.click()
    await expect(page.locator('text=/Please provide at least 10 characters/i')).toBeVisible()

    // Open merge dialog
    const mergeBtn = page.getByRole('button', { name: /Execute Controlled Merge/i }).first()
    await mergeBtn.click()

    await expect(
      page.getByRole('heading', { name: /Confirm Controlled Record Merge/i })
    ).toBeVisible()
    await expect(page.locator('text=Surviving Record:')).toBeVisible()
    await expect(page.locator('text=Retired Record:')).toBeVisible()
  })

  test('displays patient own identifier on patient dashboard', async ({ page }) => {
    await page.goto('/patient')
    await expect(page).toHaveTitle(/Lungent/i)

    // Verify Lungent Patient ID card on patient dashboard
    await expect(page.locator('text=Permanent Patient Identifier')).toBeVisible()
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()
    await expect(page.locator('text=Verified Identity')).toBeVisible()
    await expect(
      page.locator('text=Primary Registration Facility: Dhaka Central Pulmonary Institute')
    ).toBeVisible()
  })

  test('supports bilingual Bangla localization in patient management', async ({ page }) => {
    await page.goto('/healthcare-worker/patients')

    // Switch language to Bangla using LanguageSwitcher
    const switcher = page.locator('button[aria-label="Select language"]').first()
    await switcher.click()
    const banglaOption = page.locator('li[role="option"]:has-text("বাংলা")')
    await banglaOption.click()

    // Verify Bangla registry headers and buttons
    await expect(page.getByRole('heading', { name: 'রোগী রেজিস্ট্রি ও ডিরেক্টরি' })).toBeVisible()
  })
})
