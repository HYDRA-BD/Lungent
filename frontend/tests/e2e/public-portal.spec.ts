import { test, expect } from '@playwright/test'

test.describe('Lungent Public Portal End-to-End Suite', () => {
  test('home page renders hero, clinical safety disclaimer, capabilities, and footer', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Lungent/i)

    // Hero headline and clinical badge
    await expect(page.locator('text=Evidence-Based Pulmonary Decision Support')).toBeVisible()
    await expect(page.locator('h1')).toContainText(/Understand risk/i)

    // Primary and secondary CTAs
    await expect(page.locator('text=Explore How It Works').first()).toBeVisible()
    await expect(page.locator('text=Browse Health Library').first()).toBeVisible()

    // Mandatory Non-Diagnostic Clinical Safety Banner
    await expect(page.locator('text=Clinical Decision Support — Not Medical Diagnosis')).toBeVisible()

    // 4 Stakeholder capability cards
    await expect(page.locator('text=Individuals & Patients')).toBeVisible()
    await expect(page.locator('text=Community Health Workers')).toBeVisible()
    await expect(page.locator('text=Clinicians & Specialists')).toBeVisible()
    await expect(page.locator('text=Governance & Administration')).toBeVisible()

    // Statistics section
    await expect(page.locator('text=60–70%')).toBeVisible()
    await expect(page.locator('text=5× Higher')).toBeVisible()

    // Emergency warning in footer
    await expect(page.locator('text=EMERGENCY WARNING')).toBeVisible()
  })

  test('about page clearly distinguishes decision support from medical diagnosis', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveTitle(/About Lungent/i)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/About Lungent/i)
    await expect(page.locator('text=Our Mission')).toBeVisible()
    await expect(page.locator('text=Our Vision')).toBeVisible()

    // Explicit clinical boundary distinction
    await expect(page.locator('text=Clinical Decision Support vs. Medical Diagnosis')).toBeVisible()
    await expect(page.locator('text=Medical Diagnosis (Exclusion)')).toBeVisible()
  })

  test('how it works page outlines the 4-stage workflow and transparency roadmap', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page).toHaveTitle(/How It Works/i)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/How Lungent Works/i)

    // 4 Workflow stages
    await expect(page.locator('text=1. Structured Clinical Intake')).toBeVisible()
    await expect(page.locator('text=2. Multi-Factorial Risk Stratification')).toBeVisible()
    await expect(page.locator('text=3. Clinical Triage & Red-Flag Detection')).toBeVisible()
    await expect(page.locator('text=4. Actionable Next Steps & Referral Support')).toBeVisible()

    // Transparency badge
    await expect(page.locator('text=Development Transparency Note')).toBeVisible()
    await expect(page.locator('text=Phase 1.4 Public Portal Active')).toBeVisible()
  })

  test('health library page supports filtering, searching, and article expansion', async ({ page }) => {
    await page.goto('/library')
    await expect(page).toHaveTitle(/Lung Health Information Library/i)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Lung Health Information Library/i)

    // Check category pills
    await expect(page.getByRole('button', { name: 'Risk Factors' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Signs & Symptoms' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Screening & Early Detection' })).toBeVisible()

    // Search input
    const searchInput = page.locator('input[placeholder*="Search library"]')
    await expect(searchInput).toBeVisible()

    // Expand first article
    const readButtons = page.locator('button:has-text("Read Full Overview")')
    await expect(readButtons.first()).toBeVisible()
    await readButtons.first().click()

    // Verify key takeaway callout is revealed
    await expect(page.locator('text=Key Clinical Takeaway')).toBeVisible()
  })

  test('faqs page supports search and accordion expansion', async ({ page }) => {
    await page.goto('/faqs')
    await expect(page).toHaveTitle(/Frequently Asked Questions/i)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Frequently Asked Questions/i)

    // Trigger first accordion item
    const firstAccordionTrigger = page.locator('button:has-text("What is Lungent and what is its primary purpose?")')
    await expect(firstAccordionTrigger).toBeVisible()
    await firstAccordionTrigger.click()

    // Check expanded answer text
    await expect(page.locator('text=intelligent lung health assessment')).toBeVisible()
  })

  test('contact page displays verified channels, emergency warning, and validates form submission', async ({ page }) => {
    await page.goto('/contact')
    await expect(page).toHaveTitle(/Contact & Platform Support/i)

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Contact & Support/i)

    // Verified communication channels
    await expect(page.locator('text=support@lungent.org')).toBeVisible()
    await expect(page.locator('text=governance@lungent.org')).toBeVisible()

    // Fill contact form
    await page.fill('input[placeholder="Enter your name"]', 'Professor Kamal Hossain')
    await page.fill('input[placeholder="you@example.com"]', 'kamal@dhakahospital.org.bd')
    await page.fill('textarea[placeholder*="Please describe"]', 'Inquiring regarding institutional pilot participation for regional chest clinic.')

    await page.click('button[type="submit"]:has-text("Submit Message")')

    // Expect success message
    await expect(page.locator('text=Inquiry Received')).toBeVisible()
  })

  test('privacy policy and terms of use display legal advisory notice and disclaimers', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page).toHaveTitle(/Privacy Policy/i)
    await expect(page.locator('text=Preliminary Draft for Pilot Testing')).toBeVisible()
    await expect(page.locator('text=Legal & Regulatory Advisory Notice')).toBeVisible()

    await page.goto('/terms')
    await expect(page).toHaveTitle(/Terms of Use/i)
    await expect(page.locator('text=Non-Diagnostic Medical Disclaimer')).toBeVisible()
  })

  test('language switcher toggles between English and Bangla dynamically', async ({ page }) => {
    await page.goto('/')

    // Initial English content
    await expect(page.locator('h1')).toContainText(/Understand risk/i)

    // Click language switcher
    const switcher = page.locator('button[aria-label="Select language"]').first()
    await switcher.click()

    // Select Bangla
    const banglaOption = page.locator('li[role="option"]:has-text("বাংলা")')
    await banglaOption.click()

    // Expect Bangla headline and navigation
    await expect(page.locator('h1')).toContainText(/ঝুঁকি বুঝুন/i)
    await expect(page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'স্বাস্থ্য তথ্যভাণ্ডার' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'কীভাবে কাজ করে' })).toBeVisible()
  })
})
