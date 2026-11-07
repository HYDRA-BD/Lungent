import { test, expect } from '@playwright/test'

test.describe('Phase 1.5 — Anonymous Basic Self-Check E2E Suite', () => {
  test('navigates from homepage hero to self-check', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Lungent/i)

    const startCta = page.getByRole('link', { name: /Start Free Self-Check/i })
    await expect(startCta).toBeVisible()
    await startCta.click()

    await expect(page).toHaveURL(/\/self-check/)
    await expect(page).toHaveTitle(/Basic Lung Health Self-Check | Lungent/i)
  })

  test('enforces informed consent acknowledgement on step 0', async ({ page }) => {
    await page.goto('/self-check')

    // Verifies badge and introductory notices
    await expect(page.locator('text=100% Anonymous • No Sign-In Required')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Basic Lung Health Self-Check/i })).toBeVisible()
    await expect(page.locator('text=What this self-check is:')).toBeVisible()
    await expect(page.locator('text=What this self-check is NOT:')).toBeVisible()
    await expect(page.locator('text=Safety First:')).toBeVisible()

    // Attempting to advance without consent
    const continueBtn = page.getByRole('button', { name: /Continue/i })
    await continueBtn.click()

    // Error message appears
    await expect(
      page.locator('text=You must acknowledge the limitations to proceed with the self-check.')
    ).toBeVisible()

    // Acknowledge consent
    await page.locator('label[for="ack-terms"]').first().click()

    // Now advance to Step 1
    await continueBtn.click()
    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Basic Demographics/i })).toBeVisible()
  })

  test('completes full assessment pathway and verifies symptom safety override on results page', async ({
    page,
  }) => {
    await page.goto('/self-check')

    // Step 0: Consent
    await page.locator('label[for="ack-terms"]').first().click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 1: Demographics
    await page.locator('select#age-range').selectOption('50_59')
    await page.locator('label[for="biological-sex-male"]').click()
    await page.locator('select#division').selectOption('dhaka')
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 2: Smoking History
    await expect(page.getByRole('heading', { name: /Tobacco & Smoking History/i })).toBeVisible()
    await page.locator('label[for="smoking-status-current"]').click()

    // Conditional inputs appear
    await page.locator('select#tobacco-type').selectOption('cigarettes')
    await page.locator('input#per-day').fill('20')
    await page.locator('input#duration-years').fill('25')

    // Live pack-years calculation verification
    await expect(page.locator('text=Calculated Cumulative Exposure:')).toBeVisible()
    await expect(page.locator('text=25')).toBeVisible()

    await page.locator('label[for="secondhand-smoke-household"]').click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 3: Medical History
    await expect(page.getByRole('heading', { name: /Respiratory & Medical History/i })).toBeVisible()
    await page.locator('label[for="cond-asthma"]').first().click()
    await page.locator('label[for="family-lung-cancer-yes_first_degree"]').click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 4: Environmental & Cooking Exposures
    await expect(page.getByRole('heading', { name: /Environmental & Cooking Exposures/i })).toBeVisible()
    await page.locator('select#cooking-fuel').selectOption('biomass_wood_dung')
    await page.locator('input#biomass-years').fill('20')
    await page.locator('label[for="occ-none"]').first().click()
    await page.locator('label[for="air-pollution-high_urban"]').click()
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 5: Symptoms Awareness & Safety Check
    await expect(page.getByRole('heading', { name: /Symptom Awareness & Safety Check/i })).toBeVisible()
    await expect(page.locator('text=Symptoms are evaluated independently from risk calculations')).toBeVisible()

    // Select Urgent Symptom: Coughing up blood (Hemoptysis)
    await page.locator('label[for="sym-coughing_blood"]').first().click()
    await page.locator('label[for="sym-cough_over_3_weeks"]').first().click()

    // Submit self-check
    await page.getByRole('button', { name: /View Results/i }).click()

    // Step 6: Results Presentation Verification
    await expect(page.getByRole('heading', { name: /Your Lung Health Assessment/i })).toBeVisible()

    // 1. Mandatory Urgent Red-Flag Symptom Safety Banner
    await expect(page.locator('text=URGENT CLINICAL WARNING SIGN REPORTED')).toBeVisible()
    await expect(
      page.locator('text=Low statistical risk NEVER overrides active symptoms')
    ).toBeVisible()

    // 2. Risk Profile & Screening Candidacy
    await expect(
      page.getByText('Elevated Risk Factor Profile (Screening Candidate)').first()
    ).toBeVisible()
    await expect(page.locator('text=Screening Candidate').first()).toBeVisible()
    await expect(page.locator('text=Cumulative Tobacco Exposure: 25 pack-years')).toBeVisible()

    // 3. Identified Risk Factors
    await expect(page.locator('text=Identified Risk Factors')).toBeVisible()
    await expect(
      page.locator('text=Significant cumulative smoking history: 25 pack-years')
    ).toBeVisible()

    // 4. Actionable Next Steps
    await expect(page.locator('text=Recommended Next Steps')).toBeVisible()
    await expect(page.locator('text=PRIORITY CLINICAL EVALUATION')).toBeVisible()
    await expect(page.locator('text=SCREENING DISCUSSION CANDIDATE')).toBeVisible()
    await expect(page.locator('text=TOBACCO CESSATION')).toBeVisible()

    // 5. Non-Diagnostic Medical Disclaimer
    await expect(page.locator('text=Non-Diagnostic Medical Disclaimer')).toBeVisible()
    await expect(page.locator('text=NON-DIAGNOSTIC ADVISORY')).toBeVisible()

    // 6. Action buttons
    await expect(page.getByRole('button', { name: /Print \/ Save Summary/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Retake Self-Check/i })).toBeVisible()
  })

  test('preserves responses and supports language toggling to Bangla', async ({ page }) => {
    await page.goto('/self-check')

    // Toggle to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtn.click()
    const bnOption = page.getByRole('option', { name: /বাংলা/i })
    await bnOption.click()

    // Step 0 in Bangla
    await expect(page.locator('text=১০০% বেনামী • কোনো অ্যাকাউন্টের প্রয়োজন নেই')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /ফুসফুস স্বাস্থ্য প্রাথমিক স্ব-মূল্যায়ন/i })
    ).toBeVisible()

    // Acknowledge and proceed
    await page.locator('label[for="ack-terms"]').first().click()
    await page.getByRole('button', { name: /পরবর্তী ধাপ/i }).click()

    // Step 1 in Bangla
    await expect(page.locator('text=ধাপ ১ / ৫')).toBeVisible()
    await expect(page.getByRole('heading', { name: /সাধারণ জনমিতিক তথ্য/i })).toBeVisible()
  })
})
