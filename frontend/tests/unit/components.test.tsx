import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RiskBadge, StatusBadge } from '@/components/ui/status-badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { LanguageProvider } from '@/i18n'
import { BRAND, COLOR_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'

describe('Lungent Design Tokens', () => {
  it('defines correct brand constants and positioning', () => {
    expect(BRAND.name).toBe('Lungent')
    expect(BRAND.positioning).toBe('Intelligent Lung Health Assessment')
    expect(BRAND.supportingPhrase).toBe('Understand risk. Reveal insights. Guide decisions.')
  })

  it('exposes all semantic healthcare color tokens', () => {
    expect(COLOR_TOKENS.primary.DEFAULT).toBe('var(--primary)')
    expect(COLOR_TOKENS.semantic.success.DEFAULT).toBe('var(--success)')
    expect(COLOR_TOKENS.semantic.destructive.DEFAULT).toBe('var(--destructive)')
    expect(COLOR_TOKENS.riskTiers.criticalTriage.labelEn).toBe('Critical Red-Flag')
  })

  it('exposes typography tokens including Bangla configuration', () => {
    expect(TYPOGRAPHY_TOKENS.fonts.bangla).toContain('var(--font-bangla)')
  })
})

describe('Button Component', () => {
  it('renders correctly with default styles', () => {
    render(<Button>Submit Assessment</Button>)
    const button = screen.getByRole('button', { name: /Submit Assessment/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('handles loading state with aria-busy', () => {
    render(<Button loading>Calculating Score</Button>)
    const button = screen.getByRole('button', { name: /Calculating Score/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('supports onClick callback', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    fireEvent.click(screen.getByRole('button', { name: /Click Me/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('Badge & Clinical Risk Badges', () => {
  it('renders standard badge variants', () => {
    render(<Badge variant="success">Low Acuity</Badge>)
    expect(screen.getByText('Low Acuity')).toBeInTheDocument()
  })

  it('renders risk tiers accurately in English', () => {
    const { rerender } = render(<RiskBadge tier="low" />)
    expect(screen.getByText('Low Risk')).toBeInTheDocument()

    rerender(<RiskBadge tier="critical" />)
    expect(screen.getByText('Critical Red-Flag')).toBeInTheDocument()
  })

  it('renders risk tiers in Bengali (বাংলা)', () => {
    render(<RiskBadge tier="critical" locale="bn" />)
    expect(screen.getByText('জরুরি সংকেত')).toBeInTheDocument()
  })

  it('renders workflow statuses properly', () => {
    render(<StatusBadge status="in_review" />)
    expect(screen.getByText('In Review')).toBeInTheDocument()
  })
})

describe('Alert Feedback Component', () => {
  it('renders alert with accessible role="alert"', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Red-Flag Detected</AlertTitle>
        <AlertDescription>Urgent symptom triage required.</AlertDescription>
      </Alert>
    )
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText('Red-Flag Detected')).toBeInTheDocument()
    expect(screen.getByText('Urgent symptom triage required.')).toBeInTheDocument()
  })
})

describe('FormField & Accessibility Bindings', () => {
  it('associates label, input, and error messages via ARIA', () => {
    render(
      <FormField
        id="patient-id"
        label="Patient Identifier"
        required
        error="Patient ID is required"
      >
        <Input placeholder="BD-DHK-0001" />
      </FormField>
    )

    const input = screen.getByLabelText(/Patient Identifier/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')

    const errorMsg = screen.getByRole('alert')
    expect(errorMsg).toHaveTextContent('Patient ID is required')
  })
})

describe('Logo Component', () => {
  it('renders brand wordmark and accessible label', () => {
    render(<Logo variant="full" showTagline />)
    expect(screen.getByLabelText('Lungent — Home')).toBeInTheDocument()
    expect(screen.getByText(/Understand risk/i)).toBeInTheDocument()
  })
})

describe('LanguageSwitcher Component', () => {
  it('renders bilingual options and triggers language changes', () => {
    render(
      <LanguageProvider>
        <LanguageSwitcher variant="pill" />
      </LanguageProvider>
    )
    const banglaBtn = screen.getByRole('button', { name: 'বাংলা' })
    expect(banglaBtn).toBeInTheDocument()

    fireEvent.click(banglaBtn)
    expect(banglaBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
