import { test, expect } from '@playwright/test'

test.describe('Phase 1.14 Symptom-Based Clinical Triage Engine & Protocol Registry', () => {
  const PATIENT_UUID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam

  test('1. Clinical Assessments page displays Symptom Triage execution trigger', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Verify Clinical Governance notice banner
    await expect(page.getByText('Clinical Governance Notice').first()).toBeVisible()
    await expect(page.getByText('Assessment Review Interface').first()).toBeVisible()

    // Verify Evaluate Symptom Triage button
    const triageBtn = page.getByRole('button', { name: /Evaluate Symptom Triage|লক্ষণভিত্তিক ট্রায়াজ/i }).first()
    await expect(triageBtn).toBeVisible()
  })

  test('2. Clinical Production mode enforces Clinical Governance pause on unapproved protocols', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Open triage evaluation dialog
    const triageBtn = page.getByRole('button', { name: /Evaluate Symptom Triage|লক্ষণভিত্তিক ট্রায়াজ/i }).first()
    await triageBtn.click()

    // Verify modal content
    await expect(page.getByText('Symptom-Based Clinical Triage Engine').first()).toBeVisible()
    await expect(page.getByText('Clinical Production Mode').first()).toBeVisible()
    await expect(page.getByText('NICE-NG12-2023').first()).toBeVisible()

    // Verify governance warning displayed before execution
    await expect(
      page.getByText(/Notice:.*not approved for routine clinical deployment in Bangladesh/i).first()
    ).toBeVisible()

    // Navigate to Review step
    await page.getByRole('button', { name: /Next Step/i }).click()
    await page.getByRole('button', { name: /Review Summary/i }).click()

    // Click confirm execution
    const confirmBtn = page.getByRole('button', { name: /Execute Symptom Triage|ট্রায়াজ মূল্যায়ন সম্পাদন করুন/i })
    await confirmBtn.click()

    // Verify clinical safety gate result: triage is paused, NOT fabricated into an unapproved clinical order
    await expect(page.getByText(/Clinical Governance Safety Notice: Triage Determination Paused/i).first()).toBeVisible()
    await expect(page.getByText(/Triage Paused by Clinical Governance/i).first()).toBeVisible()
    await expect(
      page.getByText(/Refusal Code: PROTOCOL_NOT_APPROVED_FOR_BANGLADESH/i).first()
    ).toBeVisible()
  })

  test('3. Research Simulation mode produces empirical criteria evaluation, urgent 2-week tier, and non-diagnostic disclaimers', async ({
    page,
  }) => {
    await page.goto('/clinical/assessments')

    // Open triage evaluation dialog
    const triageBtn = page.getByRole('button', { name: /Evaluate Symptom Triage|লক্ষণভিত্তিক ট্রায়াজ/i }).first()
    await triageBtn.click()

    // Switch to Research Simulation mode
    const researchBtn = page.getByRole('button', { name: /Research Simulation Mode/i }).first()
    await researchBtn.click()

    // Select NICE-NG12-2023 protocol
    await page.getByText('NICE-NG12-2023').first().click()

    // Fill Step 1: Hemoptysis = Yes (Present), Cough = Yes (Duration 4 weeks)
    await page.getByRole('button', { name: /Yes \(Present\)|হ্যাঁ \(উপস্থিত\)/i }).first().click()
    await page.getByRole('button', { name: /Next Step/i }).click()

    // Step 2: Constitutional Symptoms: Weight Loss = Yes
    await page.getByRole('button', { name: /Yes|হ্যাঁ/i }).first().click()
    await page.getByRole('button', { name: /Review Summary/i }).click()

    // Step 3: Execute
    const confirmBtn = page.getByRole('button', { name: /Execute Symptom Triage|ট্রায়াজ মূল্যায়ন সম্পাদন করুন/i })
    await confirmBtn.click()

    // Verify research simulation alert watermark
    await expect(page.getByText('Research Simulation Execution').first()).toBeVisible()

    // Verify Urgent 2-Week Tier outcome and recommended pathway
    await expect(page.getByText(/Urgent Diagnostic Assessment \(≤14 Days\)/i).first()).toBeVisible()
    await expect(page.getByText('Recommended Escalation Pathway').first()).toBeVisible()
    await expect(page.getByText(/Urgent 2-Week Diagnostic Assessment/i).first()).toBeVisible()

    // Verify criterion-by-criterion breakdown table
    await expect(page.getByText('Criterion-Level Protocol Breakdown').first()).toBeVisible()
    await expect(page.getByText(/Unexplained Hemoptysis in Adults/i).first()).toBeVisible()
    await expect(page.getByText('RED FLAG').first()).toBeVisible()

    // Verify mandatory non-diagnostic disclaimers
    await expect(page.getByText('What This Determination Means').first()).toBeVisible()
    await expect(page.getByText('What This Determination Does NOT Mean').first()).toBeVisible()
    await expect(
      page.getByText(/Symptom-based triage is NOT a diagnosis of lung cancer/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/does NOT guarantee that serious pulmonary pathology is absent/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/active symptoms take absolute precedence over screening criteria/i).first()
    ).toBeVisible()

    // Verify tamper-evident cryptographic input snapshot
    await expect(page.getByText('Tamper-Evident Input Snapshot').first()).toBeVisible()
    await expect(page.getByText(/SHA-256:/i).first()).toBeVisible()
  })

  test('4. Patient clinical file Tab D integrates Symptom Triage Evaluation Dialog', async ({ page }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Click Tab D: Assessments
    const assessmentsTab = page.getByRole('button', { name: /Assessment History|অ্যাসেসমেন্ট/i })
    await assessmentsTab.click()

    // Verify Tab D header contains Symptom Triage Evaluation button
    const triageBtn = page.getByRole('button', { name: /Evaluate Symptom Triage|লক্ষণভিত্তিক ট্রায়াজ/i }).first()
    await expect(triageBtn).toBeVisible()
  })

  test('5. Healthcare Worker Workspace assessments includes Symptom Triage Evaluation', async ({ page }) => {
    await page.goto('/healthcare-worker/assessments')

    // Verify Symptom Triage Evaluation button in actions header
    const triageBtn = page.getByRole('button', { name: /Evaluate Symptom Triage|লক্ষণভিত্তিক ট্রায়াজ/i }).first()
    await expect(triageBtn).toBeVisible()
  })

  test('6. Patient Portal assessments showcases symptom triage module', async ({ page }) => {
    await page.goto('/patient/assessments')

    // Verify Symptom Triage Module Card
    await expect(page.getByText(/Symptom-Based Clinical Triage|লক্ষণভিত্তিক ট্রায়াজ/i).first()).toBeVisible()

    // Verify Start Symptom Check button
    const triageBtn = page.getByRole('button', { name: /Start Symptom Check|লক্ষণভিত্তিক ট্রায়াজ শুরু করুন/i }).first()
    await expect(triageBtn).toBeVisible()
  })
})
