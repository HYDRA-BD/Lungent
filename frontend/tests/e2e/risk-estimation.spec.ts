import { test, expect } from '@playwright/test'

test.describe('Phase 1.12 Lung Cancer Risk Estimation Engine & Clinical Governance', () => {
  const PATIENT_UUID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam

  test('1. Clinical Assessments page displays governance notice and risk execution trigger', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Verify Clinical Governance notice banner
    await expect(page.getByText('Clinical Governance Notice').first()).toBeVisible()
    await expect(page.getByText('Assessment Review Interface').first()).toBeVisible()

    // Verify Run Risk Estimation button
    const runBtn = page.getByRole('button', { name: /Run Risk Estimation|ঝুঁকি পরিমাপ চালান/i }).first()
    await expect(runBtn).toBeVisible()
  })

  test('2. Clinical Production mode enforces Clinical Governance pause on unapproved models', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Open execution dialog
    const runBtn = page.getByRole('button', { name: /Run Risk Estimation|ঝুঁকি পরিমাপ চালান/i }).first()
    await runBtn.click()

    // Verify modal content
    await expect(page.getByText('Lung Cancer Risk Estimation Engine').first()).toBeVisible()
    await expect(page.getByText('Clinical Production Mode').first()).toBeVisible()
    await expect(page.getByText('PLCOm2012').first()).toBeVisible()

    // Verify governance warning displayed before execution
    await expect(
      page.getByText(/Notice:.*not approved for routine clinical deployment in Bangladesh/i).first()
    ).toBeVisible()

    // Click confirm execution
    const confirmBtn = page.getByRole('button', { name: /Execute Assessment|অ্যাসেসমেন্ট সম্পাদন করুন/i })
    await confirmBtn.click()

    // Verify clinical safety gate result: score is paused, NOT fabricated
    await expect(page.getByText('Clinical Governance Safety Notice').first()).toBeVisible()
    await expect(page.getByText('Calculation Paused by Clinical Governance').first()).toBeVisible()
    await expect(
      page.getByText(/Refusal Code: METHODOLOGY_NOT_APPROVED_FOR_BANGLADESH/i).first()
    ).toBeVisible()
  })

  test('3. Research Simulation mode produces empirical calculation with watermark and transparent explainability', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Open execution dialog
    const runBtn = page.getByRole('button', { name: /Run Risk Estimation|ঝুঁকি পরিমাপ চালান/i }).first()
    await runBtn.click()

    // Switch to Research Simulation mode
    const researchBtn = page.getByRole('button', { name: /Research Simulation Mode/i }).first()
    await researchBtn.click()

    // Select PLCOm2012 methodology
    await page.getByText('PLCOm2012').first().click()

    // Execute
    const confirmBtn = page.getByRole('button', { name: /Execute Assessment|অ্যাসেসমেন্ট সম্পাদন করুন/i })
    await confirmBtn.click()

    // Verify research simulation alert watermark
    await expect(page.getByText('Research Simulation Execution').first()).toBeVisible()
    await expect(
      page.getByText(/Calculations performed under research simulation mode are strictly investigational/i).first()
    ).toBeVisible()

    // Verify empirical percentage and confidence interval
    await expect(page.getByText('Estimated 6-Year Risk').first()).toBeVisible()
    await expect(page.getByText('95% Confidence Interval').first()).toBeVisible()
    await expect(page.getByText('Contributing Risk Factors').first()).toBeVisible()

    // Verify mandatory non-diagnostic disclaimers
    await expect(page.getByText('What This Result Means').first()).toBeVisible()
    await expect(page.getByText('What This Result Does NOT Mean').first()).toBeVisible()
    await expect(
      page.getByText('This is NOT a diagnosis of lung cancer. It is an algorithmic estimation based on epidemiological populations.').first()
    ).toBeVisible()
    await expect(
      page.getByText(/If respiratory symptoms develop.*clinical evaluation is mandatory/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/Eligibility for Low-Dose CT \(LDCT\) lung cancer screening is evaluated separately/i).first()
    ).toBeVisible()

    // Verify tamper-evident cryptographic input snapshot
    await expect(page.getByText('Tamper-Evident Input Snapshot').first()).toBeVisible()
    await expect(page.getByText(/SHA-256:/i).first()).toBeVisible()
    await expect(page.getByText('Calculated Pack-Years').first()).toBeVisible()
  })

  test('4. Patient clinical file Tab D integrates Risk Execution Dialog', async ({ page }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Click Tab D: Assessments
    const assessmentsTab = page.getByRole('button', { name: /Assessment History|অ্যাসেসমেন্ট/i })
    await assessmentsTab.click()

    // Verify Tab D header contains RiskExecutionDialog
    const runBtn = page.getByRole('button', { name: /Run Risk Estimation|ঝুঁকি পরিমাপ চালান/i }).first()
    await expect(runBtn).toBeVisible()
  })

  test('5. Healthcare Worker Workspace assessments includes Risk Estimation', async ({ page }) => {
    await page.goto('/healthcare-worker/assessments')

    // Verify Risk Estimation button in actions header
    const runBtn = page.getByRole('button', { name: /Run Risk Estimation|ঝুঁকি পরিমাপ চালান/i }).first()
    await expect(runBtn).toBeVisible()
  })

  test('6. Patient Portal assessments showcases lung cancer risk estimation with safety notices', async ({
    page,
  }) => {
    await page.goto('/patient/assessments')

    // Verify Lung Cancer Risk Module Card
    await expect(page.getByText(/Lung Cancer Risk Estimation|ঝুঁকি পরিমাপ/i).first()).toBeVisible()

    // Verify safety disclaimers
    await expect(
      page.getByText(/Clinical Interpretation Notice|Low estimated risk does not rule out/i).first()
    ).toBeVisible()
  })
})
