/**
 * Lungent Design System Tokens
 * Source of truth for brand colors, typography scale, spacing, layout constraints,
 * and semantic healthcare thresholds.
 */

export const BRAND = {
  name: 'Lungent',
  positioning: 'Intelligent Lung Health Assessment',
  supportingPhrase: 'Understand risk. Reveal insights. Guide decisions.',
  version: '1.2.0',
} as const

export const COLOR_TOKENS = {
  primary: {
    DEFAULT: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
    hover: 'var(--primary-hover)',
    subtle: 'var(--primary-subtle)',
  },
  secondary: {
    DEFAULT: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)',
    hover: 'var(--secondary-hover)',
  },
  accent: {
    DEFAULT: 'var(--accent)',
    foreground: 'var(--accent-foreground)',
  },
  neutral: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    surface: 'var(--card)',
    surfaceForeground: 'var(--card-foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
  },
  semantic: {
    success: {
      DEFAULT: 'var(--success)',
      foreground: 'var(--success-foreground)',
      subtle: 'var(--success-subtle)',
      border: 'var(--success-border)',
    },
    warning: {
      DEFAULT: 'var(--warning)',
      foreground: 'var(--warning-foreground)',
      subtle: 'var(--warning-subtle)',
      border: 'var(--warning-border)',
    },
    destructive: {
      DEFAULT: 'var(--destructive)',
      foreground: 'var(--destructive-foreground)',
      subtle: 'var(--destructive-subtle)',
      border: 'var(--destructive-border)',
    },
    info: {
      DEFAULT: 'var(--info)',
      foreground: 'var(--info-foreground)',
      subtle: 'var(--info-subtle)',
      border: 'var(--info-border)',
    },
  },
  riskTiers: {
    low: {
      labelEn: 'Low Risk',
      labelBn: 'কম ঝুঁকি',
      color: 'var(--success)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    moderate: {
      labelEn: 'Moderate Risk',
      labelBn: 'মাঝারি ঝুঁকি',
      color: 'var(--warning)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    high: {
      labelEn: 'High Risk',
      labelBn: 'উচ্চ ঝুঁকি',
      color: 'var(--destructive)',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    },
    criticalTriage: {
      labelEn: 'Critical Red-Flag',
      labelBn: 'জরুরি সংকেত',
      color: 'var(--destructive)',
      badgeClass: 'bg-red-100 text-red-900 border-red-300 font-bold animate-pulse dark:bg-red-950 dark:text-red-200 dark:border-red-700',
    },
  },
} as const

export const SPACING_TOKENS = {
  compact: '0.5rem',     // 8px - for tight lists, table cells
  standard: '1rem',      // 16px - standard padding, gap
  section: '2rem',       // 32px - intra-section spacing
  container: '3rem',     // 48px - container margins
  page: '4rem',          // 64px - page vertical padding
} as const

export const LAYOUT_TOKENS = {
  maxContentWidth: '1280px',
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '72px',
  headerHeight: '64px',
  mobileBottomNavHeight: '56px',
} as const

export const RADIUS_TOKENS = {
  sm: 'calc(var(--radius) * 0.6)',  // 4px - badges, small chips
  md: 'calc(var(--radius) * 0.8)',  // 6px - inputs, buttons
  lg: 'var(--radius)',              // 8px - cards, dialogs
  xl: 'calc(var(--radius) * 1.5)',  // 12px - popovers, hero cards
  full: '9999px',                   // pill buttons, status indicators
} as const

export const TYPOGRAPHY_TOKENS = {
  fonts: {
    sans: 'var(--font-sans), system-ui, sans-serif',
    bangla: 'var(--font-bangla), var(--font-sans), sans-serif',
  },
  scales: {
    display: {
      fontSize: '2.5rem', // 40px
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    h1: {
      fontSize: '2rem', // 32px
      lineHeight: '1.25',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      fontWeight: '600',
    },
    lead: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.6',
      fontWeight: '400',
    },
    body: {
      fontSize: '0.9375rem', // 15px - optimal for clinical density
      lineHeight: '1.6',
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: '0.8125rem', // 13px
      lineHeight: '1.5',
      fontWeight: '400',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: '500',
    },
  },
} as const
