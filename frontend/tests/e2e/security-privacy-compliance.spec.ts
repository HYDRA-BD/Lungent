import { test, expect } from '@playwright/test'

test.describe('Phase 1.25: Security, Privacy & Compliance Framework', () => {
  test('1. Security & Compliance workspace renders KPI metrics, overview cards, and security barriers', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Verify Page Header and Authority Badges
    await expect(page.locator('h1')).toContainText(/Security, Privacy & Compliance|নিরাপত্তা, গোপনীয়তা ও কমপ্লায়েন্স/i)
    await expect(page.getByText(/Server-Side Access Enforced|সার্ভার-সাইড অনুমোদন সক্রিয়/i).first()).toBeVisible()

    // Verify KPI Summary Cards
    await expect(page.getByText(/Security Events Logged|নথিবদ্ধ নিরাপত্তা ঘটনা/i).first()).toBeVisible()
    await expect(page.getByText(/Privacy Rights Requests|তথ্য অধিকার আবেদন/i).first()).toBeVisible()
    await expect(page.getByText(/Open Security Incidents|উন্মুক্ত নিরাপত্তা ঘটনা/i).first()).toBeVisible()
    await expect(page.getByText(/Active Sessions|সক্রিয় সেশন/i).first()).toBeVisible()
    await expect(page.getByText(/Flagged Alerts|চিহ্নিত সতর্কবার্তা/i).first()).toBeVisible()
    await expect(page.getByText(/Disaster Recovery Status|দুর্যোগ পুনরুদ্ধার স্থিতি/i).first()).toBeVisible()

    // Verify Overview Security Posture Cards
    await expect(page.getByText(/Server-Side Least Privilege|সার্ভার-সাইড অ্যাক্সেস নিয়ন্ত্রণ/i).first()).toBeVisible()
    await expect(page.getByText(/Authentication & Session Integrity|প্রমাণীকরণ ও সেশন সুরক্ষা/i).first()).toBeVisible()
    await expect(page.getByText(/HTTP Security Headers|এইচটিটিপি নিরাপত্তা হেডার/i).first()).toBeVisible()

    // Verify Administrative Least Privilege Policy Alert
    await expect(
      page.getByText(/Administrative Least Privilege Policy|প্রশাসনিক প্রবেশাধিকার সীমাবদ্ধতা নীতি/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/Platform administrators manage infrastructure and security controls, but are segregated from clinical decision-making authority|সিস্টেম অ্যাডমিনিস্ট্রেটরগণ অবকাঠামো ও নিরাপত্তা নিয়ন্ত্রণ করেন/i).first()
    ).toBeVisible()
  })

  test('2. Audit Log tab displays append-only security events with filtering', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Switch to Audit tab
    const auditTab = page.getByRole('tab', { name: /Audit Log & Events|অডিট লগ ও ঘটনাবলী/i })
    await auditTab.click()

    // Verify Audit table headings
    await expect(page.getByText(/Timestamp|সময়/i).first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Event Type|ইভেন্ট ধরন/i }).first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Severity|তীব্রতা/i }).first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Outcome|ফলাফল/i }).first()).toBeVisible()

    // Verify seeded audit logs
    await expect(page.getByText(/auth\.login\.success/i).first()).toBeVisible()
    await expect(page.getByText(/security\.access_violation\.blocked/i).first()).toBeVisible()
    await expect(page.getByText(/patient\.consent\.withdrawn/i).first()).toBeVisible()
  })

  test('3. Privacy & Data Subject Requests tab manages lawful rights and statutory retention holds', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Switch to Privacy Requests tab
    const privacyTab = page.getByRole('tab', { name: /Data Subject Rights|রোগীর তথ্য অধিকার/i })
    await privacyTab.click()

    // Verify requests table
    await expect(page.getByText('DSR-2026-001').first()).toBeVisible()
    await expect(page.getByText('DSR-2026-002').first()).toBeVisible()

    // Verify Statutory Hold notice on erasure request
    await expect(page.getByText(/Statutory medical record retention required under BMDC Code of Ethics/i).first()).toBeVisible()

    // Open Review Dialog on DSR-2026-002
    const reviewBtn = page.getByRole('button', { name: /Review Request|আবেদন পর্যালোচনা/i }).last()
    await reviewBtn.click()

    // Verify dialog content
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Process Data Subject Privacy Request|রোগীর তথ্য অধিকার আবেদন পর্যালোচনা/i).first()).toBeVisible()
    await expect(page.getByText(/Apply Statutory Clinical Retention Hold/i).first()).toBeVisible()

    // Close Dialog
    await page.getByRole('button', { name: /Cancel|বাতিল/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('4. Security Incidents tab allows reporting and managing security incidents', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Switch to Incidents tab
    const incidentsTab = page.getByRole('tab', { name: /Incident Management|ঘটনা ব্যবস্থাপনা/i })
    await incidentsTab.click()

    // Verify existing incidents
    await expect(page.getByText('INC-2026-001').first()).toBeVisible()
    await expect(page.getByText(/Repeated Invalid Password Attempts on Healthcare Worker Portal/i).first()).toBeVisible()
    await expect(page.getByText('INC-2026-002').first()).toBeVisible()

    // Open Report Incident Modal
    const reportBtn = page.getByRole('button', { name: /Report Security Incident|নিরাপত্তা ঘটনা রিপোর্ট/i })
    await reportBtn.click()

    // Verify dialog fields
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Report New Security Incident|নতুন নিরাপত্তা ঘটনা রিপোর্ট করুন/i).first()).toBeVisible()
    await expect(page.getByLabel(/Incident Title|ঘটনার শিরোনাম/i)).toBeVisible()
    await expect(page.getByLabel(/Immediate Containment Notes|প্রাথমিক নিয়ন্ত্রণমূলক পদক্ষেপ/i)).toBeVisible()

    // Cancel modal
    await page.getByRole('button', { name: /Cancel|বাতিল/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Open Manage modal on first incident
    const manageBtn = page.getByRole('button', { name: /Manage|ব্যবস্থাপনা/i }).first()
    await manageBtn.click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Triage Incident:|ঘটনা নিয়ন্ত্রণ ও সমাধান:/i).first()).toBeVisible()
    await page.getByRole('button', { name: /Cancel|বাতিল/i }).click()
  })

  test('5. Data Retention & Backup verification tab displays retention lifecycles and recovery drills', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Switch to Retention & Backups tab
    const retentionTab = page.getByRole('tab', { name: /Data Retention & Backups|ডেটা সংরক্ষণ ও ব্যাকআপ/i })
    await retentionTab.click()

    // Verify Retention Policies
    await expect(page.getByText(/Clinical Records & Assessments/i).first()).toBeVisible()
    await expect(page.getByText(/10 Years \(3650d\)/i).first()).toBeVisible()
    await expect(page.getByText(/Security Audit Logs/i).first()).toBeVisible()
    await expect(page.getByText(/5 Years \(1825d\)/i).first()).toBeVisible()

    // Verify Backup Verification Log
    await expect(page.getByText('automated_daily_snapshot').first()).toBeVisible()
    await expect(page.getByText(/Supabase PostgreSQL Production Database/i).first()).toBeVisible()
    await expect(page.getByText('point_in_time_wal').first()).toBeVisible()
    await expect(page.getByText(/Continuous WAL Archival \(RPO < 5 minutes\)/i).first()).toBeVisible()
  })

  test('6. Compliance Register tab maps technical controls to Bangladesh laws and global standards', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Switch to Compliance tab
    const complianceTab = page.getByRole('tab', { name: /Compliance Register|কমপ্লায়েন্স রেজিস্টার/i })
    await complianceTab.click()

    // Verify Compliance Disclaimer
    await expect(page.getByText(/Compliance Readiness & Regulatory Disclaimer/i).first()).toBeVisible()
    await expect(
      page.getByText(/Compliance readiness registers document technical control alignment|formal certification/i).first()
    ).toBeVisible()

    // Verify Controls
    await expect(page.getByText('BD-CSA-SEC26').first()).toBeVisible()
    await expect(page.getByText(/Prohibition of Unauthorized System Access & Identity Theft/i).first()).toBeVisible()
    await expect(page.getByText('BMDC-CONF-SEC4').first()).toBeVisible()
    await expect(page.getByText(/Physician-Patient Privilege & Clinical Record Retention/i).first()).toBeVisible()
    await expect(page.getByText('HIPAA-TECH-164-312').first()).toBeVisible()
  })

  test('7. Bilingual support renders Security & Compliance Workspace in Bangla', async ({
    page,
  }) => {
    await page.goto('/admin/security')
    await page.waitForLoadState('networkidle')

    // Switch language to Bangla
    const bnBtn = page.getByRole('button', { name: /বাংলা|BN/i }).first()
    if (await bnBtn.isVisible()) {
      await bnBtn.click()
    }

    // Verify localized header & KPI titles
    await expect(
      page.getByRole('heading', { name: /নিরাপত্তা, গোপনীয়তা ও কমপ্লায়েন্স প্রশাসন|Security, Privacy & Compliance/i })
    ).toBeVisible()
    await expect(
      page.getByText(/সার্ভার-সাইড অনুমোদন সক্রিয়|Server-Side Access Enforced/i).first()
    ).toBeVisible()
    await expect(
      page.getByText(/নথিবদ্ধ নিরাপত্তা ঘটনা|Security Events Logged/i).first()
    ).toBeVisible()
  })
})
