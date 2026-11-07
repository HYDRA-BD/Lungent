import { test, expect } from '@playwright/test'

test.describe('Phase 1.11 Clinical Decision Support & Clinician Workspace', () => {
  test.describe.configure({ mode: 'serial' })
  const PATIENT_UUID = '11111111-1111-4111-a111-111111111111'

  test('renders clinical dashboard with metrics, critical red-flag alert banner, and review queues', async ({
    page,
  }) => {
    await page.goto('/clinical')

    // Verify workspace title and clinician role
    await expect(page.getByText('Clinical Workspace').first()).toBeVisible()
    await expect(page.getByText('Senior Consultant Pulmonologist').first()).toBeVisible()

    // Verify key clinical metrics
    await expect(page.getByText('Patients Under Care').first()).toBeVisible()
    await expect(page.getByText('Critical Red Flags').first()).toBeVisible()
    await expect(page.getByText('Pending Reviews').first()).toBeVisible()
    await expect(page.getByText('Follow-ups Due').first()).toBeVisible()

    // Verify critical alert banner is visible
    await expect(
      page.getByText('Critical Clinical Alerts Requiring Urgent Attention').first()
    ).toBeVisible()

    // Verify pending assessments queue
    await expect(page.getByText('Pending Assessment Reviews').first()).toBeVisible()
    await expect(page.getByText('Md. Rafiqul Islam').first()).toBeVisible()

    // Verify recent clinical activity stream
    await expect(page.getByText('Recent Clinical Activity Stream').first()).toBeVisible()
  })

  test('searches and filters patients in Clinical Patient Directory', async ({ page }) => {
    await page.goto('/clinical/patients')

    // Page title and search input
    await expect(page.getByText('Clinical Patient Directory').first()).toBeVisible()
    const searchInput = page.getByPlaceholder('Search by Lungent Patient ID, name, or phone...')
    await expect(searchInput).toBeVisible()

    // Search for benchmark patient "Rafiqul"
    await searchInput.fill('Rafiqul')
    await page.getByRole('button', { name: 'Filter' }).click()

    await expect(page.getByText('Md. Rafiqul Islam').first()).toBeVisible()
    await expect(page.getByText('LGT-2026-8K2M7P').first()).toBeVisible()

    // Verify alert badge indicates critical red-flag
    await expect(page.getByText(/CRITICAL/i).first()).toBeVisible()

    // Verify Action links
    await expect(page.getByRole('link', { name: /Clinical Profile/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Review Info/i }).first()).toBeVisible()
  })

  test('renders 5-part Consolidated Clinical Profile with Hemoptysis alert and pack-years calculation', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Verify patient header details
    await expect(page.getByRole('heading', { name: 'Md. Rafiqul Islam' })).toBeVisible()
    await expect(page.getByText('LGT-2026-8K2M7P').first()).toBeVisible()

    // Verify prominent Hemoptysis Red-Flag Warning
    await expect(page.getByText(/CRITICAL SAFETY ALERT.*Hemoptysis/i)).toBeVisible()

    // Tab C: Lung Health & Exposures (default active)
    await expect(page.getByText('Tobacco & Smoking History')).toBeVisible()
    await expect(page.getByText('Calculated Pack-Years')).toBeVisible()
    await expect(page.getByText(/pack-years/i).first()).toBeVisible()
    await expect(page.getByText('Respiratory Symptoms & Red Flags')).toBeVisible()

    // Click Tab A: Patient Identity
    await page.getByRole('button', { name: /A. Patient Identity/i }).click()
    await expect(page.getByText('Dhaka Central Pulmonary Institute').first()).toBeVisible()
    await expect(page.getByText('Prof. Dr. Farhana Ahmed').first()).toBeVisible()

    // Click Tab B: Medical History
    await page.getByRole('button', { name: /B. Medical History/i }).click()
    await expect(page.getByText('Medical Conditions & Diagnoses')).toBeVisible()

    // Click Tab D: Assessment History
    await page.getByRole('button', { name: /D. Assessment History/i }).click()
    await expect(page.getByText('Assessment History').first()).toBeVisible()

    // Click Tab E: Clinical History & Decisions
    await page.getByRole('button', { name: /E. Clinical History/i }).click()
    await expect(page.getByText('Documented Clinical Decisions')).toBeVisible()
    await expect(page.getByText('Prior Clinical Reviews')).toBeVisible()
  })

  test('opens and documents clinical decision with governance disclaimer and disagreement validation', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Click Document Decision button in patient header
    const docDecisionBtn = page.getByRole('button', { name: 'Document Decision', exact: true }).first()
    await docDecisionBtn.click()

    // Verify Modal appears with title
    const modal = page.locator('div.fixed.inset-0')
    await expect(modal.getByText('Document Clinical Decision')).toBeVisible()

    // Verify Non-Diagnostic Disclaimer is prominent
    await expect(
      modal.getByText(/Automated outputs are purely decision-support aids/i)
    ).toBeVisible()

    // Select decision category
    const select = modal.locator('select')
    await select.selectOption('urgent_specialist_referral')

    // Fill rationale
    const rationale = modal.getByPlaceholder(/evidence-based clinical reasoning/i)
    await rationale.fill('High risk heavy smoker presenting with 3 weeks hemoptysis requiring urgent diagnostic workup.')

    // Toggle disagreement checkbox
    const disagreementToggle = modal.getByRole('checkbox', {
      name: /Clinical Decision Diverges from Algorithmic Output/i,
    })
    await disagreementToggle.check()

    // Verify disagreement justification textarea appears
    const disagreementReason = modal.getByPlaceholder(/clinical grounds for overriding/i)
    await expect(disagreementReason).toBeVisible()
    await disagreementReason.fill('Overriding automated tier to urgent due to persistent daily blood in sputum.')

    // Fill recommended next steps
    const nextSteps = modal.getByPlaceholder(/1\. Diagnostic imaging/i)
    await nextSteps.fill('1. Stat contrast chest CT\n2. Flexible bronchoscopy\n3. Pulmonology admission.')

    // Fill referral target
    const referral = modal.getByPlaceholder(/Department of Thoracic Surgery/i)
    await referral.fill('National Institute of Diseases of the Chest and Hospital (NIDCH)')

    // Submit clinical decision
    await modal.getByRole('button', { name: 'Finalize Clinical Decision' }).click()

    // Modal should close upon successful submission
    await expect(modal).not.toBeVisible({ timeout: 5000 })
  })

  test('performs Clinical Information Review workflow for patient', async ({ page }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}/review`)

    // Verify header and patient banner
    await expect(page.getByText('Clinical Information Review').first()).toBeVisible()
    await expect(page.getByText('Md. Rafiqul Islam').first()).toBeVisible()

    // Fill Missing Information Notes
    await page
      .getByPlaceholder('Document any missing clinical information required for definitive assessment...')
      .fill('Awaiting high-resolution thoracic CT scan imaging disk.')

    // Fill Verified Information Notes
    await page
      .getByPlaceholder('Note specific factors verified during clinician consultation...')
      .fill('Patient confirmed smoking 35 pack-years and shipyard welding exposure.')

    // Fill Summary
    await page
      .getByPlaceholder('Provide overarching summary of the patient assessment review...')
      .fill('Comprehensive clinical intake review conducted. High risk confirmed with hemoptysis escalation.')

    // Save Clinical Review
    await page.getByRole('button', { name: 'Save Clinical Review', exact: true }).click()

    // Should navigate back to patient profile
    await page.waitForURL(`**/clinical/patients/${PATIENT_UUID}**`, { timeout: 8000 })
    await expect(page.getByRole('heading', { name: 'Md. Rafiqul Islam' })).toBeVisible()
  })

  test('displays Assessment Reviews interface with governance disclaimer', async ({ page }) => {
    await page.goto('/clinical/assessments')

    // Page title and mandatory notice
    await expect(page.getByText('Assessment Review Interface').first()).toBeVisible()
    await expect(page.getByText(/Algorithmic assessment scores are probabilistic indicators/i)).toBeVisible()

    // Filter dropdown exists with 3 categories
    const categorySelect = page.locator('select')
    await expect(categorySelect).toBeVisible()
    await expect(categorySelect.locator('option[value="lung_cancer_risk"]')).toHaveCount(1)
    await expect(categorySelect.locator('option[value="screening_eligibility"]')).toHaveCount(1)
    await expect(categorySelect.locator('option[value="symptom_triage"]')).toHaveCount(1)

    // Table rows display automated output and review buttons
    await expect(page.getByText('Md. Rafiqul Islam').first()).toBeVisible()
    await expect(page.getByText('Elevated Clinical Risk Tier (High)').first()).toBeVisible()
  })

  test('manages Clinical Alerts with safety rule non-suppression and acknowledgment dialog', async ({
    page,
  }) => {
    await page.goto('/clinical/alerts')

    // Page title and mandatory non-suppression rule banner
    await expect(page.getByText('Clinical Alerts & Red Flags').first()).toBeVisible()
    await expect(page.getByText(/Low-risk automated assessment outputs MUST NEVER suppress red-flag alerts!/i)).toBeVisible()

    // Verify active alert cards
    await expect(page.getByText(/Red-Flag Symptom: Hemoptysis/i).first()).toBeVisible()
    await expect(page.getByText('CRITICAL').first()).toBeVisible()

    // Click Acknowledge / Resolve button
    const ackBtn = page.getByRole('button', { name: /Acknowledge Alert|Resolve Alert/i }).first()
    await ackBtn.click()

    // Verify modal appears
    const modal = page.locator('div.fixed.inset-0')
    await expect(modal.getByText('Acknowledge / Resolve Clinical Alert')).toBeVisible()

    // Enter clinician resolution notes
    const notesInput = modal.getByPlaceholder(/Document action taken/i)
    await notesInput.fill('Reviewed in clinic. Patient scheduled for diagnostic thoracic workup.')

    // Confirm acknowledgment
    await modal.getByRole('button', { name: /Confirm Clinical Action|Acknowledge Alert|Resolve Alert/i }).click()
    await expect(modal).not.toBeVisible({ timeout: 5000 })
  })

  test('manages Clinical Follow-Up planning and updates status', async ({ page }) => {
    await page.goto('/clinical/follow-ups')

    // Title and schedule button
    await expect(page.getByText('Clinical Follow-Up Planning').first()).toBeVisible()
    const scheduleBtn = page.getByRole('button', { name: 'Schedule Follow-Up' })
    await expect(scheduleBtn).toBeVisible()

    // Click Schedule Follow-Up
    await scheduleBtn.click()

    // Verify modal
    const modal = page.locator('div.fixed.inset-0')
    await expect(modal.getByText('Schedule Patient Follow-Up Plan')).toBeVisible()

    // Fill instructions
    await modal
      .getByPlaceholder('Detailed instructions for the next clinical contact or imaging review...')
      .fill('Post-imaging follow-up to evaluate low-dose CT results and smoking cessation.')

    // Save plan
    await modal.getByRole('button', { name: 'Save Follow-Up Plan' }).click()
    await expect(modal).not.toBeVisible({ timeout: 5000 })

    // Verify table updated
    await expect(page.getByText('Post-imaging follow-up').first()).toBeVisible()
  })

  test('displays Clinical Activity Audit Stream', async ({ page }) => {
    await page.goto('/clinical/activity')

    // Title and audit entries
    await expect(page.getByText('Clinical Audit & Activity Stream').first()).toBeVisible()
    await expect(page.getByText('Prof. Dr. Farhana Ahmed').first()).toBeVisible()
    await expect(page.getByText(/Finalized clinical decision|Initiated clinical evaluation|follow-up/i).first()).toBeVisible()
  })

  test('supports bilingual localization (English <-> Bangla)', async ({ page }) => {
    await page.goto('/clinical')

    // Find language switcher by aria-label
    const langBtn = page.getByRole('button', { name: 'Select language' })
    if (await langBtn.isVisible()) {
      await langBtn.click()
      const bnOption = page.getByRole('option', { name: /বাংলা/i })
      if (await bnOption.isVisible()) {
        await bnOption.click()
      }

      // Verify Bengali workspace translations
      await expect(page.getByText('ক্লিনিক্যাল ওয়ার্কস্পেস').first()).toBeVisible()
      await expect(page.getByText('অধীনস্থ রোগী').first()).toBeVisible()
      await expect(page.getByText('জরুরি রেড ফ্ল্যাগ').first()).toBeVisible()
    }
  })
})

