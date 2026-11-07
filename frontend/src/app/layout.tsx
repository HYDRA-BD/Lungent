import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { LanguageProvider } from '@/i18n'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { OfflineConnectivityBanner } from '@/components/shared/offline-connectivity-banner'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
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
      className={cn('font-sans antialiased', geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="lungent_theme"
        >
          <LanguageProvider>
            <OfflineConnectivityBanner />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
