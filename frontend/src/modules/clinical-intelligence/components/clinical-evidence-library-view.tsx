'use client'

/**
 * Phase 2.6: Clinical Evidence Library & Reference Explorer View
 */

import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react'
import type {
  ClinicalEvidenceSource,
  ClinicalTopic,
  EvidenceTier,
  GuidelineJurisdiction,
} from '../types'
import { GuidelineDetailModal } from './guideline-detail-modal'

export interface ClinicalEvidenceLibraryViewProps {
  initialEvidence: ClinicalEvidenceSource[]
  locale?: 'en' | 'bn'
}

export function ClinicalEvidenceLibraryView({
  initialEvidence,
  locale = 'en',
}: ClinicalEvidenceLibraryViewProps) {
  const [evidenceList] = useState<ClinicalEvidenceSource[]>(initialEvidence)
  const [selectedEvidence, setSelectedEvidence] = useState<ClinicalEvidenceSource | null>(null)
  const [topicFilter, setTopicFilter] = useState<ClinicalTopic | 'all'>('all')
  const [jurisdictionFilter, setJurisdictionFilter] = useState<GuidelineJurisdiction | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<EvidenceTier | 'all'>('all')
  const [bangladeshOnly, setBangladeshOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isBn = locale === 'bn'

  const filtered = evidenceList.filter((e) => {
    if (topicFilter !== 'all' && e.primaryTopic !== topicFilter) return false
    if (jurisdictionFilter !== 'all' && e.jurisdiction !== jurisdictionFilter) return false
    if (tierFilter !== 'all' && e.evidenceTier !== tierFilter) return false
    if (bangladeshOnly && !e.approvedForBangladesh) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchCode = e.code.toLowerCase().includes(q)
      const matchTitle = (isBn ? e.titleBn : e.titleEn).toLowerCase().includes(q)
      const matchOrg = e.issuingOrganization.toLowerCase().includes(q)
      const matchSum = (isBn ? e.summaryBn : e.summaryEn).toLowerCase().includes(q)
      if (!matchCode && !matchTitle && !matchOrg && !matchSum) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Governance & Clinical Guidance Banner */}
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-slate-200">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-sky-300">
              {isBn
                ? 'অনুমোদিত ক্লিনিকাল প্রমাণ ও নির্দেশিকা লাইব্রেরি'
                : 'Approved Clinical Evidence & Guideline Reference Library'}
            </h4>
            <p className="text-xs text-slate-300">
              {isBn
                ? 'লুঙ্গেন্ট-এর ক্লিনিকাল গভর্নেন্স বোর্ড কর্তৃক পর্যালোচিত আনুষ্ঠানিক নির্দেশিকা, র্যান্ডমাইজড ট্রায়াল ও জাতীয় প্রটোকল। আন্তর্জাতিক নির্দেশিকাসমূহ বাংলাদেশের বাস্তবতায় প্রযোজ্যতার ভিত্তিতে সতর্কতার সাথে চিহ্নিত করা হয়েছে।'
                : 'Authoritative clinical guidelines, randomized trials, and national protocols vetted by the Clinical Advisory Board. International recommendations carry clear regional applicability flags for Bangladesh.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBn ? 'শিরোনাম, সংস্থা বা বিষয় দিয়ে খুঁজুন...' : 'Search guidelines, issuing bodies, or topics...'
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>{isBn ? 'ফিল্টার:' : 'Filter:'}</span>
          </div>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as ClinicalTopic | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-sky-500"
          >
            <option value="all">{isBn ? 'সব ক্লিনিকাল বিষয়' : 'All Topics'}</option>
            <option value="screening_guidance">{isBn ? 'স্ক্রিনিং গাইডলাইন' : 'Screening Guidance'}</option>
            <option value="symptom_triage">{isBn ? 'উপসর্গ ট্রায়াজ' : 'Symptom Triage'}</option>
            <option value="tobacco_exposure">{isBn ? 'তামাক ও বিড়ি' : 'Tobacco & Bidi'}</option>
            <option value="environmental_exposure">{isBn ? 'পরিবেশ ও বায়োমাস' : 'Biomass & Environmental'}</option>
            <option value="diagnostic_pathways">{isBn ? 'ডায়াগনস্টিক পথ' : 'Diagnostic Pathways'}</option>
            <option value="risk_factors">{isBn ? 'ঝুঁকি উপাদান' : 'Risk Factors'}</option>
          </select>

          <select
            value={jurisdictionFilter}
            onChange={(e) => setJurisdictionFilter(e.target.value as GuidelineJurisdiction | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-sky-500"
          >
            <option value="all">{isBn ? 'সব এখতিয়ার' : 'All Jurisdictions'}</option>
            <option value="Bangladesh">{isBn ? 'বাংলাদেশ' : 'Bangladesh'}</option>
            <option value="WHO">{isBn ? 'ডব্লিউএইচও (WHO)' : 'WHO'}</option>
            <option value="United States">{isBn ? 'যুক্তরাষ্ট্র' : 'United States'}</option>
            <option value="United Kingdom">{isBn ? 'যুক্তরাজ্য (UK)' : 'United Kingdom'}</option>
            <option value="International">{isBn ? 'আন্তর্জাতিক' : 'International'}</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as EvidenceTier | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-sky-500"
          >
            <option value="all">{isBn ? 'সব প্রমাণের স্তর' : 'All Tiers'}</option>
            <option value="Level 1a">Level 1a</option>
            <option value="Level 1b">Level 1b</option>
            <option value="Grade A">Grade A</option>
            <option value="Grade B">Grade B</option>
            <option value="Consensus">{isBn ? 'ঐকমত্য (Consensus)' : 'Consensus'}</option>
          </select>

          <label className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={bangladeshOnly}
              onChange={(e) => setBangladeshOnly(e.target.checked)}
              className="rounded-sm border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>{isBn ? 'বাংলাদেশে অনুমোদিত' : 'Approved for BD'}</span>
          </label>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
            {isBn ? 'কোনো প্রমাণ বা নির্দেশিকা পাওয়া যায়নি।' : 'No clinical evidence matching the selected filters.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs transition-colors hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-sky-400">{item.code}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-sm bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {item.evidenceTier}
                    </span>
                    {item.approvedForBangladesh ? (
                      <span className="flex items-center gap-1 rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>BD Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-sm bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                        <AlertTriangle className="h-3 w-3" />
                        <span>BD Caveat</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-100">
                  {isBn ? item.titleBn : item.titleEn}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{item.issuingOrganization}</p>

                <p className="mt-3 line-clamp-3 text-xs text-slate-300">
                  {isBn ? item.summaryBn : item.summaryEn}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Globe className="h-3 w-3 text-slate-500" />
                  <span>{item.jurisdiction}</span>
                </span>

                <button
                  onClick={() => setSelectedEvidence(item)}
                  className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-sky-400 hover:bg-slate-700 hover:text-sky-300"
                >
                  {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedEvidence && (
        <GuidelineDetailModal
          evidence={selectedEvidence}
          locale={locale}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  )
}
