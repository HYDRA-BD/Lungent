import { test, expect } from '@playwright/test'

test.describe('Phase 1.9 — Healthcare Facility Management E2E Suite', () => {
  test('displays centralized facility directory with stats, filters, and benchmark facilities', async ({
    page,
  }) => {
    await page.goto('/admin/facilities')
    await expect(page).toHaveTitle(/Healthcare Facility Registry | Lungent/i)

    // Verify Directory Title and Subtitle
    await expect(page.locator('h1').first()).toContainText('Healthcare Facility Management')

    // Verify Network Aggregation Metric Cards
    await expect(page.locator('text=Total Facilities').first()).toBeVisible()
    await expect(page.locator('text=Active Facilities').first()).toBeVisible()
    await expect(page.locator('text=Total Hospital Beds').first()).toBeVisible()
    await expect(page.locator('text=LDCT CT Scanners').first()).toBeVisible()

    // Verify benchmark facility presence in directory
    await expect(page.locator('text=FAC-2026-DHK001').first()).toBeVisible()
    await expect(page.locator('text=Dhaka Central Pulmonary Institute').first()).toBeVisible()
    await expect(page.locator('text=National Institute of Diseases of the Chest and Hospital').first()).toBeVisible()

    // Test search filter
    const searchInput = page.getByPlaceholder(/Search by facility name, ID/i)
    await searchInput.fill('Dhaka Central')
    await page.getByRole('button', { name: 'Search' }).click()

    await expect(page.locator('text=Dhaka Central Pulmonary Institute')).toBeVisible()
    await expect(page.locator('text=National Institute of Diseases of the Chest and Hospital')).not.toBeVisible()

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click()
    await expect(page.locator('text=National Institute of Diseases of the Chest and Hospital').first()).toBeVisible()
  })

  test('registers a new healthcare facility with cascading geographic hierarchy', async ({
    page,
  }) => {
    await page.goto('/admin/facilities/register')
    await expect(page).toHaveTitle(/Register Healthcare Facility | Lungent/i)

    // Verify multi-section registration layout
    await expect(page.locator('text=1. Facility Identity & Classification').first()).toBeVisible()
    await expect(page.locator('text=2. Bangladesh Geographic Hierarchy & Address').first()).toBeVisible()
    await expect(page.locator('text=3. Official Contact & Liaison').first()).toBeVisible()
    await expect(page.locator('text=4. Operational Capacity').first()).toBeVisible()

    // Section 1: Identity
    await page.getByPlaceholder(/e.g. Dhaka Central Pulmonary Institute/i).fill('Rajshahi Chest Disease Clinic')
    await page.getByPlaceholder(/e.g. ঢাকা সেন্ট্রাল/i).fill('রাজশাহী বক্ষব্যাধি ক্লিনিক')

    // Section 2: Geographic Catchment & Address
    await page.getByPlaceholder(/e.g. Section 10, Mirpur/i).fill('Station Road, Rajshahi-6000')

    // Section 3: Official Contact
    await page.getByPlaceholder(/\+880 1XXXXXXXXX/i).fill('+880 1712000000')
    await page.getByPlaceholder(/contact@hospital.gov.bd/i).fill('info@rajshahi-chest.gov.bd')

    // Submit registration form
    await page.getByRole('button', { name: /Submit Facility for Approval/i }).click()

    // Verify success confirmation card
    await expect(page.locator('text=Healthcare Facility Registered Successfully').first()).toBeVisible()
    await expect(page.locator('text=FAC-2026-').first()).toBeVisible()

    // Action button to navigate to new profile
    await expect(page.getByRole('link', { name: /Go to Facility Profile/i })).toBeVisible()
  })

  test('inspects facility profile, tabs, and manages lifecycle status transition with mandatory reason', async ({
    page,
  }) => {
    // Navigate to benchmark facility
    await page.goto('/admin/facilities/22222222-1111-4111-a111-111111111111')

    // Verify Profile Header
    await expect(page.locator('text=FAC-2026-DHK001').first()).toBeVisible()
    await expect(page.locator('text=Dhaka Central Pulmonary Institute').first()).toBeVisible()

    // Verify Action Buttons
    await expect(page.getByRole('button', { name: /Change Status/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Verify Accreditation/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Assign Staff/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Edit Facility/i })).toBeVisible()

    // Verify Tabs
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Services & Imaging/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Staff Memberships/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Lifecycle & Approval/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Audit Trail/i })).toBeVisible()

    // Switch to Services Tab
    await page.getByRole('tab', { name: /Services & Imaging/i }).click()
    await expect(page.locator('text=Offered Clinical & Imaging Services').first()).toBeVisible()
    await expect(page.locator('text=ldct_screening').first()).toBeVisible()

    // Switch to Staff Memberships Tab
    await page.getByRole('tab', { name: /Staff Memberships/i }).click()
    await expect(page.locator('text=Facility Staff Memberships').first()).toBeVisible()
    await expect(page.locator('text=Dr. Rafiqul Islam').first()).toBeVisible()

    // Open Assign Staff Modal
    await page.getByRole('button', { name: /Assign Staff Member/i }).click()
    await expect(page.locator('text=Assign User to Facility').first()).toBeVisible()
    // Close modal
    await page.getByRole('button', { name: /Cancel/i }).first().click()

    // Switch to Lifecycle Tab and test Status Transition
    await page.getByRole('tab', { name: /Lifecycle & Approval/i }).click()
    await expect(page.locator('text=Facility Status History').first()).toBeVisible()

    // Open Change Status Modal
    await page.getByRole('button', { name: /Change Status/i }).first().click()
    await expect(page.locator('text=Change Facility Lifecycle Status').first()).toBeVisible()

    // Select Suspended without reason
    const statusSelect = page.locator('select').first()
    await statusSelect.selectOption('suspended')
    await page.getByRole('button', { name: /Apply Status Transition/i }).click()

    // Enforces mandatory reason
    await expect(
      page.locator('text=A specific justification of at least 10 characters is required for suspension or rejection')
    ).toBeVisible()

    // Fill valid justification
    const reasonInput = page.locator('textarea')
    await reasonInput.fill('Scheduled facility maintenance and clinical equipment recalibration.')
    await page.getByRole('button', { name: /Apply Status Transition/i }).click()

    // Verify modal closes and status history updates
    await expect(page.locator('text=Change Facility Lifecycle Status')).not.toBeVisible()
  })

  test('supports bilingual English and Bangla localization in facility management', async ({
    page,
  }) => {
    await page.goto('/admin/facilities')
    await expect(page.locator('h1').first()).toContainText('Healthcare Facility Management')

    // Switch to Bangla using standardized LanguageSwitcher
    const switcher = page.locator('button[aria-label="Select language"]').first()
    await switcher.click()
    const banglaOption = page.locator('li[role="option"]:has-text("বাংলা")')
    await banglaOption.click()

    // Verify Bangla title and elements
    await expect(page.locator('text=স্বাস্থ্যসেবা কেন্দ্র ব্যবস্থাপনা').first()).toBeVisible()
    await expect(page.locator('text=নতুন স্বাস্থ্যসেবা কেন্দ্র নিবন্ধন').first()).toBeVisible()
  })
})
