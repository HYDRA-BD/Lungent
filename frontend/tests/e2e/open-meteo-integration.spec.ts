import { test, expect } from '@playwright/test'

test.describe('Phase 1.16 Open-Meteo Air Quality API Integration', () => {
  const PATIENT_UUID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam (Dhaka division)

  test('1. Patient Clinical Profile renders Open-Meteo Atmospheric Intelligence Dashboard', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Verify Open-Meteo dashboard container
    const dashboard = page.getByTestId('open-meteo-dashboard')
    await expect(dashboard).toBeVisible()

    // Verify Title & Location Centroid Coordinates
    await expect(dashboard.getByText('Open-Meteo Atmospheric Intelligence')).toBeVisible()
    await expect(dashboard.getByText(/Dhaka/i).first()).toBeVisible()
    await expect(dashboard.getByText(/Centroid/i)).toBeVisible()
  })

  test('2. Dual AQI View clearly distinguishes US EPA AQI from European CAQI standards', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // US EPA AQI Card
    const usAqiCard = page.getByTestId('us-aqi-card')
    await expect(usAqiCard).toBeVisible()
    await expect(usAqiCard.getByText('US EPA AQI (0–500 Scale)')).toBeVisible()
    await expect(usAqiCard.getByText('Standard: 40 CFR Part 58')).toBeVisible()

    const usVal = await usAqiCard.getByTestId('us-aqi-value').innerText()
    expect(parseInt(usVal, 10)).toBeGreaterThan(0)

    // European CAQI Card
    const euAqiCard = page.getByTestId('eu-aqi-card')
    await expect(euAqiCard).toBeVisible()
    await expect(euAqiCard.getByText('European CAQI (0–100 Scale)')).toBeVisible()
    await expect(euAqiCard.getByText('Standard: EEA Directive 2008/50/EC')).toBeVisible()

    const euVal = await euAqiCard.getByTestId('eu-aqi-value').innerText()
    expect(parseInt(euVal, 10)).toBeGreaterThan(0)
  })

  test('3. Hourly Trend & Forecast tab displays chronological atmospheric timeline', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    const dashboard = page.getByTestId('open-meteo-dashboard')
    await expect(dashboard).toBeVisible()

    // Switch to Hourly Trend & Forecast Tab
    const hourlyTabBtn = dashboard.getByRole('button', { name: /Hourly Trend & Forecast/i })
    await hourlyTabBtn.click()

    // Verify timeline container is visible
    const timelineSection = dashboard.getByTestId('hourly-timeline-section')
    await expect(timelineSection).toBeVisible()
    await expect(timelineSection.getByText(/24-Hour Chronological Timeline/i)).toBeVisible()
  })

  test('4. Provenance & Standards tab provides Open-Meteo & Copernicus CAMS attribution', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    const dashboard = page.getByTestId('open-meteo-dashboard')

    // Switch to Provenance & Standards tab
    const provTabBtn = dashboard.getByRole('button', { name: /Provenance & Standards/i })
    await provTabBtn.click()

    // Verify attribution details
    await expect(dashboard.getByText(/Copernicus Atmosphere Monitoring Service/i).first()).toBeVisible()
    await expect(dashboard.getByText(/40 CFR Part 58/i)).toBeVisible()
    await expect(dashboard.getByText(/Directive 2008\/50\/EC/i)).toBeVisible()
  })

  test('5. Manual Refresh trigger initiates synchronization and maintains clinical safety notice', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    const dashboard = page.getByTestId('open-meteo-dashboard')

    // Click refresh button
    const refreshBtn = dashboard.getByTestId('refresh-env-btn')
    await expect(refreshBtn).toBeVisible()
    await refreshBtn.click()

    // Verify safety principle alert is preserved
    const safetyAlert = dashboard.getByTestId('clinical-safety-alert')
    await expect(safetyAlert).toBeVisible()
    await expect(safetyAlert.getByText(/Current AQI is a short-term atmospheric measurement/i)).toBeVisible()
    await expect(safetyAlert.getByText(/NOT an individual lifetime cancer risk score/i)).toBeVisible()
  })
})
