'use client'

import React, { useState } from 'react'
import {
  Activity,
  Layers,
  Palette,
  Type,
  Sliders,
  AlertTriangle,
  Download,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { PageHeader } from '@/components/layouts/page-header'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button, IconButton } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { FormField } from '@/components/forms/form-field'
import { FormSection } from '@/components/forms/form-section'
import { FileUpload } from '@/components/forms/file-upload'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { SearchBar } from '@/components/ui/search-bar'
import { RiskBadge, StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabPanel } from '@/components/ui/tabs'

function DesignSystemContent() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('brand')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [checkboxState, setCheckboxState] = useState(true)
  const [radioValue, setRadioValue] = useState('smoker_former')
  const [switchState, setSwitchState] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const showcaseTabs = [
    { id: 'brand', label: 'Brand & Color Palette', icon: <Palette className="size-4" /> },
    { id: 'typography', label: 'Typography & Bangla', icon: <Type className="size-4" /> },
    { id: 'components', label: 'Component Library', icon: <Layers className="size-4" /> },
    { id: 'forms', label: 'Form Controls & Inputs', icon: <Sliders className="size-4" /> },
    { id: 'feedback', label: 'Feedback & Dialogs', icon: <AlertTriangle className="size-4" /> },
    { id: 'data', label: 'Clinical Data & Tables', icon: <Activity className="size-4" /> },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <SectionContainer size="xl" className="space-y-8">
          <PageHeader
            title="Lungent Design System Foundation"
            description="Centralized specification of brand tokens, clinical color swatches, bilingual typography, accessible component primitives, and layout systems."
            breadcrumbs={[
              { label: 'Platform Home', href: '/' },
              { label: 'Design System', current: true },
            ]}
            badge={<Badge variant="default" size="sm">Phase 1.2 Specification</Badge>}
            actions={
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            }
          />

          {/* Navigation Tabs */}
          <Tabs
            tabs={showcaseTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="segmented"
          />

          {/* 1. BRAND & PALETTE TAB */}
          <TabPanel id="brand" activeTab={activeTab} className="space-y-8">
            {/* Brand Identity & Logo Treatments */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Brand Identity & Wordmark Treatments
                </h3>
                <p className="text-xs text-muted-foreground">
                  The Lungent mark represents pulmonary airways and respiratory vitality.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-xl bg-muted/30 border border-border/60">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Full Logo with Tagline
                  </span>
                  <Logo size="lg" variant="full" showTagline />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Compact Wordmark
                  </span>
                  <Logo size="md" variant="compact" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Mark Only (App Icon / Favicon)
                  </span>
                  <div className="flex items-center gap-3">
                    <Logo size="lg" variant="mark-only" />
                    <Logo size="md" variant="mark-only" />
                    <Logo size="sm" variant="mark-only" />
                  </div>
                </div>
              </div>
            </div>

            {/* Color Palette Swatches */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Healthcare Color Architecture
                </h3>
                <p className="text-xs text-muted-foreground">
                  Calibrated for WCAG 2.2 AA contrast, clinical trustworthiness, and minimal eye strain.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {/* Primary Teal */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                  <div className="h-16 w-full rounded-lg bg-primary flex items-end p-2 text-primary-foreground font-bold text-xs">
                    Primary
                  </div>
                  <div className="text-xs font-semibold">Deep Clinical Teal</div>
                  <div className="text-[10px] text-muted-foreground font-mono">oklch(0.48 0.14 195)</div>
                </div>

                {/* Secondary Slate */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                  <div className="h-16 w-full rounded-lg bg-secondary flex items-end p-2 text-secondary-foreground font-bold text-xs">
                    Secondary
                  </div>
                  <div className="text-xs font-semibold">Clinical Slate</div>
                  <div className="text-[10px] text-muted-foreground font-mono">oklch(0.94 0.015 220)</div>
                </div>

                {/* Success Emerald */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                  <div className="h-16 w-full rounded-lg bg-emerald-600 flex items-end p-2 text-white font-bold text-xs">
                    Success
                  </div>
                  <div className="text-xs font-semibold">Medical Jade / Low Risk</div>
                  <div className="text-[10px] text-muted-foreground font-mono">oklch(0.55 0.16 150)</div>
                </div>

                {/* Warning Amber */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                  <div className="h-16 w-full rounded-lg bg-amber-500 flex items-end p-2 text-slate-900 font-bold text-xs">
                    Warning
                  </div>
                  <div className="text-xs font-semibold">Clinical Amber / Moderate</div>
                  <div className="text-[10px] text-muted-foreground font-mono">oklch(0.68 0.16 65)</div>
                </div>

                {/* Destructive Crimson */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                  <div className="h-16 w-full rounded-lg bg-rose-600 flex items-end p-2 text-white font-bold text-xs">
                    Destructive
                  </div>
                  <div className="text-xs font-semibold">Clinical Crimson / High Risk</div>
                  <div className="text-[10px] text-muted-foreground font-mono">oklch(0.55 0.22 25)</div>
                </div>

                {/* Info Sky */}
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-card">
                  <div className="h-16 w-full rounded-lg bg-sky-600 flex items-end p-2 text-white font-bold text-xs">
                    Info
                  </div>
                  <div className="text-xs font-semibold">Pulmonary Sky Blue</div>
                  <div className="text-[10px] text-muted-foreground font-mono">oklch(0.56 0.15 240)</div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* 2. TYPOGRAPHY TAB */}
          <TabPanel id="typography" activeTab={activeTab} className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Clinical Typography Hierarchy
                </h3>
                <p className="text-xs text-muted-foreground">
                  Rendered via <span className="font-semibold">Geist Sans</span> with calibrated clinical vertical rhythm and high legibility.
                </p>
              </div>

              <div className="space-y-6 divide-y divide-border/60">
                <div className="pt-4 space-y-1">
                  <span className="text-xs font-mono text-muted-foreground">Display / Page Heading</span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    Intelligent Lung Health Assessment
                  </h1>
                </div>

                <div className="pt-4 space-y-1">
                  <span className="text-xs font-mono text-muted-foreground">Section Title</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Screening Eligibility & Low-Dose CT Guidance
                  </h2>
                </div>

                <div className="pt-4 space-y-1">
                  <span className="text-xs font-mono text-muted-foreground">Clinical Body Text</span>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                    Lung cancer risk estimation accounts for cumulative tobacco pack-years, personal
                    pulmonary disease history, occupational biomass exposures, and regional air quality indicators.
                  </p>
                </div>

                <div className="pt-4 space-y-1">
                  <span className="text-xs font-mono text-muted-foreground">Monospace Clinical Metadata & Codes</span>
                  <p className="text-xs font-mono text-primary font-semibold">
                    ICD-10: C34.9 · USPSTF Grade B · PLCOm2012 Model Calibration: 0.942
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* 3. BASIC COMPONENTS TAB */}
          <TabPanel id="components" activeTab={activeTab} className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-foreground">Button Primitives & States</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="subtle">Subtle</Button>
                  <Button variant="link">Link Style</Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button size="xs">Extra Small (xs)</Button>
                  <Button size="sm">Small (sm)</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large (lg)</Button>
                  <Button loading>Processing</Button>
                  <Button disabled>Disabled</Button>
                  <IconButton icon={<Download className="size-4" />} aria-label="Download report" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Badges & Status Indicators */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-foreground">Badges & Status Indicators</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success" dot>Active Screen</Badge>
                  <Badge variant="warning" dot>Pending Review</Badge>
                  <Badge variant="destructive" dot>Critical Alert</Badge>
                  <Badge variant="info">Guideline</Badge>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <RiskBadge tier="low" />
                  <RiskBadge tier="moderate" />
                  <RiskBadge tier="high" />
                  <RiskBadge tier="critical" />
                </div>
              </div>

              {/* Avatars, Progress & Skeletons */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-foreground">Avatars & Progress</h3>
                <div className="flex items-center gap-4">
                  <Avatar fallback="FA" size="lg" status="online" />
                  <Avatar fallback="TR" size="md" status="busy" />
                  <Avatar fallback="KH" size="sm" status="away" />
                  <Tooltip content="Tooltip: Verified Clinician Credentials">
                    <span className="text-xs text-primary underline cursor-help">Hover for Tooltip</span>
                  </Tooltip>
                </div>

                <div className="space-y-3 pt-2">
                  <Progress value={65} showLabel />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* 4. FORM CONTROLS TAB */}
          <TabPanel id="forms" activeTab={activeTab} className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-foreground">Accessible Form Inputs & Validation</h3>

              <FormSection
                title="Participant Intake Demonstration"
                description="Form components with proper labeling, help text, required indicators, and validation error messages."
                badge={<Badge variant="outline" size="sm">Standard Intake</Badge>}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name (National ID or Record)"
                    required
                    helperText="Enter as shown on patient records."
                  >
                    <Input placeholder="e.g. Mohammad Rafiqul Islam" defaultValue="Mohammad Rafiqul Islam" />
                  </FormField>

                  <FormField
                    label="Patient Identifier Code"
                    required
                    error="Invalid format. Must follow BD-DHK-XXXX syntax."
                  >
                    <Input placeholder="BD-DHK-0000" defaultValue="INVALID_FORMAT" />
                  </FormField>

                  <FormField label="Clinical Division / Region">
                    <Select
                      options={[
                        { value: 'dhaka', label: 'Dhaka Division' },
                        { value: 'chattogram', label: 'Chattogram Division' },
                        { value: 'sylhet', label: 'Sylhet Division' },
                        { value: 'rajshahi', label: 'Rajshahi Division' },
                      ]}
                    />
                  </FormField>

                  <FormField label="Secure Verification Key">
                    <Input type="password" placeholder="Enter clinical pin..." defaultValue="SecretPass123" />
                  </FormField>
                </div>

                <FormField label="Clinical Observations & Notes" helperText="Maximum 500 characters">
                  <Textarea placeholder="Document reported cough duration, sputum characteristics, and family history..." maxLength={500} showCount />
                </FormField>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/60">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Smoking History Stratification</span>
                    <RadioGroup
                      name="smoking_status"
                      value={radioValue}
                      onChange={setRadioValue}
                      options={[
                        { value: 'smoker_current', label: 'Current Smoker (>20 Pack-Years)' },
                        { value: 'smoker_former', label: 'Former Smoker (Quit <15 years)' },
                        { value: 'smoker_never', label: 'Never Smoker' },
                      ]}
                    />
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Preferences & Consent</span>
                    <Checkbox
                      checked={checkboxState}
                      onChange={(e) => setCheckboxState(e.target.checked)}
                      label="Patient Privacy Consent Obtained"
                      description="Confirmed data storage for clinical decision support."
                    />
                    <Switch
                      checked={switchState}
                      onChange={(e) => setSwitchState(e.target.checked)}
                      label="Automated Triage Notifications"
                      description="Send SMS alerts for high-risk triage status."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <FileUpload />
                </div>
              </FormSection>
            </div>
          </TabPanel>

          {/* 5. FEEDBACK & DIALOGS TAB */}
          <TabPanel id="feedback" activeTab={activeTab} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Alert Banners</h3>
              <div className="grid grid-cols-1 gap-3">
                <Alert variant="info">
                  <AlertTitle>Clinical Information</AlertTitle>
                  <AlertDescription>
                    Screening eligibility models are calibrated for individuals aged 50–80 with a 20+ pack-year history.
                  </AlertDescription>
                </Alert>
                <Alert variant="success">
                  <AlertTitle>Screening Report Signed</AlertTitle>
                  <AlertDescription>
                    The multi-disciplinary review was successfully verified and dispatched to the oncology registry.
                  </AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertTitle>Missing Air Quality Exposure Metric</AlertTitle>
                  <AlertDescription>
                    Geographic PM2.5 coordinates were unavailable. Default divisional baseline was applied.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Critical Hemoptysis Red-Flag Detected</AlertTitle>
                  <AlertDescription>
                    Immediate clinical escalation required within 24 hours. Patient referred for emergency consult.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-foreground">Interactive Modals & Toasts</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" onClick={() => setIsModalOpen(true)}>
                  Open Clinical Modal
                </Button>
                <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                  Open Confirmation Dialog
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    addToast({
                      title: "Assessment Saved",
                      description: "Patient responses saved to secure cache.",
                      type: "success",
                    })
                  }
                >
                  Trigger Success Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    addToast({
                      title: "Triage Alert Dispatched",
                      description: "Emergency referral sent to NICRH Dhaka.",
                      type: "warning",
                    })
                  }
                >
                  Trigger Warning Toast
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <EmptyState
                title="No Pending Referrals"
                description="All triage cases for this division have been addressed."
                action={<Button size="xs" variant="outline">Refresh Queue</Button>}
              />
              <ErrorState
                title="Telemetry Timeout"
                message="Unable to connect to regional diagnostic server."
                onRetry={() => {}}
              />
              <LoadingState
                message="Calculating Risk Stratification..."
                subMessage="Evaluating Bach and PLCOm2012 models."
              />
            </div>

            {/* Dialog Demonstration */}
            <Dialog
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Clinical Assessment Overview"
              description="Review patient screening parameters before exporting to National Registry."
              footer={
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Button size="sm" onClick={() => setIsModalOpen(false)}>
                    Confirm & Proceed
                  </Button>
                </>
              }
            >
              <div className="space-y-3 text-sm">
                <p>
                  This modal demonstrates keyboard trapping, escape handling, and accessible ARIA bindings.
                </p>
                <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>Patient ID:</span>
                    <span>BD-DHK-1044</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Risk Level:</span>
                    <span className="text-destructive font-bold">High / Red-Flag</span>
                  </div>
                </div>
              </div>
            </Dialog>

            {/* Confirm Dialog Demonstration */}
            <ConfirmDialog
              open={isConfirmOpen}
              onClose={() => setIsConfirmOpen(false)}
              onConfirm={() => {
                setIsConfirmOpen(false)
                addToast({ title: "Record Deleted", type: "error" })
              }}
              title="Delete Assessment Record?"
              description="Are you certain you want to purge this test assessment? This action will be permanently recorded in the audit trail."
              variant="destructive"
            />
          </TabPanel>

          {/* 6. CLINICAL DATA & TABLES TAB */}
          <TabPanel id="data" activeTab={activeTab} className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-foreground">
                  Responsive Data Presentation Table
                </h3>
                <div className="w-full sm:w-72">
                  <SearchBar placeholder="Filter records..." />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Patient Demographic</TableHead>
                    <TableHead>Acuity / Risk Tier</TableHead>
                    <TableHead>Guideline Status</TableHead>
                    <TableHead>Reviewing Clinician</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-semibold text-primary">BD-DHK-1044</TableCell>
                    <TableCell>Kamal Hossain (62M)</TableCell>
                    <TableCell><RiskBadge tier="critical" /></TableCell>
                    <TableCell><StatusBadge status="pending" /></TableCell>
                    <TableCell>Prof. Dr. M. K. Rahman</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="xs">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-semibold text-primary">BD-DHK-1042</TableCell>
                    <TableCell>Md. Rafiqul Islam (58M)</TableCell>
                    <TableCell><RiskBadge tier="high" /></TableCell>
                    <TableCell><StatusBadge status="in_review" /></TableCell>
                    <TableCell>Dr. Farhana Ahmed</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="xs">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-semibold text-primary">BD-DHK-1043</TableCell>
                    <TableCell>Nasima Begum (49F)</TableCell>
                    <TableCell><RiskBadge tier="moderate" /></TableCell>
                    <TableCell><StatusBadge status="completed" /></TableCell>
                    <TableCell>Dr. Farhana Ahmed</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="xs">View</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={4}
                onPageChange={setCurrentPage}
                totalItems={36}
                pageSize={10}
              />
            </div>
          </TabPanel>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <DesignSystemContent />
    </ToastProvider>
  )
}
