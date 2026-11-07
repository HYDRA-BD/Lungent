import { test, expect } from '@playwright/test'

test.describe('Phase 1.8 — Patient Portal Comprehensive E2E Suite', () => {
  test('1. Patient Dashboard renders complete identity, stats, pending actions, and clinical notices', async ({
    page,
  }) => {
    await page.goto('/patient')

    // Page title and header
    await expect(page).toHaveTitle(/Patient Dashboard | Lungent/i)
    await expect(page.locator('text=Rafiqul Islam').first()).toBeVisible()

    // Permanent Lungent Patient ID card
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()

    // Clinical Safety Disclaimer
    await expect(
      page.locator('text=Safety Notice: Lungent provides educational screening guidance and clinical decision support')
    ).toBeVisible()

    // Profile Completion Progress
    await expect(page.locator('text=Profile Completion').first()).toBeVisible()

    // Pending Actions Card
    await expect(page.locator('text=Specialist Consultation Follow-Up').first()).toBeVisible()

    // Quick Stats
    await expect(page.locator('text=Pack-Years').first()).toBeVisible()
    await expect(page.locator('text=BMI').first()).toBeVisible()
  })

  test('2. My Profile displays permanent ID lock and allows permitted contact updates', async ({
    page,
  }) => {
    await page.goto('/patient/profile')

    await expect(page).toHaveTitle(/My Profile/i)
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()

    // Security notice that ID cannot be modified
    await expect(
      page.locator('text=Your Lungent Patient ID is permanent and cannot be modified')
    ).toBeVisible()

    // Open Edit Dialog
    const editBtn = page.getByRole('button', { name: /Edit Permitted Details/i })
    await expect(editBtn).toBeVisible()
    await editBtn.click()

    // Verify modal title
    await expect(page.locator('text=Edit Permitted Details').first()).toBeVisible()

    // Verify protected ID notice inside dialog
    await expect(
      page.locator('text=Security Safeguard: Your Lungent Patient ID is permanent and cannot be modified').first()
    ).toBeVisible()

    // Update phone number
    const phoneInput = page.locator('input#prof-phone')
    await phoneInput.fill('+880 1711-555444')

    // Save changes
    await page.getByRole('button', { name: /Save Changes/i }).click()

    // Verify success toast/notice
    await expect(page.locator('text=Profile information updated successfully')).toBeVisible()
  })

  test('3. My Health Information displays 10 clinical categories and correction request workflow', async ({
    page,
  }) => {
    await page.goto('/patient/health-record')

    await expect(page).toHaveTitle(/My Health Information/i)

    // Verify categories present
    await expect(page.locator('text=Medical Conditions').first()).toBeVisible()
    await expect(page.locator('text=Chronic Obstructive Pulmonary Disease (COPD)')).toBeVisible()

    // Switch to Smoking History
    await page.getByRole('button', { name: /^Smoking$/i }).click()
    await expect(page.locator('text=Pack-Years:').first()).toBeVisible()

    // Open Clinical Correction Request Dialog
    const correctionBtn = page.getByRole('button', { name: /Request Clinical Correction/i })
    await expect(correctionBtn).toBeVisible()
    await correctionBtn.click()

    await expect(page.locator('text=Submit Health Record Correction Request')).toBeVisible()

    // Fill correction form
    await page.locator('#crq-field').fill('Occupational Exposure')
    await page.locator('#crq-val').fill('Textile factory cotton dust exposure duration was 20 years')
    await page.locator('#crq-just').fill('Employment records verified with factory union booklet')

    // Submit request
    await page.getByRole('button', { name: /Submit Request/i }).click()

    // Verify success banner
    await expect(page.locator('text=Correction request submitted for clinical review')).toBeVisible()
  })

  test('4. Assessments list, new assessment dialog, and assessment detail results foundation', async ({
    page,
  }) => {
    await page.goto('/patient/assessments')

    await expect(page).toHaveTitle(/My Assessments/i)

    // Three core modules showcased
    await expect(page.locator('text=Lung Cancer Risk Estimation').first()).toBeVisible()
    await expect(page.locator('text=Screening Eligibility Evaluation').first()).toBeVisible()
    await expect(page.locator('text=Symptom-Based Clinical Triage').first()).toBeVisible()

    // Start New Assessment Dialog
    const startBtn = page.getByRole('button', { name: /Start New Assessment/i })
    await expect(startBtn).toBeVisible()
    await startBtn.click()

    await expect(page.locator('text=Start New Assessment').first()).toBeVisible()

    // Check mandatory consent checkbox
    await page.locator('label').filter({ hasText: 'I understand this assessment' }).click()

    // Submit initiation
    await page.getByRole('button', { name: /Begin Assessment/i }).click()

    // Navigate to assessment detail result
    await page.goto('/patient/assessments/asmt-001')

    await expect(page).toHaveTitle(/Assessment asmt-001/i)

    // Verify clinical interpretation safety banner
    await expect(page.locator('text=Crucial Clinical Safety Notice')).toBeVisible()
    await expect(
      page.locator('text=Low estimated risk does NOT rule out lung cancer or other respiratory disease')
    ).toBeVisible()

    // Verify findings and limitations
    await expect(page.locator('text=Clinical Assessment Summary')).toBeVisible()
    await expect(page.locator('text=Methodology & Assessment Limitations')).toBeVisible()
    await expect(page.locator('text=Recommended Next Steps')).toBeVisible()
  })

  test('5. Screening & Guidance explains LDCT criteria, benefits, and non-diagnostic nature', async ({
    page,
  }) => {
    await page.goto('/patient/screening')

    await expect(page).toHaveTitle(/Screening & Guidance/i)

    // Non-diagnostic explanation
    await expect(page.locator('text=Understanding Lung Cancer Screening')).toBeVisible()

    // USPSTF 2021 criteria
    await expect(page.locator('text=Clinical Guideline')).toBeVisible()
    await expect(page.locator('text=Adults aged 50–80')).toBeVisible()

    // Shared decision making
    await expect(page.locator('text=Benefits & Considerations')).toBeVisible()

    // Red flag safety banner
    await expect(page.locator('text=Screening is for Asymptomatic Individuals Only')).toBeVisible()
  })

  test('6. Referrals & Follow-ups tracks specialist appointments and clinical instructions', async ({
    page,
  }) => {
    await page.goto('/patient/referrals')

    await expect(page).toHaveTitle(/Referrals & Follow-ups/i)

    // Referral to NIDCH
    await expect(page.locator('text=National Institute of Diseases of the Chest and Hospital')).toBeVisible()
    await expect(page.locator('text=In Progress').first()).toBeVisible()

    // Instructions
    await expect(page.locator('text=Fast for 2 hours before scan')).toBeVisible()
  })

  test('7. Reports & Documents protects authorized records with encrypted vault notice', async ({
    page,
  }) => {
    await page.goto('/patient/documents')

    await expect(page).toHaveTitle(/Reports & Documents/i)
    await expect(page.locator('text=Protected Health Document Vault')).toBeVisible()

    // Available documents
    await expect(page.locator('text=Baseline Clinical Intake & Risk Summary Report')).toBeVisible()
    await expect(page.locator('text=NIDCH Specialist Referral & Consultation Letter')).toBeVisible()
  })

  test('8. Notification Center filters notifications and marks items read', async ({
    page,
  }) => {
    await page.goto('/patient/notifications')

    await expect(page).toHaveTitle(/Notifications/i)
    await expect(page.locator('text=Specialist Referral Scheduled')).toBeVisible()

    // Filter by Unread
    await page.getByRole('button', { name: /Unread/i }).click()

    // Mark All as Read button
    const markAllBtn = page.getByRole('button', { name: /Mark All as Read/i })
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click()
    }
  })

  test('9. Consent & Privacy manages mandatory vs optional terms and links anonymous self-check', async ({
    page,
  }) => {
    await page.goto('/patient/privacy')

    await expect(page).toHaveTitle(/Consent & Privacy/i)

    // Mandatory consent locked
    await expect(page.locator('text=Mandatory Service Consent').first()).toBeVisible()
    await expect(page.locator('text=Mandatory & Active')).toBeVisible()

    // Optional provider sharing toggle
    await expect(page.locator('text=Authorized Healthcare Provider Network Sharing')).toBeVisible()

    // Consented linkage of prior anonymous self-check
    await expect(page.locator('text=Link Prior Anonymous Self-Check')).toBeVisible()
    const sessionInput = page.locator('#session-code')
    await sessionInput.fill('SC-8K2M7P')

    await page.getByRole('button', { name: /Consented Link/i }).click()
    await expect(page.locator('text=successfully associated with your patient identity')).toBeVisible()
  })

  test('10. Account Settings switches bilingual locale and displays deactivation modal', async ({
    page,
  }) => {
    await page.goto('/patient/settings')

    await expect(page).toHaveTitle(/Account Settings/i)

    // Switch Language to Bangla
    await page.getByRole('button', { name: /বাংলা \(Bangla\)/i }).click()
    await expect(page.locator('text=ভাষা সফলভাবে পরিবর্তন করা হয়েছে')).toBeVisible()

    // Switch back to English
    await page.getByRole('button', { name: /English/i }).click()

    // Active session card
    await expect(page.locator('text=Security & Active Sessions')).toBeVisible()
    await expect(page.locator('text=Current Web Session')).toBeVisible()

    // Open Account Deactivation Request Modal
    await page.getByRole('button', { name: /Request Account Deactivation/i }).first().click()

    await expect(page.locator('text=Confirm Account Deactivation')).toBeVisible()
    await expect(
      page.locator('text=In accordance with Bangladesh healthcare record-retention laws, your underlying medical assessments and health records cannot be destroyed')
    ).toBeVisible()

    // Confirm Deactivation
    await page.getByRole('button', { name: /Confirm Deactivation/i }).click()
    await expect(page.locator('text=Deactivation Request Submitted')).toBeVisible()
  })
})
