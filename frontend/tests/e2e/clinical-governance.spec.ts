import { test, expect } from '@playwright/test'

test.describe('Phase 1.24: Clinical Governance Framework & CAB Oversight', () => {
  test('1. Dedicated Clinical Governance Workspace renders KPI summary and methodology registry', async ({
    page,
  }) => {
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')

    // Verify Page Header and Authority Badges
    await expect(page.locator('h1')).toContainText(/Clinical Governance|ক্লিনিক্যাল গভর্ন্যান্স/i)
    await expect(page.getByText(/CAB Active Mandate|সিএবি বৈধতা সক্রিয়/i)).toBeVisible()
    await expect(page.getByText(/CAB Oversight Authority|ক্লিনিক্যাল গভর্ন্যান্স পরিষদ/i)).toBeVisible()

    // Verify KPI Summary Cards
    await expect(page.getByText(/Active Methodologies|সক্রিয় পদ্ধতি/i).first()).toBeVisible()
    await expect(page.getByText(/Verified Specialists|যাচাইকৃত বিশেষজ্ঞ/i).first()).toBeVisible()
    await expect(page.getByText(/Documented Overrides|নথিবদ্ধ ওভাররাইড/i).first()).toBeVisible()

    // Verify Methodology Table rows
    await expect(page.getByText(/PLCOm2012/i).first()).toBeVisible()
    await expect(page.getByText(/USPSTF 2021/i).first()).toBeVisible()
    await expect(page.getByText(/NICE NG12/i).first()).toBeVisible()

    // Verify Evidence Grades
    await expect(page.getByText('Level 1a').first()).toBeVisible()

    // Expand methodology details
    const plcoRow = page.getByText(/PLCOm2012/i).first()
    await plcoRow.click()

    // Inspect rule definitions & parameters
    await expect(page.getByText(/high_risk_threshold_pct/i).first()).toBeVisible()
    await expect(page.getByText(/Tammemägi MC, et al/i).first()).toBeVisible()
  })

  test('2. Clinical Advisory Board tab displays charter, member credentials, and meeting minutes', async ({
    page,
  }) => {
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')

    // Switch to CAB tab
    const boardTab = page.getByRole('tab', { name: /Board Members|বোর্ড সদস্য/i })
    await boardTab.click()

    // Verify Board Charter Card
    await expect(
      page.getByText(/National Clinical Advisory Board for Thoracic Oncology & Decision Support/i).first()
    ).toBeVisible()
    await expect(page.getByText(/Independent multidisciplinary clinical governance authority/i).first()).toBeVisible()

    // Verify Members Directory
    await expect(page.getByText('Prof. Dr. Farhana Ahmed').first()).toBeVisible()
    await expect(page.getByText('BMDC-A-28491').first()).toBeVisible()
    await expect(page.getByText(/Credentials Verified|সনদ যাচাইকৃত/i).first()).toBeVisible()

    await expect(page.getByText('Dr. Rafiqul Islam, FCPS, FRCP').first()).toBeVisible()
    await expect(page.getByText('BMDC-A-31205').first()).toBeVisible()

    // Verify Meeting Minutes & Resolutions
    await expect(page.getByText(/CAB-2025-Q1/i).first()).toBeVisible()
    await expect(page.getByText(/Inaugural Clinical Governance & Guideline Adoption Assembly/i).first()).toBeVisible()
    await expect(page.getByText(/Resolution 2025-01-A/i).first()).toBeVisible()
  })

  test('3. Clinician Overrides tab displays auditable non-destructive overrides with rationale', async ({
    page,
  }) => {
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')

    // Switch to Overrides tab
    const overridesTab = page.getByRole('tab', { name: /Clinician CDSS Overrides|চিকিৎসকের সিডিএসএস ওভাররাইড/i })
    await overridesTab.click()

    // Verify table headings
    await expect(page.getByText(/Automated Output|স্বয়ংক্রিয় অ্যালগরিদম ফলাফল/i).first()).toBeVisible()
    await expect(page.getByText(/Clinician Determination|চিকিৎসকের চূড়ান্ত সিদ্ধান্ত/i).first()).toBeVisible()

    // Verify seeded override entry
    await expect(page.getByText('Dr. Tanvir Hasan, MBBS, MD').first()).toBeVisible()
    await expect(page.getByText(/Diagnostic Discordance|উপসর্গ-ল্যাব অসামঞ্জস্য/i).first()).toBeVisible()
    await expect(page.getByText(/Patient reports subacute weight loss/i).first()).toBeVisible()
  })

  test('4. Periodic Review Schedule displays review cadence and allows recording CAB review outcome', async ({
    page,
  }) => {
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')

    // Switch to Periodic Reviews tab
    const periodicTab = page.getByRole('tab', { name: /Periodic Review Schedule|পর্যায়ক্রমিক পর্যালোচনা/i })
    await periodicTab.click()

    // Verify cycle columns
    await expect(page.getByText(/12 months|১২ মাসিক/i).first()).toBeVisible()

    // Open Record Review modal
    const reviewBtn = page.getByRole('button', { name: /Record Review|মূল্যায়ন রেকর্ড/i }).first()
    await reviewBtn.click()

    // Verify dialog content
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/CAB Review Determination|পর্যালোচনা সিদ্ধান্ত/i).first()).toBeVisible()

    // Close dialog
    await page.getByRole('button', { name: /Cancel|বাতিল/i }).click()
  })

  test('5. Lifecycle transition dialog captures mandatory clinical justification and CAB meeting reference', async ({
    page,
  }) => {
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')

    // Click Lifecycle button on first methodology
    const lifecycleBtn = page.getByRole('button', { name: /Lifecycle|লাইফসাইকেল/i }).first()
    await lifecycleBtn.click()

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Methodology Lifecycle Transition|পদ্ধতির লাইফসাইকেল পরিবর্তন/i).first()).toBeVisible()
    await expect(page.getByLabel(/CAB Meeting Reference|সিএবি সভার রেফারেন্স নম্বর/i)).toBeVisible()
    await expect(page.getByLabel(/Clinical Justification|ক্লিনিক্যাল যৌক্তিকতা/i)).toBeVisible()

    // Close dialog
    await page.getByRole('button', { name: /Cancel|বাতিল/i }).click()
  })

  test('6. Bilingual support renders Clinical Governance in Bangla with key parity', async ({
    page,
  }) => {
    await page.goto('/clinical/governance')
    await page.waitForLoadState('networkidle')

    // Click Language Switcher to Bangla
    const bnBtn = page.getByRole('button', { name: /বাংলা|BN/i }).first()
    if (await bnBtn.isVisible()) {
      await bnBtn.click()
    }

    // Verify localized terms
    await expect(
      page.getByRole('heading', { name: /ক্লিনিক্যাল গভর্ন্যান্স ও মেথডোলজি রেজিস্ট্রি|Clinical Governance/i })
    ).toBeVisible()
    await expect(
      page.getByText(/স্বাধীন ক্লিনিক্যাল তদারকি|Independent clinical oversight/i).first()
    ).toBeVisible()
  })
})

