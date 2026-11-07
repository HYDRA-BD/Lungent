'use client'

/**
 * Phase 2.6: Clinical Guideline & Evidence Detail Inspection Modal
 */

import React from 'react'
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { ClinicalEvidenceSource } from '../types'

export interface GuidelineDetailModalProps {
  evidence: ClinicalEvidenceSource
  locale?: 'en' | 'bn'
  onClose: () => void
}

export function GuidelineDetailModal({
  evidence,
  locale = 'en',
  onClose,
}: GuidelineDetailModalProps) {
  const isBn = locale === 'bn'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-sky-400">
                {evidence.code}
              </span>
              <span className="rounded-sm bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {evidence.evidenceTier}
              </span>
              <span
                className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${
                  evidence.approvalStatus === 'active' || evidence.approvalStatus === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {evidence.approvalStatus}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold">
              {isBn ? evidence.titleBn : evidence.titleEn}
            </h2>
            <div className="mt-1 text-xs text-slate-400">{evidence.issuingOrganization}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Bangladesh Adaptation Callout */}
        <div
          className={`my-4 flex items-start gap-2.5 rounded-lg border p-3 text-xs ${
            evidence.approvedForBangladesh
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          }`}
        >
          {evidence.approvedForBangladesh ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          )}
          <div>
            <span className="font-semibold">
              {isBn ? 'বাংলাদেশ প্রেক্ষাপট ও গভর্নেন্স নীতি:' : 'Bangladesh Governance Assessment:'}{' '}
            </span>
            <span>
              {evidence.bangladeshAdaptationNotes ??
                (isBn ? 'বিশেষ কোনো মন্তব্য নেই।' : 'No regional caveats documented.')}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-400">
              {isBn ? 'সারাংশ (Summary)' : 'Clinical Summary'}
            </h3>
            <p className="mt-1 text-slate-300">
              {isBn ? evidence.summaryBn : evidence.summaryEn}
            </p>
          </div>

          {/* Key Recommendations */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400">
              {isBn ? 'মূল সুপারিশসমূহ (Key Recommendations)' : 'Core Guideline Recommendations'}
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-slate-300">
              {(isBn ? evidence.keyRecommendationsBn : evidence.keyRecommendationsEn).map(
                (rec, idx) => (
                  <li key={idx}>{rec}</li>
                )
              )}
            </ul>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-300">
            <div>
              <span className="font-medium text-slate-400">{isBn ? 'এখতিয়ার:' : 'Jurisdiction:'}</span>{' '}
              {evidence.jurisdiction}
            </div>
            <div>
              <span className="font-medium text-slate-400">{isBn ? 'উৎস ধরণ:' : 'Source Type:'}</span>{' '}
              {evidence.sourceType.replace('_', ' ')}
            </div>
            <div>
              <span className="font-medium text-slate-400">{isBn ? 'প্রকাশনার তারিখ:' : 'Published:'}</span>{' '}
              {evidence.publicationDate}
            </div>
            <div>
              <span className="font-medium text-slate-400">{isBn ? 'সংস্করণ:' : 'Version:'}</span>{' '}
              v{evidence.versionTag}
            </div>
          </div>

          {/* Publication Reference & DOI */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <BookOpen className="h-3.5 w-3.5 text-sky-400" />
              <span>{isBn ? 'প্রকাশনা উদ্ধৃতি (Citation)' : 'Publication Reference'}</span>
            </div>
            <p className="mt-1 font-mono text-slate-400">{evidence.publicationReference}</p>
            {evidence.officialUrl && (
              <a
                href={evidence.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
              >
                <span>{isBn ? 'মূল ডকুমেন্ট দেখুন' : 'View Source Document'}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
