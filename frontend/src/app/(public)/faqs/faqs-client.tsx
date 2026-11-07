'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  HelpCircle,
  Search,
  ArrowRight,
  MessageSquare,
  FileQuestion,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useLanguage } from '@/i18n'
import { FAQS_DATA, type FAQItem } from '@/lib/data/faq-content'
import { cn } from '@/lib/utils'

export function FAQsClient() {
  const { dict } = useLanguage()

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
    return FAQS_DATA.filter((faq: FAQItem) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      if (!query) return matchesCategory

      const matchesQuestion = faq.questionEn.toLowerCase().includes(query)
      const matchesAnswer = faq.answerEn.toLowerCase().includes(query)

      return matchesCategory && (matchesQuestion || matchesAnswer)
    })
  }, [selectedCategory, searchQuery])

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
              <FileQuestion className="size-4 text-primary animate-pulse" aria-hidden="true" />
              <span>Patient & Clinician FAQs</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.12]"
            >
              <span>Frequently Asked</span>{' '}
              <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent inline-block">
                Questions
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {dict.faqs.subtitle}
            </motion.p>
          </div>
        </SectionContainer>

        {/* Search & Category Filter Toolbar */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords..."
                className="pl-12 h-14 text-base bg-card dark:bg-slate-900 rounded-2xl shadow-xs border-border/80 dark:border-slate-800 focus-visible:ring-primary/30"
                aria-label="Search questions or keywords"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-md hover:bg-muted"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center flex-wrap">
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
                        : 'bg-muted/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground border border-border/80 dark:border-slate-800'
                    )}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </SectionContainer>

        {/* FAQ Accordion List */}
        <SectionContainer size="lg">
          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-4 bg-muted/20 dark:bg-slate-900/40 rounded-3xl border border-dashed border-border dark:border-slate-800 p-8"
              >
                <div className="size-12 rounded-2xl bg-muted dark:bg-slate-800 flex items-center justify-center mx-auto text-muted-foreground">
                  <HelpCircle className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {dict.common.noResults}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Try adjusting your search terms or selecting &quot;All Questions&quot; to see available questions.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="rounded-xl font-semibold cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Reset Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
              >
                <Accordion type="single" className="shadow-xs space-y-3">
                  {filteredFaqs.map((faq: FAQItem) => {
                    const question = faq.questionEn
                    const answer = faq.answerEn

                    return (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900 px-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                      >
                        <AccordionTrigger value={faq.id} className="text-base font-bold text-foreground py-4 hover:no-underline">
                          {question}
                        </AccordionTrigger>
                        <AccordionContent value={faq.id} className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed pb-4 pt-1 border-t border-border/40 dark:border-slate-800">
                          {answer}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </motion.div>
            )}
          </div>
        </SectionContainer>

        {/* Support Section */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-primary/25 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto shadow-xs"
          >
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
              <MessageSquare className="size-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Still Have Questions?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                Reach out to our clinical engineering team or submit feedback on our algorithms.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className={buttonVariants({
                  variant: 'default',
                  size: 'lg',
                  className: 'rounded-xl font-bold shadow-md hover:scale-105 active:scale-98 transition-all',
                })}
              >
                <span>Contact Support</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
