'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle2,
  Building2,
  Sparkles,
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
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const onSubmit = async () => {
    setIsSubmitting(true)
    // Simulate secure client-side dispatch without external exposure
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setIsSubmitted(true)
    reset()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-16 py-10 sm:py-16">
        {/* Page Hero */}
        <SectionContainer size="lg">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="default" className="text-xs">
              <Mail className="size-3.5 mr-1.5" />
              <span>{isBn ? 'যোগাযোগ ও সহায়তা মাধ্যম' : 'Platform Support & Channels'}</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.contact.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {dict.contact.subtitle}
            </p>
          </div>
        </SectionContainer>

        {/* Emergency & Medical Privacy Warning Banner */}
        <SectionContainer size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Emergency Hospital Care Warning */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-4 text-sm">
              <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-bold text-destructive text-base">
                  {isBn ? 'জরুরি চিকিৎসা বিষয়ক সতর্কতা' : 'Acute Emergency Protocol'}
                </p>
                <p className="text-muted-foreground text-sm">
                  {dict.common.emergencyNotice}
                </p>
              </div>
            </div>

            {/* Medical Data Privacy Warning */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4 text-sm">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="size-5" />
              </div>
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-bold text-amber-900 dark:text-amber-200 text-base">
                  {dict.contact.securityWarningTitle}
                </p>
                <p className="text-muted-foreground text-sm">
                  {dict.contact.securityWarningBody}
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Form and Verified Channels Grid */}
        <SectionContainer size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
            {/* Left Column: Verified Channels (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span>{dict.contact.verifiedChannelsTitle}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'শুধুমাত্র অনুমোদিত প্রাতিষ্ঠানিক ইমেইল চ্যানেলে যোগাযোগ করুন।'
                      : 'Verified official communication channels for platform operations.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1 text-xs">
                  {/* Support Email */}
                  <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Mail className="size-3.5 text-primary" />
                      <a href={`mailto:${dict.contact.supportEmail}`} className="text-primary hover:underline">
                        {dict.contact.supportEmail}
                      </a>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {dict.contact.supportEmailDesc}
                    </p>
                  </div>

                  {/* Governance Email */}
                  <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Building2 className="size-3.5 text-primary" />
                      <a href={`mailto:${dict.contact.governanceEmail}`} className="text-primary hover:underline">
                        {dict.contact.governanceEmail}
                      </a>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {dict.contact.governanceEmailDesc}
                    </p>
                  </div>

                  {/* Response Time SLA */}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>{dict.contact.responseTime}</span>
                  </div>
                </CardContent>
              </Card>

              {/* No Invented Details Notice */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-[11px] text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-0.5">
                  {isBn ? 'স্বচ্ছতা ও সুরক্ষা নীতি:' : 'Transparency Standard:'}
                </p>
                {isBn
                  ? 'লানজেন্ট শুধুমাত্র যাচাইকৃত ডিজিটাল যোগাযোগ মাধ্যম পরিচালনা করে। কোনো ভুয়া ফোন নম্বর, ব্যক্তিগত ঠিকানা বা অননুমোদিত অনুমোদন প্রদর্শন করা হয় না।'
                  : 'Lungent publishes only strictly verified communication channels. We do not invent fake physical addresses, phone numbers, or unverified hospital affiliations.'}
              </div>
            </div>

            {/* Right Column: Contact Inquiry Form (7 cols) */}
            <div className="lg:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{dict.contact.formTitle}</CardTitle>
                  <CardDescription className="text-xs">
                    {dict.contact.formSubtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {isSubmitted ? (
                    <div className="py-8 text-center space-y-4">
                      <div className="size-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                        <CheckCircle2 className="size-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-foreground">
                          {dict.contact.successTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                          {dict.contact.successMessage}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSubmitted(false)}
                      >
                        {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                          rows={4}
                          placeholder={dict.contact.messagePlaceholder}
                          {...register('message')}
                          disabled={isSubmitting}
                        />
                      </FormField>

                      <Button
                        type="submit"
                        variant="default"
                        size="default"
                        loading={isSubmitting}
                        className="w-full"
                        rightIcon={<Send className="size-3.5" />}
                      >
                        {isSubmitting ? dict.contact.submitting : dict.contact.submitButton}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
