import type { Metadata } from 'next'
import { Geist, Hind_Siliguri } from 'next/font/google'
import { cn } from '@/lib/utils'
import { LanguageProvider } from '@/i18n'
import { OfflineConnectivityBanner } from '@/components/shared/offline-connectivity-banner'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-bangla',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lungent — Intelligent Lung Health Assessment',
  description:
    'A web-based lung cancer risk assessment, screening eligibility evaluation, symptom-based clinical triage, and clinical decision-support platform.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn('font-sans antialiased', geist.variable, hindSiliguri.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <LanguageProvider>
          <OfflineConnectivityBanner />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
