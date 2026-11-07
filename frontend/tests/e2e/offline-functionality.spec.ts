import { test, expect } from '@playwright/test'

test.describe('Phase 1.21 — Limited Offline Functionality E2E Suite', () => {
  test.describe.configure({ mode: 'serial' })

  test('1. Anonymous self-check automatically saves drafts locally in IndexedDB and restores progress on reload', async ({
    page,
  }) => {
    await page.goto('/self-check')

    // Step 0: Informed consent
    await page.locator('label[for="ack-terms"]').first().click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 1: Demographics
    await expect(page.getByRole('heading', { name: /Basic Demographics/i })).toBeVisible()

    await page.locator('select#age-range').selectOption('50_59')
    await page.locator('label[for="biological-sex-male"]').click()
    await page.locator('select#division').selectOption('dhaka')

    // Verify "Saved locally" status badge is visible in progress header
    await expect(page.locator('text=Saved locally').first()).toBeVisible()

    // Allow debounce timer to flush write to IndexedDB
    await page.waitForTimeout(400)

    // Reload page to simulate browser close or network disconnect
    await page.reload()

    // Verify progress restoration notice appears
    await expect(
      page.locator('text=Restored your previously saved assessment draft on this device')
    ).toBeVisible()

    // Verify restored values
    await expect(page.locator('select#age-range')).toHaveValue('50_59')
    await expect(page.locator('select#division')).toHaveValue('dhaka')

    // Discard draft to clean up for subsequent tests
    const discardBtn = page.getByRole('button', { name: /Discard Draft/i })
    if (await discardBtn.isVisible()) {
      await discardBtn.click()
    }
  })

  test('2. Self-check step 5 displays prominent non-diagnostic emergency safety warning on hemoptysis', async ({
    page,
  }) => {
    await page.goto('/self-check')
    await page.evaluate(() => {
      try {
        window.indexedDB.deleteDatabase('lungent_offline_db')
      } catch {
        // ignore
      }
    })
    await page.goto('/self-check')
    await page.waitForLoadState('networkidle')

    // Clean up any residual draft if present
    const discardBtn = page.getByRole('button', { name: /Discard Draft/i })
    if (await discardBtn.isVisible()) {
      await discardBtn.click()
    }

    // Step 0: Consent
    await page.locator('label[for="ack-terms"]').first().click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 1 -> Step 2
    await page.locator('select#age-range').selectOption('50_59')
    await page.locator('label[for="biological-sex-male"]').click()
    await page.locator('select#division').selectOption('dhaka')
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 2 -> Step 3
    await expect(page.getByRole('heading', { name: /Tobacco & Smoking History/i })).toBeVisible()
    await page.locator('label[for="smoking-status-never"]').click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 3 -> Step 4
    await expect(page.getByRole('heading', { name: /Respiratory & Medical History/i })).toBeVisible()
    await page.locator('label[for="cond-none"]').first().click()
    await page.locator('label[for="family-lung-cancer-no"]').click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 4 -> Step 5
    await expect(page.getByRole('heading', { name: /Environmental & Cooking Exposures/i })).toBeVisible()
    await page.locator('select#cooking-fuel').selectOption('lpg_gas')
    await page.locator('label[for="occ-none"]').first().click()
    await page.locator('label[for="air-pollution-low"]').click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 5: Symptoms Awareness & Safety Check
    await expect(page.getByRole('heading', { name: /Symptom Awareness & Safety Check/i })).toBeVisible()
    await expect(
      page.locator('text=Symptoms are evaluated independently from risk calculations')
    ).toBeVisible()

    // Select Urgent Symptom: Coughing up blood (Hemoptysis)
    await page.locator('label[for="sym-coughing_blood"]').first().click()

    // Submit to results page
    await page.getByRole('button', { name: /View Results/i }).click()

    // Verify independent red-flag emergency safety alert is rendered
    await expect(page.locator('text=URGENT CLINICAL WARNING SIGN REPORTED')).toBeVisible()
    await expect(
      page.locator('text=Low statistical risk NEVER overrides active symptoms')
    ).toBeVisible()
  })

  test('3. Patient assessments portal renders Offline Drafts action and opens Synchronization Hub', async ({
    page,
  }) => {
    await page.goto('/patient/assessments')

    // Verify page
    await expect(page.getByRole('heading', { name: /My Clinical Assessments/i })).toBeVisible()

    // Verify "Offline Drafts" action button is rendered in page header
    const offlineDraftsBtn = page.getByRole('button', { name: /Offline Drafts/i })
    await expect(offlineDraftsBtn).toBeVisible()
    await offlineDraftsBtn.click()

    // Verify Offline Drafts & Synchronization Hub dialog opens
    await expect(
      page.getByRole('heading', { name: /Offline Drafts & Synchronization Hub/i })
    ).toBeVisible()
    await expect(
      page.locator('text=Manage assessment drafts saved locally during network interruptions')
    ).toBeVisible()

    // Close dialog
    const closeBtn = page.getByRole('button', { name: /Close dialog/i })
    await closeBtn.click()
  })

  test('4. Healthcare worker assessments workspace renders Offline Drafts hub trigger', async ({
    page,
  }) => {
    await page.goto('/healthcare-worker/assessments')

    // Verify "Offline Drafts" hub button is visible
    const offlineDraftsBtn = page.getByRole('button', { name: /Offline Drafts/i })
    await expect(offlineDraftsBtn).toBeVisible()
    await offlineDraftsBtn.click()

    // Verify dialog opens
    await expect(
      page.getByRole('heading', { name: /Offline Drafts & Synchronization Hub/i })
    ).toBeVisible()

    // Close dialog
    await page.getByRole('button', { name: /Close dialog/i }).click()
  })

  test('5. Supports bilingual localization in Bangla and English for offline sync badges and hubs', async ({
    page,
  }) => {
    await page.goto('/patient/assessments')

    // Switch language to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtn.click()
    const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
    await bnOption.click()

    // Verify Bangla button: 'অফলাইন ড্রাফট'
    const bnOfflineBtn = page.getByRole('button', { name: /অফলাইন ড্রাফট/i })
    await expect(bnOfflineBtn).toBeVisible()
    await bnOfflineBtn.click()

    // Verify Bangla Hub title: 'অফলাইন ড্রাফট ও সিঙ্ক ম্যানেজার'
    await expect(
      page.getByRole('heading', { name: /অফলাইন ড্রাফট ও সিঙ্ক ম্যানেজার/i })
    ).toBeVisible()

    // Close dialog
    await page.getByRole('button', { name: /Close dialog/i }).click()

    // Switch back to English
    const languageBtnBn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtnBn.click()
    const enOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /English/i })
    await enOption.click()

    await expect(page.getByRole('button', { name: /Offline Drafts/i })).toBeVisible()
  })
})
