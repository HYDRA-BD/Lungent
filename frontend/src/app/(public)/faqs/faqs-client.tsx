'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  Search,
  ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useLanguage } from '@/i18n'
import { FAQS_DATA } from '@/lib/data/faq-content'
import { cn } from '@/lib/utils'

export function FAQsClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: dict.faqs.filterAll },
    { id: 'general', label: dict.faqs.categories.general },
    { id: 'clinical', label: dict.faqs.categories.clinical },
    { id: 'screening', label: dict.faqs.categories.screening },
    { id: 'privacy', label: dict.faqs.categories.privacy },
    { id: 'account', label: dict.faqs.categories.account },
  ]

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      if (!query) return matchesCategory

      const matchesQuestion =
        item.questionEn.toLowerCase().includes(query) || item.questionBn.toLowerCase().includes(query)
      const matchesAnswer =
        item.answerEn.toLowerCase().includes(query) || item.answerBn.toLowerCase().includes(query)

      return matchesCategory && (matchesQuestion || matchesAnswer)
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-16 py-10 sm:py-16">
        {/* Page Hero */}
        <SectionContainer size="lg">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="default" className="text-xs">
              <HelpCircle className="size-3.5 mr-1.5" />
              <span>{isBn ? 'সরাসরি প্রশ্নোত্তর' : 'Patient & Clinician FAQs'}</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.faqs.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {dict.faqs.subtitle}
            </p>
          </div>
        </SectionContainer>

        {/* Search & Category Filter Toolbar */}
        <SectionContainer size="lg">
          <div className="space-y-5 max-w-3xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'প্রশ্ন বা উত্তর খুঁজুন...' : 'Search questions or keywords...'}
                className="pl-12 h-13 text-base bg-card rounded-2xl shadow-xs"
                aria-label="Search FAQs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm font-bold scale-105'
                        : 'bg-muted/70 text-slate-700 dark:text-slate-300 hover:bg-muted hover:text-foreground border border-border/80'
                    )}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </SectionContainer>

        {/* FAQs Accordion */}
        <SectionContainer size="lg">
          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-muted/20 rounded-3xl border border-dashed border-border">
                <HelpCircle className="size-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold text-foreground">
                  {dict.common.noResults}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? 'আপনার অনুসন্ধানের সাথে কোনো প্রশ্ন মেলেনি। অন্য শব্দ বা বিষয় নির্বাচন করে চেষ্টা করুন।'
                    : 'No questions matched your search criteria. Try a different query.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  Reset Search
                </Button>
              </div>
            ) : (
              <Accordion type="single" className="shadow-xs">
                {filteredFaqs.map((faq) => {
                  const question = isBn ? faq.questionBn : faq.questionEn
                  const answer = isBn ? faq.answerBn : faq.answerEn

                  return (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger value={faq.id}>
                        {question}
                      </AccordionTrigger>
                      <AccordionContent value={faq.id}>
                        <div className="whitespace-pre-line leading-relaxed">
                          {answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </div>
        </SectionContainer>

        {/* Still Have Questions Box */}
        <SectionContainer size="lg">
          <div className="rounded-3xl border border-border bg-muted/20 p-8 sm:p-10 text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-foreground">
              {isBn ? 'অন্য কোনো প্রশ্ন আছে?' : 'Still Have Questions?'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isBn
                ? 'আমাদের কারিগরি সহায়তা দল বা ক্লিনিক্যাল গভর্নেন্স টিমের সাথে যোগাযোগ করতে পারেন।'
                : 'Reach out to our technical assistance or clinical governance team for further information.'}
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className={buttonVariants({ variant: 'default', size: 'lg' })}
              >
                <span>{isBn ? 'যোগাযোগ পাতায় যান' : 'Contact Support Team'}</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
