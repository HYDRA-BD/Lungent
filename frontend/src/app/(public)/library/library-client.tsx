'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BookOpen,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
} from 'lucide-react'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'
import { SectionContainer } from '@/components/layouts/section-container'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useLanguage } from '@/i18n'
import { LIBRARY_ARTICLES, type LibraryArticle } from '@/lib/data/library-content'
import { cn } from '@/lib/utils'

export function LibraryClient() {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: dict.library.allCategories },
    { id: 'basics', label: dict.library.categories.basics },
    { id: 'risks', label: dict.library.categories.risks },
    { id: 'symptoms', label: dict.library.categories.symptoms },
    { id: 'screening', label: dict.library.categories.screening },
    { id: 'prevention', label: dict.library.categories.prevention },
  ]

  const filteredArticles = useMemo(() => {
    return LIBRARY_ARTICLES.filter((article) => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      if (!query) return matchesCategory

      const matchesTitle =
        article.titleEn.toLowerCase().includes(query) || article.titleBn.toLowerCase().includes(query)
      const matchesSummary =
        article.summaryEn.toLowerCase().includes(query) || article.summaryBn.toLowerCase().includes(query)
      const matchesTags = article.tags.some((t) => t.toLowerCase().includes(query))

      return matchesCategory && (matchesTitle || matchesSummary || matchesTags)
    })
  }, [selectedCategory, searchQuery])

  const toggleExpand = (id: string) => {
    setExpandedArticleId((prev) => (prev === id ? null : id))
  }

  const getCategoryBadge = (category: LibraryArticle['category']) => {
    switch (category) {
      case 'basics':
        return <Badge variant="outline" className="border-border font-semibold text-xs">{dict.library.categories.basics}</Badge>
      case 'risks':
        return <Badge variant="destructive" className="font-semibold text-xs">{dict.library.categories.risks}</Badge>
      case 'symptoms':
        return <Badge variant="warning" className="font-semibold text-xs">{dict.library.categories.symptoms}</Badge>
      case 'screening':
        return <Badge variant="info" className="font-semibold text-xs">{dict.library.categories.screening}</Badge>
      case 'prevention':
        return <Badge variant="success" className="font-semibold text-xs">{dict.library.categories.prevention}</Badge>
      default:
        return <Badge variant="outline" className="font-semibold text-xs">{category}</Badge>
    }
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
              <BookOpen className="size-4 text-primary animate-pulse" aria-hidden="true" />
              <span>{isBn ? 'প্রমাণ-ভিত্তিক স্বাস্থ্য শিক্ষা' : 'Evidence-Based Patient Education'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-sans leading-[1.12]"
            >
              <span>{isBn ? 'ফুসফুস স্বাস্থ্য' : 'Lung Health'}</span>{' '}
              <span className="bg-gradient-to-r from-primary via-teal-600 to-sky-600 bg-clip-text text-transparent inline-block">
                {isBn ? 'তথ্য ভাণ্ডার' : 'Information Library'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {dict.library.subtitle}
            </motion.p>
          </div>
        </SectionContainer>

        {/* Search & Filter Toolbar */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.library.searchPlaceholder}
                className="pl-12 h-14 text-base bg-card rounded-2xl shadow-xs border-border/80 focus-visible:ring-primary/30"
                aria-label={dict.library.searchPlaceholder}
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
          </motion.div>
        </SectionContainer>

        {/* Educational Articles Grid */}
        <SectionContainer size="lg">
          {filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border max-w-xl mx-auto p-8"
            >
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {dict.common.noResults}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isBn
                  ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো বিষয় পাওয়া যায়নি। ভিন্ন শব্দ ব্যবহার করে পুনরায় চেষ্টা করুন।'
                  : 'Try adjusting your search terms or selecting "All Topics" to see available resources.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="rounded-xl font-semibold cursor-pointer"
              >
                Reset Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {filteredArticles.map((article, index) => {
                const isExpanded = expandedArticleId === article.id
                const title = isBn ? article.titleBn : article.titleEn
                const summary = isBn ? article.summaryBn : article.summaryEn
                const content = isBn ? article.contentBn : article.contentEn
                const takeaway = isBn ? article.keyTakeawayBn : article.keyTakeawayEn

                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: (index % 4) * 0.08 }}
                    whileHover={{ y: -4 }}
                    className={cn(isExpanded ? 'md:col-span-2' : '')}
                  >
                    <Card
                      className={cn(
                        'h-full transition-all duration-200 flex flex-col justify-between rounded-3xl border-border/80 bg-card shadow-xs hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50',
                        isExpanded ? 'border-primary ring-1 ring-primary/20' : ''
                      )}
                    >
                      <CardHeader className="space-y-3 pb-4">
                        <div className="flex items-center justify-between gap-2">
                          {getCategoryBadge(article.category)}
                          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <FileText className="size-3.5" />
                            {isBn ? 'ক্লিনিক্যাল গাইডেন্স' : 'Patient Literacy'}
                          </span>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                          {title}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                          {summary}
                        </CardDescription>
                      </CardHeader>

                      {/* Expanded Article Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent className="space-y-4 pt-3 border-t border-border/60 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                              {content.map((paragraph, pIndex) => (
                                <p key={pIndex} className="whitespace-pre-line">
                                  {paragraph}
                                </p>
                              ))}

                              {/* Key Takeaway Callout */}
                              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-1.5 text-sm sm:text-[15px]">
                                <p className="font-bold text-primary flex items-center gap-2">
                                  <Sparkles className="size-4" />
                                  <span>{isBn ? 'মূল শিক্ষণীয় বিষয়' : 'Key Clinical Takeaway'}</span>
                                </p>
                                <p className="text-foreground font-medium leading-relaxed">{takeaway}</p>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap items-center gap-2 pt-2">
                                <Tag className="size-3.5 text-muted-foreground mr-1" />
                                {article.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-lg text-muted-foreground"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(article.id)}
                          className="text-sm sm:text-[15px] font-bold text-primary hover:text-primary/80 p-0 h-auto cursor-pointer hover:bg-transparent"
                        >
                          <span>{isExpanded ? (isBn ? 'সংক্ষেপ করুন' : 'Show Less') : (isBn ? 'বিস্তারিত পড়ুন' : dict.library.readArticle)}</span>
                          {isExpanded ? (
                            <ChevronUp className="size-4 ml-1" />
                          ) : (
                            <ChevronDown className="size-4 ml-1" />
                          )}
                        </Button>

                        <span className="text-xs text-muted-foreground font-medium">
                          {isBn ? 'সচেতনতামূলক নথি' : 'Educational Guide'}
                        </span>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </SectionContainer>

        {/* Educational Disclaimer Bottom Note */}
        <SectionContainer size="lg">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border/80 bg-muted/30 p-6 sm:p-8 text-center text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto space-y-2 shadow-xs"
          >
            <p className="font-bold text-foreground text-sm sm:text-base">
              {isBn ? 'স্বাস্থ্য তথ্য পর্যালোচনা বিজ্ঞপ্তি' : 'Health Literacy Quality Standard'}
            </p>
            <p className="leading-relaxed">{dict.library.reviewedNote}</p>
          </motion.div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
