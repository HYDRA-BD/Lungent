import { test, expect } from '@playwright/test'

test.describe('Phase 1.7 — Patient Health Information Management E2E Suite', () => {
  const patientId = '11111111-1111-4111-a111-111111111111'
  const patientHealthRecordUrl = `/healthcare-worker/patients/${patientId}/health-record`

  test('navigates from patient profile to comprehensive health record and displays quick stats', async ({
    page,
  }) => {
    // 1. Visit patient profile
    await page.goto(`/healthcare-worker/patients/${patientId}`)
    await expect(page).toHaveTitle(/Md. Rafiqul Islam \(LGT-2026-8K2M7P\)/i)

    // Verify Health Record action link
    const healthRecordBtn = page.getByRole('link', { name: /Health Record|স্বাস্থ্য রেকর্ড/i }).first()
    await expect(healthRecordBtn).toBeVisible()
    await healthRecordBtn.click()

    // 2. Health record view
    await expect(page).toHaveURL(new RegExp(patientHealthRecordUrl))
    await expect(page).toHaveTitle(/Health Record — Md. Rafiqul Islam/i)

    // 3. Clinical Safety Disclaimer
    await expect(
      page.locator('text=Health Information Notice: This clinical record organizes longitudinal health data and provenance')
    ).toBeVisible()

    // 4. Quick Stats Cards
    await expect(page.locator('text=25').first()).toBeVisible() // 25 Pack-Years
    await expect(page.locator('text=22.9 kg/m²').first()).toBeVisible() // 22.9 BMI
    await expect(page.locator('text=128/82 mmHg').first()).toBeVisible() // Blood Pressure
  })

  test('displays all 10 clinical categories with immutable data provenance badges', async ({
    page,
  }) => {
    await page.goto(patientHealthRecordUrl)

    // Tab 1: Overview has pack-years callout with transparent formula
    await expect(page.locator('text=((cigarettes_per_day + bidis_per_day) / 20) * years_smoked').first()).toBeVisible()

    // Check Data Provenance indicators
    await expect(page.locator('text=Data Source:').first()).toBeVisible()
    await expect(page.locator('text=Verification Status:').first()).toBeVisible()
    await expect(page.locator('text=Clinician Verified').first()).toBeVisible()

    // Tab 2: Switch to Medical Conditions
    await page.getByRole('button', { name: /Medical Conditions/i }).click()
    await expect(page.locator('text=Chronic Obstructive Pulmonary Disease (COPD)')).toBeVisible()
    await expect(page.locator('text=Primary Respiratory Condition').first()).toBeVisible()
    await expect(page.locator('text=Pulmonary Tuberculosis (Completed Treatment)')).toBeVisible()

    // Tab 3: Switch to Medications
    await page.getByRole('button', { name: /Medications/i }).click()
    await expect(page.locator('text=Tiotropium Bromide Respimat 2.5mcg')).toBeVisible()
    await expect(page.locator('text=Salbutamol Inhaler 100mcg')).toBeVisible()

    // Tab 4: Switch to Allergies
    await page.getByRole('button', { name: /Allergies/i }).click()
    await expect(page.locator('text=Penicillin')).toBeVisible()
    await expect(page.locator('text=Severity: moderate')).toBeVisible()

    // Tab 5: Switch to Tobacco & Smoking
    await page.getByRole('button', { name: /Tobacco & Smoking/i }).click()
    await expect(page.locator('text=25 Pack-Years').first()).toBeVisible()
    await expect(page.locator('text=25 years').first()).toBeVisible()

    // Tab 6: Switch to Environmental Exposures
    await page.getByRole('button', { name: /Environmental Exposures/i }).click()
    await expect(page.locator('text=Textile Factory Dust & Chemical Dyes')).toBeVisible()
    await expect(page.locator('text=Traditional Biomass Chula (Wood & Cow Dung)')).toBeVisible()

    // Tab 7: Switch to Family History
    await page.getByRole('button', { name: /Family History/i }).click()
    await expect(page.locator('text=Squamous Cell Carcinoma of Lung')).toBeVisible()

    // Tab 8: Switch to Lifestyle & Diet
    await page.getByRole('button', { name: /Lifestyle & Diet/i }).click()
    await expect(page.locator('text=Traditional rice, lentil, and fish diet')).toBeVisible()

    // Tab 9: Switch to Measurements & Vitals
    await page.getByRole('button', { name: /Measurements & Vitals/i }).click()
    await expect(page.locator('text=Height').first()).toBeVisible()
    await expect(page.locator('text=Weight').first()).toBeVisible()
    await expect(page.locator('text=Derived: weight_kg / (height_m ^ 2)').first()).toBeVisible()

    // Tab 10: Switch to Symptoms
    await page.getByRole('button', { name: /Symptoms/i }).click()
    await expect(page.locator('text=dyspnea breathlessness')).toBeVisible()

    // Tab 11: Switch to Clinician Ledger
    await page.getByRole('button', { name: /Clinician Ledger/i }).click()
    await expect(page.locator('text=Dr. Rafiqul Islam, Pulmonologist')).toBeVisible()
    await expect(page.locator('text=Full baseline health record reviewed during intake consultation')).toBeVisible()
  })

  test('allows adding a new medical condition via modal dialog', async ({ page }) => {
    await page.goto(patientHealthRecordUrl)

    // Switch to Medical Conditions tab
    await page.getByRole('button', { name: /Medical Conditions/i }).click()

    // Click Add Condition button
    await page.getByRole('button', { name: /Add Condition/i }).click()
    await expect(page.locator('h2:has-text("Add Condition"), h3:has-text("Add Condition")').first()).toBeVisible()

    // Fill form
    await page.locator('#cond-name').fill('Chronic Allergic Rhinitis')
    await page.locator('#cond-onset').fill('2019')
    await page.locator('#cond-tx').fill('Nasal fluticasone spray seasonal')
    await page.getByRole('button', { name: /Save Record/i }).click()

    // Verify condition is added to the list
    await expect(page.locator('text=Chronic Allergic Rhinitis')).toBeVisible()
  })

  test('supports updating smoking history with live pack-years calculation preview', async ({ page }) => {
    await page.goto(patientHealthRecordUrl)

    // Switch to Smoking tab
    await page.getByRole('button', { name: /Tobacco & Smoking/i }).click()

    // Open update dialog
    await page.getByRole('button', { name: /Update Tobacco History/i }).click()

    // Fill new smoking values
    await page.locator('#smk-cigs').fill('10')
    await page.locator('#smk-bidis').fill('10')
    await page.locator('#smk-years').fill('20')

    // Live preview check: (10 + 10) / 20 * 20 = 20 Pack-Years
    await expect(page.locator('text=Live Pack-Years: 20 Pack-Years')).toBeVisible()

    await page.getByRole('button', { name: /Save Record/i }).click()

    // Verify updated pack years on screen
    await expect(page.locator('text=20 Pack-Years').first()).toBeVisible()
  })

  test('records clinician review decision with mandatory clinical rationale', async ({ page }) => {
    await page.goto(patientHealthRecordUrl)

    // Open clinician review dialog
    await page.getByRole('button', { name: /Perform Clinical Review/i }).click()

    // Fill clinical rationale
    await page
      .locator('#rev-rationale')
      .fill('Reviewed longitudinal pulmonary data. Exertional breathlessness verified; spirometry referral issued.')

    // Submit review
    await page.getByRole('button', { name: /Submit Review/i }).click()

    // Switch to reviews ledger tab
    await page.getByRole('button', { name: /Clinician Ledger/i }).click()
    await expect(
      page.locator('text=Reviewed longitudinal pulmonary data. Exertional breathlessness verified')
    ).toBeVisible()
  })

  test('supports bilingual view in Bangla and English', async ({ page }) => {
    await page.goto(patientHealthRecordUrl)

    // Toggle language to Bangla using LanguageSwitcher
    const switcher = page.locator('button[aria-label="Select language"]').first()
    await switcher.click()
    const banglaOption = page.locator('li[role="option"]:has-text("বাংলা")')
    await banglaOption.click()

    // Check localized titles and badges
    await expect(page.getByRole('heading', { name: 'রোগীর স্বাস্থ্য তথ্য ও ক্লিনিক্যাল প্রোফাইল' })).toBeVisible()
    await expect(page.locator('text=প্যাক-বছর').first()).toBeVisible()
    await expect(page.locator('text=রক্তচাপ').first()).toBeVisible()
    await expect(page.locator('text=চিকিৎসক কর্তৃক যাচাইকৃত').first()).toBeVisible()

    // Switch back to English
    const switcherBack = page.locator('button[aria-label="Select language"]').first()
    await switcherBack.click()
    const englishOption = page.locator('li[role="option"]:has-text("English")')
    await englishOption.click()
    await expect(page.locator('text=Patient Health Record & Clinical Profile')).toBeVisible()
  })
})
