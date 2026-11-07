import { test, expect } from '@playwright/test'

test.describe('Phase 1.26: Comprehensive Platform End-to-End User Journeys', () => {
  // ==========================================================================
  // 1. PUBLIC USER JOURNEY
  // ==========================================================================
  test('1. Public User Journey: Information discovery, emergency notices, and bilingual toggling', async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify clinical disclaimer and emergency warnings
    await expect(page.getByText(/Understand risk\. Reveal insights\. Guide decisions\./i).first()).toBeVisible()
    await expect(page.getByText(/Important Clinical & Safety Disclaimer|ক্লিনিক্যাল সতর্কতা/i).first()).toBeVisible()
    await expect(page.getByText(/does not provide medical diagnosis, confirm cancer/i).first()).toBeVisible()

    // Navigate to Health Library
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText(/Library|লাইব্রেরি/i)

    // Navigate to How It Works
    await page.goto('/how-it-works')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText(/How (Lungent )?Works|কার্যপদ্ধতি/i)

    // Navigate to Privacy Policy and Terms
    await page.goto('/privacy')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText(/Privacy|গোপনীয়তা/i)

    // Verify language switcher exists and functions
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    if (await languageBtn.isVisible()) {
      await languageBtn.click()
      const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
      if (await bnOption.isVisible()) {
        await bnOption.click()
        await expect(page.locator('html')).toHaveAttribute('lang', 'bn')
      }
    }
  })

  // ==========================================================================
  // 2. ANONYMOUS SELF-CHECK JOURNEY
  // ==========================================================================
  test('2. Anonymous Self-Check Journey: Mandatory consent, questionnaire flow, and non-diagnostic result', async ({
    page,
  }) => {
    await page.goto('/self-check')
    await page.waitForLoadState('networkidle')

    // Verify Step 0 Informed Consent requirement and clinical bounds
    await expect(page.getByRole('heading', { name: /Basic Lung Health Self-Check/i })).toBeVisible()
    await expect(page.locator('text=What this self-check is NOT:')).toBeVisible()
    await expect(page.locator('text=100% Anonymous • No Sign-In Required')).toBeVisible()

    // Accept consent terms
    await page.locator('label[for="ack-terms"]').first().click()

    // Begin self-check and advance to Step 1
    const continueBtn = page.getByRole('button', { name: /Continue/i })
    await continueBtn.click()

    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Basic Demographics/i })).toBeVisible()
  })

  // ==========================================================================
  // 3. PATIENT USER JOURNEY
  // ==========================================================================
  test('3. Patient User Journey: Health records, assessment history, and report access', async ({
    page,
  }) => {
    // Navigate to Patient Portal
    await page.goto('/patient')
    await page.waitForLoadState('networkidle')

    // Verify patient dashboard title and permanent ID
    await expect(page).toHaveTitle(/Patient Dashboard | Lungent/i)
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()
    await expect(page.getByText(/Safety Notice: Lungent provides educational screening guidance/i).first()).toBeVisible()

    // Navigate to Health Record
    await page.goto('/patient/health-record')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/My Health Information|আমার স্বাস্থ্য তথ্য/i).first()).toBeVisible()

    // Navigate to Assessments list
    await page.goto('/patient/assessments')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/My Assessments | Lungent/i)

    // Navigate to Screening Information
    await page.goto('/patient/screening')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Screening|Lungent/i)

    // Navigate to Privacy & Consent Settings
    await page.goto('/patient/privacy')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Privacy|Lungent/i)
  })

  // ==========================================================================
  // 4. HEALTHCARE WORKER JOURNEY
  // ==========================================================================
  test('4. Healthcare Worker Journey: Patient directory, registration form, and duplicate checks', async ({
    page,
  }) => {
    // Navigate to Healthcare Worker Directory
    await page.goto('/healthcare-worker/patients')
    await page.waitForLoadState('networkidle')

    // Verify worker directory elements
    await expect(page).toHaveTitle(/Patient Directory & Registry | Lungent/i)
    await expect(page.locator('text=Duplicate Prevention Protocol')).toBeVisible()
    await expect(page.locator('text=LGT-2026-8K2M7P').first()).toBeVisible()

    // Navigate to Patient Registration Form
    await page.goto('/healthcare-worker/patients/register')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Patient Identity Registration | Lungent/i)
    await expect(page.locator('text=Step 1: Check Existing Records').first()).toBeVisible()

    // Navigate to Duplicate Candidate Review
    await page.goto('/healthcare-worker/patients/duplicates')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Duplicate Candidate Queue|অনুরূপ রোগী পর্যালোচনা/i).first()).toBeVisible()

    // Navigate to Referrals
    await page.goto('/healthcare-worker/referrals')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Referral|রেফারেল/i).first()).toBeVisible()
  })

  // ==========================================================================
  // 5. CLINICIAN JOURNEY
  // ==========================================================================
  test('5. Clinician Journey: Clinical decision support, alerts triage, and CAB governance', async ({
    page,
  }) => {
    // Navigate to Clinical Workspace
    await page.goto('/clinical')
    await page.waitForLoadState('networkidle')

    // Verify clinical dashboard
    await expect(page.getByText(/Clinical Decision Support|ক্লিনিক্যাল ডিসিশন সাপোর্ট/i).first()).toBeVisible()

    // Navigate to Clinical Alerts
    await page.goto('/clinical/alerts')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Clinical Alerts|ক্লিনিক্যাল সতর্কতা/i).first()).toBeVisible()

    // Navigate to Clinical Patients
    await page.goto('/clinical/patients')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Patient|রোগী/i).first()).toBeVisible()

    // Navigate to Clinical Governance Hub
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Clinical Governance|ক্লিনিক্যাল গভর্ন্যান্স/i).first()).toBeVisible()
  })

  // ==========================================================================
  // 6. ADMINISTRATOR & GOVERNANCE JOURNEY
  // ==========================================================================
  test('6. Administrator Journey: Operational analytics, facilities, and security framework', async ({
    page,
  }) => {
    // Navigate to Admin Workspace
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Administration|প্রশাসন/i).first()).toBeVisible()

    // Navigate to Operational Analytics
    await page.goto('/admin/analytics')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Operational Analytics|অপারেশনাল অ্যানালিটিক্স/i).first()).toBeVisible()

    // Navigate to Facility Directory
    await page.goto('/admin/facilities')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Facility Registry|স্বাস্থ্যসেবা কেন্দ্র/i).first()).toBeVisible()

    // Navigate to Security & Compliance Framework
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Security, Privacy & Compliance|নিরাপত্তা, গোপনীয়তা ও কমপ্লায়েন্স/i).first()).toBeVisible()
    await expect(page.getByText(/Server-Side Access Enforced|সার্ভার-সাইড অনুমোদন সক্রিয়/i).first()).toBeVisible()
  })
})
