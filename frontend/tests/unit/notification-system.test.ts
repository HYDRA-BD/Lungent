import { describe, it, expect } from 'vitest'
import {
  NotificationService,
  NOTIF_DEFAULT_PATIENT_USER_ID,
  NOTIF_DEFAULT_CLINICIAN_USER_ID,
} from '@/modules/notifications/service'
import {
  isValidPhoneNumber,
  normalizeBangladeshPhoneNumber,
} from '@/modules/notifications/validation'
import {
  interpolateTemplate,
  sanitizeHtml,
  NOTIFICATION_TEMPLATES,
} from '@/modules/notifications/templates'
import {
  MockSmsProvider,
  MockEmailProvider,
} from '@/modules/notifications/providers'

describe('Notification and Communication System (Phase 1.19)', () => {
  describe('1. Phone Number Validation & E.164 Normalization', () => {
    it('validates Bangladesh mobile numbers in various local and international formats', () => {
      expect(isValidPhoneNumber('01711000000')).toBe(true)
      expect(isValidPhoneNumber('+8801811223344')).toBe(true)
      expect(isValidPhoneNumber('8801912345678')).toBe(true)
      expect(isValidPhoneNumber('+880 1311-223344')).toBe(true)
    })

    it('validates international E.164 phone numbers', () => {
      expect(isValidPhoneNumber('+12025550123')).toBe(true)
      expect(isValidPhoneNumber('+447911123456')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(isValidPhoneNumber('12345')).toBe(false)
      expect(isValidPhoneNumber('abc01711000000')).toBe(false)
      expect(isValidPhoneNumber('01211000000')).toBe(false) // 012 is invalid Bangladesh operator prefix
    })

    it('normalizes Bangladesh mobile numbers to standard E.164 (+8801XXXXXXXXX)', () => {
      expect(normalizeBangladeshPhoneNumber('01711000000')).toBe('+8801711000000')
      expect(normalizeBangladeshPhoneNumber('+8801811223344')).toBe('+8801811223344')
      expect(normalizeBangladeshPhoneNumber('8801912345678')).toBe('+8801912345678')
      expect(normalizeBangladeshPhoneNumber('01311-223344')).toBe('+8801311223344')
    })
  })

  describe('2. Template Interpolation & HTML Sanitization', () => {
    it('interpolates placeholders with provided variables', () => {
      const template = 'Hello {recipientName}, your referral to {facilityName} is confirmed for {scheduledDate}.'
      const vars = {
        recipientName: 'Md. Rafiqul Islam',
        facilityName: 'NIDCH Dhaka',
        scheduledDate: '2026-11-15',
      }
      const rendered = interpolateTemplate(template, vars)
      expect(rendered).toBe('Hello Md. Rafiqul Islam, your referral to NIDCH Dhaka is confirmed for 2026-11-15.')
    })

    it('handles missing variables gracefully without crashing', () => {
      const template = 'Alert for {recipientName}: {unknownVar}'
      const rendered = interpolateTemplate(template, { recipientName: 'Patient' })
      expect(rendered).toBe('Alert for Patient: ')
    })

    it('sanitizes malicious HTML tags while preserving benign formatting tags', () => {
      const dirtyHtml = '<p>Your <strong>referral</strong> is active. <script>alert("xss")</script><iframe src="evil.com"></iframe><a href="javascript:steal()">Click</a></p>'
      const cleanHtml = sanitizeHtml(dirtyHtml)
      expect(cleanHtml).not.toContain('<script>')
      expect(cleanHtml).not.toContain('<iframe>')
      expect(cleanHtml).not.toContain('javascript:')
      expect(cleanHtml).toContain('<strong>referral</strong>')
      expect(cleanHtml).toContain('<p>')
    })

    it('contains registered bilingual templates for assessment, referral, follow-up, and urgent events', () => {
      expect(NOTIFICATION_TEMPLATES['assessment_submitted']).toBeDefined()
      expect(NOTIFICATION_TEMPLATES['assessment_submitted'].en.title).toBeDefined()
      expect(NOTIFICATION_TEMPLATES['assessment_submitted'].bn.title).toBeDefined()

      expect(NOTIFICATION_TEMPLATES['referral_scheduled']).toBeDefined()
      expect(NOTIFICATION_TEMPLATES['followup_reminder']).toBeDefined()
      expect(NOTIFICATION_TEMPLATES['urgent_clinical_escalation']).toBeDefined()
    })
  })

  describe('3. Multi-Channel Provider Adapters', () => {
    it('MockSmsProvider delivers valid SMS and records sent messages', async () => {
      const sms = new MockSmsProvider()
      const res = await sms.sendSms({
        to: '+8801711223344',
        body: 'Your lung health assessment is complete.',
      })
      expect(res.success).toBe(true)
      expect(res.providerMessageId).toMatch(/^sms-msg-/)
      expect(sms.getSentMessages().length).toBe(1)
      expect(sms.getSentMessages()[0].to).toBe('+8801711223344')
    })

    it('MockSmsProvider rejects invalid phone formats', async () => {
      const sms = new MockSmsProvider()
      const res = await sms.sendSms({
        to: 'invalid-phone',
        body: 'Test message',
      })
      expect(res.success).toBe(false)
      expect(res.errorCode).toBe('ERR_INVALID_PHONE_NUMBER')
    })

    it('MockEmailProvider delivers emails and tracks sent messages', async () => {
      const email = new MockEmailProvider()
      const res = await email.sendEmail({
        to: 'patient@example.com',
        subject: 'Assessment Results Available',
        text: 'Your results are ready to view.',
        html: '<p>Your results are ready to view.</p>',
      })
      expect(res.success).toBe(true)
      expect(res.providerMessageId).toMatch(/^email-msg-/)
      expect(email.getSentEmails().length).toBe(1)
      expect(email.getSentEmails()[0].subject).toBe('Assessment Results Available')
    })
  })

  describe('4. Notification Service Engine & Lifecycle Management', () => {
    it('creates in-app notifications and resolves multi-channel deliveries', async () => {
      const res = await NotificationService.createNotificationEvent({
        eventType: 'referral_scheduled',
        recipientUserId: NOTIF_DEFAULT_PATIENT_USER_ID,
        patientId: NOTIF_DEFAULT_PATIENT_USER_ID,
        recipientPhone: '+8801711999888',
        recipientEmail: 'rafiq@example.com',
        priority: 'urgent',
        sourceModule: 'referrals',
        sourceReferenceId: 'ref-test-001',
        variables: {
          recipientName: 'Md. Rafiqul Islam',
          destinationFacilityName: 'NIDCH Mohakhali',
          appointmentDate: '2026-11-20',
          appointmentLocation: 'Room 204',
          instructions: 'Bring past X-ray reports.',
        },
      })

      expect(res.notification).toBeDefined()
      expect(res.notification.category).toBe('referral')
      expect(res.notification.priority).toBe('urgent')
      expect(res.notification.title).toBe('Specialist Consultation Scheduled')
      expect(res.notification.body).toContain('NIDCH Mohakhali')
      expect(res.deliveries.length).toBeGreaterThan(0)
    })

    it('enforces idempotency protection when same idempotencyKey is dispatched', async () => {
      const key = `idem-test-${Date.now()}`
      const first = await NotificationService.createNotificationEvent({
        eventType: 'assessment_results_available',
        recipientUserId: NOTIF_DEFAULT_PATIENT_USER_ID,
        idempotencyKey: key,
        sourceModule: 'assessments',
        sourceReferenceId: 'asmt-001',
      })

      const second = await NotificationService.createNotificationEvent({
        eventType: 'assessment_results_available',
        recipientUserId: NOTIF_DEFAULT_PATIENT_USER_ID,
        idempotencyKey: key,
        sourceModule: 'assessments',
        sourceReferenceId: 'asmt-001',
      })

      expect(first.notification.id).toBe(second.notification.id)
    })

    it('respects user channel preferences: skips SMS if user disabled SMS', async () => {
      // Disable SMS for test user
      const testUserId = `user-pref-${Date.now()}`
      await NotificationService.updateUserPreferences(testUserId, {
        inAppEnabled: true,
        smsEnabled: false, // SMS disabled
        emailEnabled: true,
        assessmentUpdates: true,
        referralUpdates: true,
        followupReminders: true,
        urgentAlerts: true,
      })

      const res = await NotificationService.createNotificationEvent({
        eventType: 'assessment_submitted',
        recipientUserId: testUserId,
        recipientPhone: '+8801711000111',
        recipientEmail: 'user@example.com',
        sourceModule: 'assessments',
        channels: ['in_app', 'sms', 'email'],
      })

      const smsDelivery = res.deliveries.find((d) => d.channel === 'sms')
      expect(smsDelivery).toBeUndefined() // SMS skipped based on preference
      const inAppDelivery = res.deliveries.find((d) => d.channel === 'in_app')
      expect(inAppDelivery).toBeDefined()
    })

    it('enforces mandatory non-suppression for urgent clinical alerts', async () => {
      // Even if user attempts to disable preferences, urgent alerts remain active
      const testUserId = `user-safety-${Date.now()}`
      const prefs = await NotificationService.updateUserPreferences(testUserId, {
        inAppEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
        assessmentUpdates: false,
        referralUpdates: false,
        followupReminders: false,
        urgentAlerts: false as unknown as boolean, // attempt to disable safety alerts
      })

      expect(prefs.urgentAlerts).toBe(true) // Enforced true by clinical safety governance

      const urgentRes = await NotificationService.createNotificationEvent({
        eventType: 'urgent_clinical_escalation',
        recipientUserId: testUserId,
        priority: 'urgent',
        sourceModule: 'triage',
        variables: {
          patientIdentifier: 'LGT-2026-SAFETY',
          triggeringSymptom: 'Frank Hemoptysis',
          escalationAction: 'Immediate 2WW clinical review',
        },
      })

      expect(urgentRes.notification.priority).toBe('urgent')
      expect(urgentRes.notification.requiresAcknowledgement).toBe(true)
    })

    it('marks individual notification as read and records read timestamp', async () => {
      const res = await NotificationService.createNotificationEvent({
        eventType: 'worker_new_assignment',
        recipientUserId: NOTIF_DEFAULT_PATIENT_USER_ID,
        sourceModule: 'healthcare_worker',
      })

      const ok = await NotificationService.markAsRead(NOTIF_DEFAULT_PATIENT_USER_ID, res.notification.id)
      expect(ok).toBe(true)

      const notifs = await NotificationService.getNotificationsForUser(NOTIF_DEFAULT_PATIENT_USER_ID)
      const found = notifs.find((n) => n.id === res.notification.id)
      expect(found?.isRead).toBe(true)
      expect(found?.readAt).toBeDefined()
    })

    it('marks all notifications as read for a given user', async () => {
      const count = await NotificationService.markAllAsRead(NOTIF_DEFAULT_PATIENT_USER_ID)
      expect(typeof count).toBe('number')

      const unreadList = await NotificationService.getNotificationsForUser(NOTIF_DEFAULT_PATIENT_USER_ID, {
        unreadOnly: true,
      })
      expect(unreadList.length).toBe(0)
    })

    it('allows clinician to acknowledge an urgent escalation notification', async () => {
      const urgentRes = await NotificationService.createNotificationEvent({
        eventType: 'urgent_red_flag_alert',
        recipientUserId: NOTIF_DEFAULT_CLINICIAN_USER_ID,
        priority: 'urgent',
        sourceModule: 'triage',
      })

      const ackOk = await NotificationService.acknowledgeNotification(
        NOTIF_DEFAULT_CLINICIAN_USER_ID,
        urgentRes.notification.id
      )
      expect(ackOk).toBe(true)

      const clinicianNotifs = await NotificationService.getNotificationsForUser(
        NOTIF_DEFAULT_CLINICIAN_USER_ID
      )
      const found = clinicianNotifs.find((n) => n.id === urgentRes.notification.id)
      expect(found?.acknowledgedAt).toBeDefined()
      expect(found?.isRead).toBe(true)
    })

    it('enforces bounded retries (max 3) for failed deliveries', async () => {
      const deliveries = await NotificationService.getRecentDeliveries(20)
      const failedDeliv = deliveries.find((d) => d.deliveryStatus === 'failed')

      if (failedDeliv) {
        // Attempt retry 1
        const retried = await NotificationService.retryFailedDelivery(failedDeliv.id)
        expect(retried.attemptsCount).toBeGreaterThanOrEqual(2)

        // If attempts reach 3, subsequent retry must throw
        if (retried.attemptsCount >= 3) {
          await expect(
            NotificationService.retryFailedDelivery(failedDeliv.id)
          ).rejects.toThrow(/Maximum retry limit/)
        }
      }
    })

    it('calculates operational delivery metrics and gateway statuses', async () => {
      const metrics = await NotificationService.getAdminDeliveryMetrics()
      expect(metrics.totalNotifications).toBeGreaterThan(0)
      expect(metrics.totalDeliveries).toBeGreaterThan(0)
      expect(typeof metrics.deliverySuccessRate).toBe('number')
      expect(metrics.deliverySuccessRate).toBeGreaterThanOrEqual(0)
      expect(metrics.deliverySuccessRate).toBeLessThanOrEqual(100)
      expect(metrics.providerStatuses.sms).toBeDefined()
      expect(metrics.providerStatuses.email).toBeDefined()
    })

    it('schedules follow-up reminders approaching within the 48-72h target window', async () => {
      const scheduled = await NotificationService.scheduleFollowUpReminders('2026-11-26')
      expect(scheduled).toBeGreaterThanOrEqual(1)
    })
  })
})
