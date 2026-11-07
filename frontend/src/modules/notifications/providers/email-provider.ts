/**
 * Phase 1.19: Email Provider Adapter Interface & Implementations
 *
 * Provides a provider-independent Email interface with verified sender support,
 * HTML & plain-text templates, delivery tracking, and resilient mock/fallback handling.
 */

import type { DeliveryLifecycleStatus } from '../types'

export interface EmailSendRequest {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  idempotencyKey?: string
  metadata?: Record<string, unknown>
}

export interface EmailSendResult {
  success: boolean
  providerName: string
  providerMessageId?: string
  status: DeliveryLifecycleStatus
  error?: string
  errorCode?: string
  dispatchedAt: string
}

export interface IEmailProvider {
  readonly name: string
  readonly isConfigured: boolean
  sendEmail(request: EmailSendRequest): Promise<EmailSendResult>
  getStatus(): 'operational' | 'degraded' | 'offline'
}

/**
 * Mock Email Provider for automated tests and offline environments.
 */
export class MockEmailProvider implements IEmailProvider {
  readonly name = 'mock-email-service'
  readonly isConfigured = true
  private sentEmails: Array<EmailSendRequest & { messageId: string; dispatchedAt: string }> = []

  async sendEmail(request: EmailSendRequest): Promise<EmailSendResult> {
    const dispatchedAt = new Date().toISOString()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!request.to || !emailRegex.test(request.to)) {
      return {
        success: false,
        providerName: this.name,
        status: 'rejected',
        error: `Invalid recipient email address: "${request.to}".`,
        errorCode: 'ERR_INVALID_EMAIL',
        dispatchedAt,
      }
    }

    const providerMessageId = `email-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    this.sentEmails.push({
      ...request,
      messageId: providerMessageId,
      dispatchedAt,
    })

    return {
      success: true,
      providerName: this.name,
      providerMessageId,
      status: 'delivered', // simulated successful delivery in mock
      dispatchedAt,
    }
  }

  getStatus(): 'operational' | 'degraded' | 'offline' {
    return 'operational'
  }

  getSentEmails() {
    return [...this.sentEmails]
  }

  clear() {
    this.sentEmails = []
  }
}

/**
 * Configurable Email Provider for live production (e.g. Resend, SendGrid, Amazon SES).
 * Configured via EMAIL_API_URL and EMAIL_API_KEY environment variables.
 */
export class ConfigurableHttpEmailProvider implements IEmailProvider {
  readonly name = 'configurable-http-email'
  private apiUrl: string | undefined
  private apiKey: string | undefined
  private defaultFrom: string

  constructor() {
    this.apiUrl = process.env.EMAIL_API_URL
    this.apiKey = process.env.EMAIL_API_KEY
    this.defaultFrom = process.env.EMAIL_FROM_ADDRESS || 'notifications@lungent.org'
  }

  get isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiKey)
  }

  async sendEmail(request: EmailSendRequest): Promise<EmailSendResult> {
    const dispatchedAt = new Date().toISOString()

    if (!this.isConfigured) {
      // Graceful fallback to simulated mock delivery if credentials are not configured
      const mock = new MockEmailProvider()
      return mock.sendEmail(request)
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(this.apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: request.from || this.defaultFrom,
          to: request.to,
          subject: request.subject,
          html: request.html,
          text: request.text || '',
          idempotencyKey: request.idempotencyKey,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      if (!response.ok) {
        return {
          success: false,
          providerName: this.name,
          status: 'failed',
          error: `Email Service responded with HTTP ${response.status}`,
          errorCode: `HTTP_${response.status}`,
          dispatchedAt,
        }
      }

      const json = await response.json().catch(() => ({}))
      return {
        success: true,
        providerName: this.name,
        providerMessageId: json.id || json.messageId || `ext-email-${Date.now()}`,
        status: 'sent_to_provider',
        dispatchedAt,
      }
    } catch (err) {
      return {
        success: false,
        providerName: this.name,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown email delivery error',
        errorCode: 'EMAIL_SERVICE_CONNECTION_ERROR',
        dispatchedAt,
      }
    }
  }

  getStatus(): 'operational' | 'degraded' | 'offline' {
    return this.isConfigured ? 'operational' : 'offline'
  }
}
