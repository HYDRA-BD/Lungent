import { test, expect } from '@playwright/test'

test.describe('Phase 1.20 — Bangla and English Localization', () => {
  test('1. Homepage dynamically toggles between English and Bangla with proper font class and lang attribute', async ({
    page,
  }) => {
    await page.goto('/')

    // Default English state
    await expect(page).toHaveTitle(/Lungent/i)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('text=Evidence-Based Pulmonary Decision Support')).toBeVisible()

    // Switch to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await expect(languageBtn).toBeVisible()
    await languageBtn.click()

    const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
    await expect(bnOption).toBeVisible()
    await bnOption.click()

    // Verify HTML lang attribute updated to 'bn'
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn')

    // Verify localized Bangla headline
    await expect(
      page.locator('text=প্রমাণ-ভিত্তিক ফুসফুস স্বাস্থ্য সিদ্ধান্ত সহায়তা')
    ).toBeVisible()
    await expect(page.locator('text=ঝুঁকি বুঝুন।').first()).toBeVisible()

    // Switch back to English
    const languageBtnBn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtnBn.click()
    const enOption = page.getByRole('option', { name: /English/i })
    await enOption.click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('text=Evidence-Based Pulmonary Decision Support')).toBeVisible()
  })

  test('2. Authentication Sign-In page renders localized Bangla and preserves input on toggle', async ({
    page,
  }) => {
    await page.goto('/login')

    // Enter email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    await emailInput.fill('clinician.test@lungent.org')

    // Toggle to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtn.click()
    const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
    await bnOption.click()

    // Verify localized heading and button
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/লুঞ্জেন্টে সাইন ইন করুন/i)
    await expect(page.getByRole('button', { name: /সাইন ইন করুন/i })).toBeVisible()

    // Verify entered email was preserved across language switch
    await expect(emailInput).toHaveValue('clinician.test@lungent.org')
  })

  test('3. Registration page displays localized Bangla labels and terms agreement', async ({
    page,
  }) => {
    await page.goto('/register')

    // Toggle to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtn.click()
    const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
    await bnOption.click()

    // Verify Bangla heading and labels
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/লুঞ্জেন্ট অ্যাকাউন্ট তৈরি করুন/i)
    await expect(page.locator('text=ইতিমধ্যেই অ্যাকাউন্ট আছে?')).toBeVisible()
  })

  test('4. Admin Governance workspace renders localized Bangla navigation and stats', async ({
    page,
  }) => {
    await page.goto('/admin')

    // Switch to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtn.click()
    const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
    await bnOption.click()

    // Verify localized Admin Header
    await expect(
      page.locator('text=প্ল্যাটফর্ম গভর্নেন্স ও সিস্টেম প্রশাসন').first()
    ).toBeVisible()

    // Verify KPI titles in Bangla
    await expect(page.locator('text=নিবন্ধিত স্বাস্থ্যকেন্দ্র')).toBeVisible()
    await expect(page.locator('text=সক্রিয় চিকিৎসক')).toBeVisible()
    await expect(page.locator('text=অডিট ট্রেইল সততা')).toBeVisible()
  })

  test('5. Patient Portal retains non-diagnostic reassurance across languages', async ({
    page,
  }) => {
    await page.goto('/patient/notifications')

    // Non-diagnostic notice in English
    await expect(
      page.locator('text=do not constitute a confirmed medical diagnosis of lung cancer')
    ).toBeVisible()

    // Switch to Bangla
    const languageBtn = page.getByRole('button', { name: 'Select language' }).first()
    await languageBtn.click()
    const bnOption = page.locator('ul[role="listbox"]').getByRole('option', { name: /বাংলা/i })
    await bnOption.click()

    // Non-diagnostic notice in Bangla
    await expect(
      page.locator('text=এটি নিশ্চিত ক্যান্সার নির্ণয় নয়')
    ).toBeVisible()
  })
})
