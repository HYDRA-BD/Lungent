'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'motion/react'
import {
  Mail,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle2,
  Building2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/i18n'

const TARGET_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@lungent.org'

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  category: z.enum(['general', 'pilot', 'support', 'feedback', 'governance'], {
    error: 'Please select an inquiry category',
  }),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message cannot exceed 2000 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactClient() {
  const { dict } = useLanguage()

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastMailtoUrl, setLastMailtoUrl] = useState('')
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(null)
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      category: 'general',
      message: '',
    },
  })

  const copyToClipboard = (text: string, channelKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedChannel(channelKey)
    setTimeout(() => setCopiedChannel(null), 2500)
  }

  const categoryLabels: Record<string, string> = {
    general: 'General Platform Inquiry',
    pilot: 'Healthcare Facility / Pilot Inquiry',
    support: 'Technical Support',
    feedback: 'Feedback & Accessibility',
    governance: 'Clinical Governance & Research',
  }

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    const categoryName = categoryLabels[data.category] || data.category

    const subject = encodeURIComponent(`[Lungent Inquiry] ${categoryName} — ${data.fullName}`)
    const body = encodeURIComponent(
      `Full Name: ${data.fullName}\n` +
      `Email: ${data.email}\n` +
      `Inquiry Category: ${categoryName}\n\n` +
      `Message:\n${data.message}\n\n` +
      `---\nDispatched via Lungent Clinical AI Platform`
    )

    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`
    setLastMailtoUrl(mailtoUrl)
    setSubmittedData(data)

    // Simulate clean dispatch state
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsSubmitting(false)
    setIsSubmitted(true)

    // Trigger email client directly
    try {
      window.location.href = mailtoUrl
    } catch {
      // Handled by manual button in UI
    }
  }

  const handleResetForm = () => {
    setIsSubmitted(false)
    setSubmittedData(null)
    setLastMailtoUrl('')
    reset()
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Ambient Respiration & Floating Glow (Pulmonary AI Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[680px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-3xl animate-lung-breathe" />
        <div
          className="absolute top-28 right-1/4 w-80 h-80 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl animate-lung-breathe"
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-12 sm:py-20">
        {/* Page Hero with Staggered Entrance */}
        <SectionContainer size="lg">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4.5 py-1.5 text-sm sm:text-[15px] font-semibold text-primary border border-primary/20 shadow-xs hover:border-primary/40 transition-colors"
            >
              <Mail className="size-4 text-primary animate-pulse" aria-hidden="true" />
              <span>Platform Support & Direct Inquiries</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.12]"
            >
              <span>Contact &</span>{' '}
              <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent inline-block">
                Support
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              Reach out to the Lungent platform governance, clinical operations, and technical support teams.
            </motion.p>
          </div>
        </SectionContainer>

        {/* Emergency & Medical Privacy Warning Banner */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            {/* Emergency Hospital Care Warning */}
            <div className="rounded-2xl border border-rose-300/60 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-6 flex items-start gap-4 text-sm shadow-xs hover:border-rose-400 dark:hover:border-rose-800 transition-colors">
              <div className="size-11 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-bold text-rose-700 dark:text-rose-300 text-base">
                  Acute Emergency Protocol
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {dict.common.emergencyNotice}
                </p>
              </div>
            </div>

            {/* Medical Data Privacy Warning */}
            <div className="rounded-2xl border border-amber-300/60 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-6 flex items-start gap-4 text-sm shadow-xs hover:border-amber-400 dark:hover:border-amber-800 transition-colors">
              <div className="size-11 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="size-5" />
              </div>
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-base">
                  {dict.contact.securityWarningTitle}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {dict.contact.securityWarningBody}
                </p>
              </div>
            </div>
          </motion.div>
        </SectionContainer>

        {/* Form and Verified Channels Grid */}
        <SectionContainer size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
            {/* Left Column: Verified Channels (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 space-y-6"
            >
              <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="size-5" />
                    </span>
                    <span>{dict.contact.verifiedChannelsTitle}</span>
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-300 mt-1">
                    Verified official communication channels for platform operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {/* Direct Lead Inbox */}
                  <div className="p-4 rounded-xl border border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-primary/10 space-y-1.5 hover:border-primary/60 hover:bg-primary/10 transition-all group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <Mail className="size-4 text-primary" />
                        <span>Direct Lead Inbox</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(TARGET_EMAIL, 'lead')}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium px-2 py-0.5 rounded-md hover:bg-primary/10 transition-colors"
                        title="Copy email"
                      >
                        {copiedChannel === 'lead' ? (
                          <>
                            <Check className="size-3 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <a
                      href={`mailto:${TARGET_EMAIL}`}
                      className="text-sm font-semibold text-primary hover:underline block break-all"
                    >
                      {TARGET_EMAIL}
                    </a>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      Primary administrative address receiving all direct platform submissions.
                    </p>
                  </div>

                  {/* Support Email */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01] transition-all group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <Mail className="size-4 text-primary" />
                        <span>Technical Support</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(dict.contact.supportEmail, 'support')}
                        className="text-xs text-slate-500 hover:text-foreground flex items-center gap-1 font-medium px-2 py-0.5 rounded-md hover:bg-muted transition-colors"
                        title="Copy email"
                      >
                        {copiedChannel === 'support' ? (
                          <>
                            <Check className="size-3 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <a
                      href={`mailto:${dict.contact.supportEmail}`}
                      className="text-sm font-semibold text-primary hover:underline block"
                    >
                      {dict.contact.supportEmail}
                    </a>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {dict.contact.supportEmailDesc}
                    </p>
                  </div>

                  {/* Governance Email */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01] transition-all group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <Building2 className="size-4 text-primary" />
                        <span>Clinical Governance</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(dict.contact.governanceEmail, 'gov')}
                        className="text-xs text-slate-500 hover:text-foreground flex items-center gap-1 font-medium px-2 py-0.5 rounded-md hover:bg-muted transition-colors"
                        title="Copy email"
                      >
                        {copiedChannel === 'gov' ? (
                          <>
                            <Check className="size-3 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <a
                      href={`mailto:${dict.contact.governanceEmail}`}
                      className="text-sm font-semibold text-primary hover:underline block"
                    >
                      {dict.contact.governanceEmail}
                    </a>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {dict.contact.governanceEmailDesc}
                    </p>
                  </div>

                  {/* Response Time SLA */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 pt-2 px-1">
                    <Clock className="size-4 text-primary shrink-0" />
                    <span>{dict.contact.responseTime}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Transparency Notice */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed shadow-xs">
                <p className="font-bold text-foreground mb-1 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="size-4 text-primary" /> Transparency Standard:
                </p>
                Lungent publishes strictly verified communication channels. All submissions are directed to verified governance leads without third-party ad tracking or commercial intermediaries.
              </div>
            </motion.div>

            {/* Right Column: Contact Inquiry Form (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-7"
            >
              <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {dict.contact.formTitle}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-300 mt-1">
                    Direct your inquiry to our platform coordination inbox (<span className="font-mono text-xs text-primary font-bold">{TARGET_EMAIL}</span>).
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <AnimatePresence mode="wait">
                    {isSubmitted ? (
                      <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35 }}
                        className="py-6 space-y-6"
                      >
                        {/* Green Success Banner */}
                        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center space-y-3">
                          <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                            <CheckCircle2 className="size-7" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                              Inquiry Ready to Dispatch
                            </h3>
                            <p className="text-sm text-emerald-800/90 dark:text-emerald-300/90 max-w-md mx-auto leading-relaxed">
                              Your message has been formatted for{' '}
                              <span className="font-mono font-bold text-emerald-950 dark:text-emerald-100">{TARGET_EMAIL}</span>{' '}
                              and opened in your default email client.
                            </p>
                          </div>
                        </div>

                        {/* Submission Summary */}
                        {submittedData && (
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                            <p className="font-semibold text-foreground text-sm">Submission Summary:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                              <div><span className="font-medium text-slate-900 dark:text-slate-100">From:</span> {submittedData.fullName}</div>
                              <div><span className="font-medium text-slate-900 dark:text-slate-100">Reply-To:</span> {submittedData.email}</div>
                              <div className="sm:col-span-2">
                                <span className="font-medium text-slate-900 dark:text-slate-100">Category:</span> {categoryLabels[submittedData.category] || submittedData.category}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-slate-500 dark:text-slate-400 italic line-clamp-3">
                                &quot;{submittedData.message}&quot;
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          {lastMailtoUrl && (
                            <a
                              href={lastMailtoUrl}
                              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 hover:scale-[1.02] shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
                            >
                              <ExternalLink className="size-4" />
                              Re-open in Email Client
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="default"
                            onClick={handleResetForm}
                            className="py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                          >
                            <RotateCcw className="size-4" />
                            Send Another Message
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="contact-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                        noValidate
                      >
                        {/* Name */}
                        <FormField
                          label={dict.contact.nameLabel}
                          required
                          error={errors.fullName?.message}
                        >
                          <Input
                            placeholder={dict.contact.namePlaceholder}
                            {...register('fullName')}
                            disabled={isSubmitting}
                            className="h-11 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-base"
                          />
                        </FormField>

                        {/* Email */}
                        <FormField
                          label={dict.contact.emailLabel}
                          required
                          error={errors.email?.message}
                        >
                          <Input
                            type="email"
                            placeholder={dict.contact.emailPlaceholder}
                            {...register('email')}
                            disabled={isSubmitting}
                            className="h-11 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-base"
                          />
                        </FormField>

                        {/* Category */}
                        <FormField
                          label={dict.contact.categoryLabel}
                          required
                          error={errors.category?.message}
                        >
                          <Select
                            {...register('category')}
                            disabled={isSubmitting}
                            className="h-11 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-base"
                            options={[
                              { value: 'general', label: dict.contact.categories.general },
                              { value: 'pilot', label: dict.contact.categories.pilot },
                              { value: 'support', label: dict.contact.categories.support },
                              { value: 'feedback', label: dict.contact.categories.feedback },
                              { value: 'governance', label: dict.contact.categories.governance },
                            ]}
                          />
                        </FormField>

                        {/* Message */}
                        <FormField
                          label={dict.contact.messageLabel}
                          required
                          error={errors.message?.message}
                        >
                          <Textarea
                            rows={5}
                            placeholder={dict.contact.messagePlaceholder}
                            {...register('message')}
                            disabled={isSubmitting}
                            className="rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-base leading-relaxed"
                          />
                        </FormField>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
                          >
                            {isSubmitting ? (
                              <>
                                <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                <span>{dict.contact.submitting}</span>
                              </>
                            ) : (
                              <>
                                <span>{dict.contact.submitButton}</span>
                                <Send className="size-4" />
                              </>
                            )}
                          </button>
                          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                            Submissions are securely routed to{' '}
                            <span className="font-semibold text-foreground">{TARGET_EMAIL}</span>
                          </p>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
