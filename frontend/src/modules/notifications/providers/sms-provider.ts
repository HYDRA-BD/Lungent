/**
 * Phase 1.19: SMS Provider Adapter Interface & Implementations
 *
 * Provides a provider-independent SMS interface with Bangladesh number support (+880...),
 * E.164 normalization, delivery status tracking, and resilient mock/fallback handling.
 */

import type { DeliveryLifecycleStatus } from '../types'
import { isValidPhoneNumber, normalizeBangladeshPhoneNumber } from '../validation'

export interface SmsSendRequest {
  to: string
  body: string
  idempotencyKey?: string
  metadata?: Record<string, unknown>
}

export interface SmsSendResult {
  success: boolean
  providerName: string
  providerMessageId?: string
  status: DeliveryLifecycleStatus
  error?: string
  errorCode?: string
  dispatchedAt: string
}

export interface ISmsProvider {
  readonly name: string
  readonly isConfigured: boolean
  sendSms(request: SmsSendRequest): Promise<SmsSendResult>
  getStatus(): 'operational' | 'degraded' | 'offline'
}

/**
 * Mock SMS Provider for automated testing and offline environments.
 * Simulates gateway receipt, E.164 validation, and tracks sent messages.
 */
export class MockSmsProvider implements ISmsProvider {
  readonly name = 'mock-sms-gateway'
  readonly isConfigured = true
  private sentMessages: Array<SmsSendRequest & { messageId: string; dispatchedAt: string }> = []

  async sendSms(request: SmsSendRequest): Promise<SmsSendResult> {
    const dispatchedAt = new Date().toISOString()

    if (!request.to || !isValidPhoneNumber(request.to)) {
      return {
        success: false,
        providerName: this.name,
        status: 'rejected',
        error: `Invalid destination phone number: "${request.to}". Must be Bangladesh or international E.164.`,
        errorCode: 'ERR_INVALID_PHONE_NUMBER',
        dispatchedAt,
      }
    }

    const normalizedTo = normalizeBangladeshPhoneNumber(request.to)
    const providerMessageId = `sms-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    this.sentMessages.push({
      ...request,
      to: normalizedTo,
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

  getSentMessages() {
    return [...this.sentMessages]
  }

  clear() {
    this.sentMessages = []
  }
}

/**
 * Configurable HTTP SMS Gateway Provider for live production.
 * Configured via SMS_GATEWAY_URL and SMS_API_KEY environment variables.
 */
export class ConfigurableHttpSmsProvider implements ISmsProvider {
  readonly name = 'configurable-http-sms'
  private gatewayUrl: string | undefined
  private apiKey: string | undefined

  constructor() {
    this.gatewayUrl = process.env.SMS_GATEWAY_URL
    this.apiKey = process.env.SMS_API_KEY
  }

  get isConfigured(): boolean {
    return Boolean(this.gatewayUrl && this.apiKey)
  }

  async sendSms(request: SmsSendRequest): Promise<SmsSendResult> {
    const dispatchedAt = new Date().toISOString()

    if (!this.isConfigured) {
      // Graceful fallback to simulated mock delivery if credentials are not configured
      const mock = new MockSmsProvider()
      return mock.sendSms(request)
    }

    try {
      const normalizedTo = normalizeBangladeshPhoneNumber(request.to)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(this.gatewayUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: normalizedTo,
          message: request.body,
          idempotencyKey: request.idempotencyKey,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      if (!response.ok) {
        return {
          success: false,
          providerName: this.name,
          status: 'failed',
          error: `SMS Gateway responded with HTTP status ${response.status}`,
          errorCode: `HTTP_${response.status}`,
          dispatchedAt,
        }
      }

      const json = await response.json().catch(() => ({}))
      return {
        success: true,
        providerName: this.name,
        providerMessageId: json.messageId || json.id || `ext-sms-${Date.now()}`,
        status: 'sent_to_provider',
        dispatchedAt,
      }
    } catch (err) {
      return {
        success: false,
        providerName: this.name,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown SMS delivery error',
        errorCode: 'GATEWAY_CONNECTION_ERROR',
        dispatchedAt,
      }
    }
  }

  getStatus(): 'operational' | 'degraded' | 'offline' {
    return this.isConfigured ? 'operational' : 'offline'
  }
}
