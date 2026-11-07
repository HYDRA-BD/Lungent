import { test, expect } from '@playwright/test'

test.describe('Phase 1.15 Environmental and Geographic Intelligence Foundation', () => {
  const PATIENT_UUID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam (Dhaka division)

  test('1. Patient Clinical Profile renders Environmental Context Card with CAMS baseline data', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Verify Environmental Context Card is visible
    const envCard = page.getByTestId('environmental-context-card')
    await expect(envCard).toBeVisible()

    // Verify title and location
    await expect(envCard.getByText('Ambient Environmental Context')).toBeVisible()
    await expect(envCard.getByText(/Location:.*Dhaka/i)).toBeVisible()

    // Verify AQI reading
    const aqiValue = envCard.getByTestId('aqi-value')
    await expect(aqiValue).toBeVisible()
    const text = await aqiValue.innerText()
    expect(parseInt(text, 10)).toBeGreaterThan(0)

    // Verify Key Pollutants (PM2.5, PM10, NO2)
    await expect(envCard.getByText('PM2.5')).toBeVisible()
    await expect(envCard.getByText('PM10')).toBeVisible()
    await expect(envCard.getByText('NO₂')).toBeVisible()

    // Verify source attribution
    await expect(envCard.getByText(/Open-Meteo|DOE CAMS|Department of Environment/i).first()).toBeVisible()
  })

  test('2. Mandatory Clinical Safety Principle: Non-Risk Indicator alert is prominently displayed', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    const safetyAlert = page.getByTestId('environmental-context-card').getByTestId('clinical-safety-alert')
    await expect(safetyAlert).toBeVisible()

    // Verify explicit clinical safety wording
    await expect(
      safetyAlert.getByText(/Clinical Safety Principle: Non-Risk Indicator/i)
    ).toBeVisible()
    await expect(
      safetyAlert.getByText(/Current AQI is a short-term atmospheric measurement, NOT an individual lifetime cancer risk score/i)
    ).toBeVisible()
    await expect(
      safetyAlert.getByText(/does not measure accumulated personal biological dose/i)
    ).toBeVisible()
  })

  test('3. Regional Healthcare Accessibility Card displays diagnostic capabilities and caveats', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    const accessibilityCard = page.getByTestId('facility-accessibility-card')
    await expect(accessibilityCard).toBeVisible()

    // Verify title
    await expect(
      accessibilityCard.getByText('Healthcare Accessibility & Clinical Capabilities')
    ).toBeVisible()

    // Verify specialized facilities (NIDCH)
    await expect(
      accessibilityCard.getByText(/National Institute of Diseases of the Chest and Hospital/i).first()
    ).toBeVisible()

    // Verify clinical capability badges
    await expect(accessibilityCard.getByText('Low-Dose CT (LDCT)').first()).toBeVisible()
    await expect(accessibilityCard.getByText('Diagnostic CT').first()).toBeVisible()
    await expect(accessibilityCard.getByText('Spirometry').first()).toBeVisible()
    await expect(accessibilityCard.getByText('GeneXpert (TB)').first()).toBeVisible()

    // Verify accessibility caveat notice
    await expect(
      accessibilityCard.getByText(/Geographic presence does not guarantee real-time machine uptime/i).first()
    ).toBeVisible()
  })

  test('4. Patient Environmental and Occupational Exposures list displays chronic exposure context', async ({
    page,
  }) => {
    await page.goto(`/clinical/patients/${PATIENT_UUID}`)

    // Verify exposures section
    await expect(page.getByText('Biomass & Environmental Exposure')).toBeVisible()
    await expect(page.getByText('Occupational Hazards')).toBeVisible()
    await expect(page.getByText(/Traditional Biomass Chula/i)).toBeVisible()
  })
})
