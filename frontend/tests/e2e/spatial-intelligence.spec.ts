import { test, expect } from '@playwright/test'

test.describe('Phase 1.17 Geographical Intelligence and Spatial Analysis', () => {
  test('1. Navigates from facility directory to Interactive Facility Map', async ({ page }) => {
    await page.goto('/admin/facilities')

    // Click Interactive Map button
    const mapBtn = page.getByTestId('interactive-map-btn')
    await expect(mapBtn).toBeVisible()
    await mapBtn.click()

    await page.waitForURL('**/admin/facilities/map**')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Geographical Intelligence|ভৌগোলিক বিশ্লেষণ/i)
  })

  test('2. Renders map canvas, clinical safety boundary notice, and KPI stats', async ({ page }) => {
    await page.goto('/admin/facilities/map')

    // Clinical boundary notice
    const notice = page.getByTestId('spatial-clinical-notice')
    await expect(notice).toBeVisible()
    await expect(notice).toContainText(/MUST NOT independently calculate clinical cancer risk/i)

    // KPI Stat cards
    await expect(page.getByText('Mapped Facilities')).toBeVisible()
    await expect(page.getByText('Verified LDCT Centers')).toBeVisible()
    await expect(page.getByText('Districts with LDCT')).toBeVisible()

    // Map container exists
    const mapContainer = page.getByTestId('interactive-spatial-map')
    await expect(mapContainer).toBeVisible()
  })

  test('3. Toggles map layers between Facilities, Ambient AQI, and Coverage Gaps', async ({ page }) => {
    await page.goto('/admin/facilities/map')

    const mapContainer = page.getByTestId('interactive-spatial-map')
    await expect(mapContainer).toBeVisible()

    // Toggle to Ambient AQI layer
    const aqiBtn = page.getByTestId('layer-btn-aqi')
    await aqiBtn.click()
    await expect(mapContainer.getByText(/Unhealthy \(AQI > 150\)/i)).toBeVisible()

    // Toggle to Coverage Gaps layer
    const coverageBtn = page.getByTestId('layer-btn-coverage')
    await coverageBtn.click()
    await expect(mapContainer.getByText(/Verified LDCT Present/i)).toBeVisible()

    // Toggle back to Facilities layer
    const facilitiesBtn = page.getByTestId('layer-btn-facilities')
    await facilitiesBtn.click()
    await expect(mapContainer.getByText(/LDCT Lung Screening Center/i)).toBeVisible()
  })

  test('4. Selects facility marker and inspects diagnostic details drawer', async ({ page }) => {
    await page.goto('/admin/facilities/map')

    // Empty state initially shown in sidebar
    await expect(page.getByTestId('facility-details-empty')).toBeVisible()

    // Click on a facility marker on the SVG map (e.g. NIDCH)
    const marker = page.locator('g[data-testid^="facility-marker-"]').first()
    await expect(marker).toBeVisible()
    await marker.click({ force: true })

    // Details panel should hydrate
    const details = page.getByTestId('facility-spatial-details')
    await expect(details).toBeVisible()
    await expect(details.getByText(/Diagnostic Capabilities & Services/i)).toBeVisible()
    await expect(details.getByText(/WGS84:/i)).toBeVisible()

    // Copy facility ID action
    const copyBtn = page.getByTestId('copy-facility-id-btn')
    await expect(copyBtn).toBeVisible()
  })

  test('5. Switches to Accessible Coverage Table View with search filter', async ({ page }) => {
    await page.goto('/admin/facilities/map')

    // Toggle to table view
    const tableBtn = page.getByTestId('view-toggle-table')
    await tableBtn.click()

    // Coverage table should appear
    const grid = page.getByTestId('coverage-analysis-grid')
    await expect(grid).toBeVisible()
    await expect(grid.getByText('District & Division')).toBeVisible()
    await expect(grid.getByText('LDCT Lung Screening')).toBeVisible()

    // Search for Dhaka in table
    const searchInput = page.getByTestId('coverage-search-input')
    await searchInput.fill('Dhaka')

    const dhakaRow = page.getByTestId('district-row-Dhaka')
    await expect(dhakaRow).toBeVisible()
    await expect(dhakaRow).toContainText('Adequate Imaging')

    // Methodology limitation notice is present
    await expect(grid.getByText(/Methodological Limitation Notice:/i)).toBeVisible()
  })

  test('6. Verifies privacy-preserving aggregated patient distribution card', async ({ page }) => {
    await page.goto('/admin/facilities/map')

    const patientCard = page.getByTestId('patient-density-card')
    await expect(patientCard).toBeVisible()
    await expect(patientCard.getByText(/Aggregated Patient Population Distribution/i)).toBeVisible()
    await expect(patientCard.getByText(/Exact residential GPS coordinates are strictly suppressed/i)).toBeVisible()

    // Verify district aggregate badges
    await expect(page.getByTestId('patient-dist-Dhaka')).toBeVisible()
    await expect(page.getByTestId('patient-dist-Chattogram')).toBeVisible()
  })
})
