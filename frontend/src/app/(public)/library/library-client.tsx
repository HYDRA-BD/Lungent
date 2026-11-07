'use client'

import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
        return <Badge variant="outline">{dict.library.categories.basics}</Badge>
      case 'risks':
        return <Badge variant="destructive">{dict.library.categories.risks}</Badge>
      case 'symptoms':
        return <Badge variant="warning">{dict.library.categories.symptoms}</Badge>
      case 'screening':
        return <Badge variant="info">{dict.library.categories.screening}</Badge>
      case 'prevention':
        return <Badge variant="success">{dict.library.categories.prevention}</Badge>
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-16 py-10 sm:py-16">
        {/* Page Hero */}
        <SectionContainer size="lg">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="default" className="text-xs">
              <BookOpen className="size-3.5 mr-1.5" />
              <span>{isBn ? 'প্রমাণ-ভিত্তিক স্বাস্থ্য শিক্ষা' : 'Evidence-Based Patient Education'}</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {dict.library.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {dict.library.subtitle}
            </p>
          </div>
        </SectionContainer>

        {/* Search & Filter Toolbar */}
        <SectionContainer size="lg">
          <div className="space-y-5 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.library.searchPlaceholder}
                className="pl-12 h-13 text-base bg-card rounded-2xl shadow-xs"
                aria-label={dict.library.searchPlaceholder}
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

        {/* Educational Articles Grid */}
        <SectionContainer size="lg">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-muted/20 rounded-3xl border border-dashed border-border max-w-xl mx-auto">
              <BookOpen className="size-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                {dict.common.noResults}
              </h3>
              <p className="text-xs text-muted-foreground">
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
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id
                const title = isBn ? article.titleBn : article.titleEn
                const summary = isBn ? article.summaryBn : article.summaryEn
                const content = isBn ? article.contentBn : article.contentEn
                const takeaway = isBn ? article.keyTakeawayBn : article.keyTakeawayEn

                return (
                  <Card
                    key={article.id}
                    className={cn(
                      'transition-all flex flex-col justify-between',
                      isExpanded ? 'border-primary shadow-sm md:col-span-2' : 'hover:border-primary/40'
                    )}
                  >
                    <CardHeader className="space-y-3 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        {getCategoryBadge(article.category)}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {isBn ? 'ক্লিনিক্যাল গাইডেন্স' : 'Patient Literacy'}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold leading-snug">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                        {summary}
                      </CardDescription>
                    </CardHeader>

                    {/* Expanded Article Body */}
                    {isExpanded && (
                      <CardContent className="space-y-4 pt-3 border-t border-border/60 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed animate-in fade-in-50 duration-150">
                        {content.map((paragraph, index) => (
                          <p key={index} className="whitespace-pre-line">
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
                              {t}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    )}

                    <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(article.id)}
                        className="text-sm sm:text-[15px] font-bold text-primary hover:text-primary/80 p-0 h-auto cursor-pointer"
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
                )
              })}
            </div>
          )}
        </SectionContainer>

        {/* Educational Disclaimer Bottom Note */}
        <SectionContainer size="lg">
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 text-center text-xs text-muted-foreground max-w-2xl mx-auto space-y-1">
            <p className="font-semibold text-foreground">
              {isBn ? 'স্বাস্থ্য তথ্য পর্যালোচনা বিজ্ঞপ্তি' : 'Health Literacy Quality Standard'}
            </p>
            <p>{dict.library.reviewedNote}</p>
          </div>
        </SectionContainer>
      </main>

      <Footer />
    </div>
  )
}
