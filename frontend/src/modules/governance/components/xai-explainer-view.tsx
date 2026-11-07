'use client'

import React, { useState } from 'react'
import { ModelXAIProfile, LocalProfileExplanation } from '../types'

interface XAIExplainerViewProps {
  profile: ModelXAIProfile
  locale?: 'en' | 'bn'
}

export function XAIExplainerView({ profile, locale = 'en' }: XAIExplainerViewProps) {
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'bn'>(locale)
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(0)

  const activeLocalProfile: LocalProfileExplanation | undefined =
    profile.localProfileExplanations[selectedProfileIndex]

  const isBn = selectedLocale === 'bn'

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      {/* Header & Disclaimers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{profile.modelName}</h3>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              v{profile.modelVersion}
            </span>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 border border-amber-500/20">
              {profile.governanceNotice.includes('REJECTED') ? 'Prohibited / Rejected' : 'Research Only'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn ? 'ব্যাখ্যার পদ্ধতি:' : 'Explanation Methods:'}{' '}
            <span className="font-mono text-foreground">{profile.supportedExplainerTypes.join(', ')}</span>
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-border p-1 bg-muted/40">
          <button
            type="button"
            onClick={() => setSelectedLocale('en')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              selectedLocale === 'en' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLocale('bn')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              selectedLocale === 'bn' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Mandatory Non-Causal Warning Alert */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded">
            {isBn ? 'অ-কারণগত সতর্কবার্তা' : 'Non-Causal Disclaimer'}
          </span>
          <p className="leading-relaxed">
            {isBn ? profile.nonCausalDisclaimerBn : profile.nonCausalDisclaimerEn}
          </p>
        </div>
      </div>

      {profile.supportedExplainerTypes.includes('NotApplicable') ? (
        <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
          <p className="text-sm font-medium">
            {isBn
              ? 'এই টার্গেটের জন্য এক্সপ্লেনেবিলিটি প্রযোজ্য নয় কারণ মেথডোলজিক্যাল ভায়োলেশনের জন্য এটি বাতিল করা হয়েছে।'
              : 'Explainability cannot be computed for this target because it was rejected due to methodological violation.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Global Feature Importance */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {isBn ? 'গ্লোবাল ফিচারের গুরুত্ব (Global Importance)' : 'Global Feature Importance'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'মডেলের সামগ্রিক ফলাফলে বিভিন্ন বৈশিষ্ট্যের প্রভাবের অনুপাত।'
                  : 'Relative influence of top input predictors across the analytical cohort.'}
              </p>
            </div>

            <div className="space-y-2.5">
              {profile.globalFeatureImportance.slice(0, 8).map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{isBn ? feat.labelBn : feat.labelEn}</span>
                    <span className="font-mono text-muted-foreground">
                      {feat.oddsRatio ? `OR: ${feat.oddsRatio.toFixed(2)}` : `Imp: ${(feat.importanceScore ?? 0).toFixed(3)}`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        feat.direction === 'increases_risk' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, ((feat.importanceScore ?? 0) / 0.8) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Local Individual Prediction Waterfall */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {isBn ? 'ব্যক্তিগত প্রেডিকশনের ব্যাখ্যা (Local SHAP)' : 'Local Prediction Attribution'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isBn ? 'নির্দিষ্ট রোগীর প্রোফাইলের জন্য অবদানকারী বিষয়সমূহ।' : 'Feature attribution for selected illustrative case profile.'}
                </p>
              </div>

              {/* Profile Selector */}
              {profile.localProfileExplanations.length > 1 && (
                <select
                  value={selectedProfileIndex}
                  onChange={(e) => setSelectedProfileIndex(Number(e.target.value))}
                  className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                >
                  {profile.localProfileExplanations.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.profileLabel}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {activeLocalProfile && (
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-4">
                {/* Probability Shift Header */}
                <div className="flex items-center justify-between text-xs border-b border-border pb-3">
                  <div>
                    <span className="text-muted-foreground">{isBn ? 'বেসলাইন প্রত্যাশা:' : 'Base Expectation:'}</span>
                    <div className="font-mono font-semibold text-foreground">
                      {(activeLocalProfile.baselineProbability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">{isBn ? 'মডেলের প্রেডিকশন:' : 'Predicted Prob:'}</span>
                    <div
                      className={`font-mono font-bold text-base ${
                        activeLocalProfile.predictedProbability > 0.5 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {(activeLocalProfile.predictedProbability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Local Waterfall Contributions */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isBn ? 'প্রধান প্রভাব বিস্তারকারী বৈশিষ্ট্য:' : 'Top Contributing Factors:'}
                  </span>
                  {activeLocalProfile.topContributions.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center justify-between text-xs p-2 rounded bg-background border border-border/60"
                    >
                      <span className="font-medium text-foreground">{isBn ? c.labelBn : c.labelEn}</span>
                      <span
                        className={`font-mono font-semibold ${
                          c.direction === 'increases_risk' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {c.shapValue && c.shapValue > 0 ? `+${c.shapValue.toFixed(3)}` : c.shapValue?.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Uncertainty & Context Box */}
                <div className="pt-2 border-t border-border/60 text-xs space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{isBn ? 'প্রেডিকশন ব্যবধি (৯৫% CI):' : '95% Prediction Interval:'}</span>
                    <span className="font-mono text-foreground">
                      {(activeLocalProfile.uncertainty.predictionInterval95[0] * 100).toFixed(1)}% -{' '}
                      {(activeLocalProfile.uncertainty.predictionInterval95[1] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{isBn ? 'মডেলের আত্মবিশ্বাস (Confidence):' : 'Model Confidence Tier:'}</span>
                    <span className="font-semibold uppercase text-xs text-foreground">
                      {activeLocalProfile.uncertainty.confidenceTier}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 bg-amber-500/5 p-2 rounded border border-amber-500/20">
                    ⚠️ {activeLocalProfile.uncertainty.unmeasuredContextWarning}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

