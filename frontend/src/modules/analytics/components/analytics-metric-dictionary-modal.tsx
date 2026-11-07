'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getAllMetricDefinitions } from '../metric-dictionary'
import type { MetricDefinition } from '../types'
import { useLanguage } from '@/i18n'
import { Search, AlertCircle, RefreshCw } from 'lucide-react'

export interface AnalyticsMetricDictionaryModalProps {
  isOpen: boolean
  onClose: () => void
  initialMetricId?: string
}

export function AnalyticsMetricDictionaryModal({
  isOpen,
  onClose,
  initialMetricId,
}: AnalyticsMetricDictionaryModalProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const metrics: MetricDefinition[] = getAllMetricDefinitions()

  const categories = [
    { id: 'all', labelEn: 'All Categories', labelBn: 'সকল বিভাগ' },
    { id: 'patient', labelEn: 'Patient Demographics', labelBn: 'রোগী জনসংখ্যা' },
    { id: 'assessment', labelEn: 'Assessment Activity', labelBn: 'মূল্যায়ন কার্যক্রম' },
    { id: 'facility', labelEn: 'Facility Operations', labelBn: 'স্বাস্থ্যকেন্দ্র কার্যক্রম' },
    { id: 'worker', labelEn: 'Healthcare Worker', labelBn: 'স্বাস্থ্যকর্মী কার্যক্রম' },
    { id: 'workflow', labelEn: 'Clinical Workflow', labelBn: 'ক্লিনিকাল ওয়ার্কফ্লো' },
    { id: 'referral', labelEn: 'Referrals & Follow-ups', labelBn: 'রেফারেল ও ফলো-আপ' },
    { id: 'geographic', labelEn: 'Geographic Intelligence', labelBn: 'ভৌগোলিক তথ্য' },
    { id: 'environmental', labelEn: 'Environmental Service', labelBn: 'পরিবেশগত সেবা' },
    { id: 'data_quality', labelEn: 'Data Quality', labelBn: 'তথ্যের মান' },
    { id: 'performance', labelEn: 'Platform Performance', labelBn: 'প্ল্যাটফর্ম সক্ষমতা' },
  ]

  const filteredMetrics = metrics.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      m.metricId.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.nameBn.toLowerCase().includes(q) ||
      m.descriptionEn.toLowerCase().includes(q) ||
      m.descriptionBn.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={isBn ? 'অপারেশনাল মেট্রিক ডিকশনারি ও নিয়মাবলী' : 'Operational Metric Dictionary & Methodologies'}
      description={
        isBn
          ? 'লুঞ্জেন্টের সকল অপারেশনাল পরিসংখ্যানের অনুমোদিত গণনা পদ্ধতি, উৎস, নিয়ম এবং সীমাবদ্ধতা।'
          : 'Authoritative calculation methods, data sources, inclusion criteria, and limitations for all Lungent operational metrics.'
      }
      size="xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Filter Controls */}
        <div className="space-y-3 pt-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? 'মেট্রিক নাম বা বিবরণ দিয়ে খুঁজুন...' : 'Search metric name, formula, or keyword...'}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                }`}
              >
                {isBn ? c.labelBn : c.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics List */}
        <div className="space-y-4 pt-3">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {isBn ? 'কোনো মেট্রিক পাওয়া যায়নি।' : 'No matching metric definitions found.'}
            </div>
          ) : (
            filteredMetrics.map((m) => {
              const isHighlight = initialMetricId === m.metricId
              return (
                <div
                  key={m.metricId}
                  className={`p-4 rounded-lg border text-sm space-y-3 transition-colors ${
                    isHighlight
                      ? 'border-primary/60 bg-primary/5 dark:bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-base">
                        {isBn ? m.nameBn : m.nameEn}
                      </h4>
                      <code className="text-xs text-muted-foreground font-mono">
                        ID: {m.metricId}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {m.category}
                      </Badge>
                      <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                        <RefreshCw className="size-3" />
                        {m.refreshFrequency.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    {isBn ? m.descriptionBn : m.descriptionEn}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded bg-muted/40 space-y-1">
                      <span className="font-semibold text-foreground uppercase tracking-wider block">
                        {isBn ? 'গণনা পদ্ধতি' : 'Calculation Method'}
                      </span>
                      <code className="text-muted-foreground font-mono block break-all">
                        {isBn ? m.calculationMethodBn : m.calculationMethodEn}
                      </code>
                    </div>

                    <div className="p-2.5 rounded bg-muted/40 space-y-1">
                      <span className="font-semibold text-foreground uppercase tracking-wider block">
                        {isBn ? 'তথ্য উৎস' : 'Source Records'}
                      </span>
                      <span className="text-muted-foreground block">
                        {m.sourceRecords}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-muted/40 space-y-1">
                      <span className="font-semibold text-foreground uppercase tracking-wider block text-emerald-600 dark:text-emerald-400">
                        {isBn ? 'অন্তর্ভুক্তির শর্ত' : 'Inclusion Criteria'}
                      </span>
                      <span className="text-muted-foreground block">
                        {isBn ? m.inclusionRulesBn : m.inclusionRulesEn}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-muted/40 space-y-1">
                      <span className="font-semibold text-foreground uppercase tracking-wider block text-rose-600 dark:text-rose-400">
                        {isBn ? 'বর্জনের শর্ত' : 'Exclusion Criteria'}
                      </span>
                      <span className="text-muted-foreground block">
                        {isBn ? m.exclusionRulesBn : m.exclusionRulesEn}
                      </span>
                    </div>
                  </div>

                  {/* Known Limitations alert */}
                  <div className="flex items-start gap-2 p-2.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">
                        {isBn ? 'জ্ঞাত সীমাবদ্ধতা: ' : 'Known Limitation: '}
                      </span>
                      <span>{isBn ? m.limitationsBn : m.limitationsEn}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Dialog>
  )
}
