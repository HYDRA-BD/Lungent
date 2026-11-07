import { test, expect } from '@playwright/test'

test.describe('Phase 1.13 Lung Cancer Screening Eligibility Engine & Clinical Guidelines Registry', () => {
  const PATIENT_UUID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam

  test('1. Clinical Assessments page displays Screening Eligibility execution trigger', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Verify Clinical Governance notice banner is visible
    await expect(page.getByText('Clinical Governance Notice').first()).toBeVisible()
    await expect(page.getByText('Assessment Review Interface').first()).toBeVisible()

    // Verify Evaluate Screening button
    const screenBtn = page.getByRole('button', { name: /Evaluate Screening|স্ক্রীনিং যোগ্যতা যাচাই/i }).first()
    await expect(screenBtn).toBeVisible()
  })

  test('2. Clinical Production mode enforces Clinical Governance pause on unapproved guidelines', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Open screening evaluation dialog
    const screenBtn = page.getByRole('button', { name: /Evaluate Screening|স্ক্রীনিং যোগ্যতা যাচাই/i }).first()
    await screenBtn.click()

    // Verify modal content
    await expect(page.getByText('Lung Cancer Screening Eligibility Engine').first()).toBeVisible()
    await expect(page.getByText('Clinical Production Mode').first()).toBeVisible()
    await expect(page.getByText('USPSTF-2021').first()).toBeVisible()

    // Verify governance warning displayed before execution
    await expect(
      page.getByText(/Notice:.*not approved for routine clinical deployment in Bangladesh/i).first()
    ).toBeVisible()

    // Click confirm execution
    const confirmBtn = page.getByRole('button', { name: /Execute Screening Evaluation|স্ক্রীনিং মূল্যায়ন/i })
    await confirmBtn.click()

    // Verify clinical safety gate result: evaluation is paused, NOT fabricated into an imaging order
    await expect(page.getByText('Clinical Governance Safety Notice').first()).toBeVisible()
    await expect(page.getByText('Screening Evaluation Paused by Governance').first()).toBeVisible()
    await expect(
      page.getByText(/Refusal Code: GUIDELINE_NOT_APPROVED_FOR_BANGLADESH/i).first()
    ).toBeVisible()
  })

  test('3. Research Simulation mode produces empirical criteria evaluation, annual LDCT recommendation, and non-diagnostic disclaimers', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Open screening evaluation dialog
    const screenBtn = page.getByRole('button', { name: /Evaluate Screening|স্ক্রীনিং যোগ্যতা যাচাই/i }).first()
    await screenBtn.click()

    // Switch to Research Simulation mode
    const researchBtn = page.getByRole('button', { name: /Research Simulation Mode/i }).first()
    await researchBtn.click()

    // Select USPSTF-2021 guideline
    await page.getByText('USPSTF-2021').first().click()

    // Execute
    const confirmBtn = page.getByRole('button', { name: /Execute Screening Evaluation|স্ক্রীনিং মূল্যায়ন/i })
    await confirmBtn.click()

    // Verify research simulation alert watermark
    await expect(page.getByText('Research Simulation Execution').first()).toBeVisible()
    await expect(
      page.getByText(/Research & Validation Simulation/i).first()
    ).toBeVisible()

    // Verify eligibility outcome and recommendation
    await expect(page.getByText(/Eligible for Annual LDCT Screening|Criteria Met/i).first()).toBeVisible()
    await expect(page.getByText(/12 Month Surveillance Interval|Low-Dose CT/i).first()).toBeVisible()

    // Verify criterion-by-criterion breakdown table
    await expect(page.getByText('Criterion-Level Guideline Breakdown').first()).toBeVisible()
    await expect(page.getByText(/Age Criterion/i).first()).toBeVisible()
    await expect(page.getByText(/Tobacco Exposure Criterion/i).first()).toBeVisible()

    // Verify mandatory non-diagnostic disclaimers
    await expect(page.getByText('What This Determination Means').first()).toBeVisible()
    await expect(page.getByText('What This Determination Does NOT Mean').first()).toBeVisible()
    await expect(
      page.getByText(/Screening eligibility is NOT a diagnosis of lung cancer/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/Ineligibility for routine screening does NOT mean/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/Screening applies solely to asymptomatic persons/i).first()
    ).toBeVisible()

    // Verify tamper-evident cryptographic input snapshot
    await expect(page.getByText('Tamper-Evident Input Snapshot').first()).toBeVisible()
    await expect(page.getByText(/SHA-256:/i).first()).toBeVisible()
    await expect(page.getByText('Cumulative Pack-Years').first()).toBeVisible()
  })

  test('4. Patient clinical file Tab D integrates Screening Evaluation Dialog', async ({ page }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Click Tab D: Assessments
    const assessmentsTab = page.getByRole('button', { name: /Assessment History|অ্যাসেসমেন্ট/i })
    await assessmentsTab.click()

    // Verify Tab D header contains ScreeningEvaluationDialog button
    const screenBtn = page.getByRole('button', { name: /Evaluate Screening|স্ক্রীনিং যোগ্যতা যাচাই/i }).first()
    await expect(screenBtn).toBeVisible()
  })

  test('5. Healthcare Worker Workspace assessments includes Screening Evaluation', async ({ page }) => {
    await page.goto('/healthcare-worker/assessments')

    // Verify Screening Evaluation button in actions header
    const screenBtn = page.getByRole('button', { name: /Evaluate Screening|স্ক্রীনিং যোগ্যতা যাচাই/i }).first()
    await expect(screenBtn).toBeVisible()
  })

  test('6. Patient Portal screening page showcases guideline library and eligibility evaluation', async ({
    page,
  }) => {
    await page.goto('/patient/screening')

    // Verify Screening page title and subtitle
    await expect(
      page.getByText(/Lung Cancer Screening & Guidance|ফুসফুসের ক্যান্সার স্ক্রীনিং/i).first()
    ).toBeVisible()

    // Verify clinical guidelines section
    await expect(page.getByText(/Key Qualification Factors|যোগ্যতার প্রধান উপাদানসমূহ/i).first()).toBeVisible()

    // Verify Screening Evaluation button
    const screenBtn = page.getByRole('button', { name: /Evaluate Screening Eligibility|স্ক্রীনিং যোগ্যতা যাচাই/i }).first()
    await expect(screenBtn).toBeVisible()
  })
})

