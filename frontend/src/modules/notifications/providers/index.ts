import { ISmsProvider, MockSmsProvider, ConfigurableHttpSmsProvider } from './sms-provider'
import { IEmailProvider, MockEmailProvider, ConfigurableHttpEmailProvider } from './email-provider'

export * from './sms-provider'
export * from './email-provider'

// Singleton provider instances
let globalSmsProvider: ISmsProvider = new MockSmsProvider()
let globalEmailProvider: IEmailProvider = new MockEmailProvider()

export function getSmsProvider(): ISmsProvider {
  if (process.env.SMS_GATEWAY_URL && process.env.SMS_API_KEY) {
    return new ConfigurableHttpSmsProvider()
  }
  return globalSmsProvider
}

export function setCustomSmsProvider(provider: ISmsProvider) {
  globalSmsProvider = provider
}

export function getEmailProvider(): IEmailProvider {
  if (process.env.EMAIL_API_URL && process.env.EMAIL_API_KEY) {
    return new ConfigurableHttpEmailProvider()
  }
  return globalEmailProvider
}

export function setCustomEmailProvider(provider: IEmailProvider) {
  globalEmailProvider = provider
}
