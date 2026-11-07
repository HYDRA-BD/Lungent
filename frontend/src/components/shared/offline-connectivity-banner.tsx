'use client'

import React, { useState } from 'react'
import {
  WifiOff,
  RefreshCw,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useConnectivity } from '@/modules/offline/use-connectivity'
import { useLanguage } from '@/i18n'
import { Button } from '@/components/ui/button'

export function OfflineConnectivityBanner() {
  const { isOnline, isBackendReachable, checkNow } = useConnectivity()
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [isChecking, setIsChecking] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  // Only display when connectivity is impaired
  if (isOnline && isBackendReachable) {
    return null
  }

  const handleRecheck = async () => {
    setIsChecking(true)
    try {
      await checkNow()
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 px-4 py-3 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
            <WifiOff className="size-4" />
          </div>
          <div>
            <span className="font-semibold">
              {isBn
                ? 'অফলাইন মোড — ডেটা সংরক্ষণে সীমিত সুবিধা সক্রিয়'
                : 'Offline Mode — Limited Assessment Preservation Active'}
            </span>
            <span className="hidden md:inline ml-1 text-amber-900/80 dark:text-amber-300/80">
              —{' '}
              {isBn
                ? 'ফর্মের তথ্য ডিভাইসে সুরক্ষিত রাখা হচ্ছে। সংযোগ ফিরে পেলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।'
                : 'Responses are securely stored on this device and will sync automatically when connectivity returns.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setDetailsExpanded((prev) => !prev)}
            className="text-xs font-medium underline flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-100"
          >
            <span>{isBn ? 'সীমাবদ্ধতা ও সুবিধা' : 'Features & Restrictions'}</span>
            {detailsExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRecheck}
            disabled={isChecking}
            className="h-7 text-xs border-amber-400 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <RefreshCw className={`size-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            {isBn ? 'সংযোগ পরীক্ষা' : 'Check Link'}
          </Button>
        </div>
      </div>

      {/* Expanded Clinical Safety & Feature Availability Breakdown */}
      {detailsExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-500/20 grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="size-3.5" />
              {isBn ? 'অফলাইনে যা সচল থাকবে' : 'Available Offline'}
            </h4>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>{isBn ? 'অ্যাসেসমেন্ট প্রশ্নাবলী পূরণ ও সম্পাদনা' : 'Fill and edit supported assessment questionnaires'}</li>
              <li>{isBn ? 'এনক্রিপ্ট করা স্থানীয় ড্রাফট সংরক্ষণ' : 'Encrypted on-device draft storage (IndexedDB AES-GCM)'}</li>
              <li>{isBn ? 'পেজ রিফ্রেশ হলেও প্রগ্রেস সংরক্ষণ' : 'Preserve form progress across page reloads'}</li>
              <li>{isBn ? 'সংযোগ ফিরলে ব্যাকগ্রাউন্ডে অটো-সিঙ্ক' : 'Automatic queueing for synchronization on reconnect'}</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <XCircle className="size-3.5" />
              {isBn ? 'ক্লিনিক্যাল সুরক্ষা ও স্থগিত সুবিধাসমূহ' : 'Clinical Safety Pauses (Online Only)'}
            </h4>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>{isBn ? 'ক্লিনিক্যাল ঝুঁকি হিসাব ও স্ক্রীনিং যোগ্যতা বিশ্লেষণ স্থগিত' : 'Clinical risk scores & screening eligibility calculations paused'}</li>
              <li>{isBn ? 'জরুরি রেড-ফ্ল্যাগ ট্রায়াজ নোটিফিকেশন সার্ভার-সংযুক্ত নয়' : 'Urgent red-flag triage notifications cannot dispatch remotely'}</li>
              <li>{isBn ? 'স্পেশালিস্ট রেফারেল পরিচালনা সার্ভার নিশ্চিতকরণ ছাড়া অনুপলব্ধ' : 'Specialist referral management requires server confirmation'}</li>
            </ul>
          </div>

          <div className="sm:col-span-2 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30 flex items-start gap-2">
            <ShieldAlert className="size-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-950 dark:text-amber-200">
              {isBn
                ? 'জরুরি নোটিশ: আপনার যদি তীব্র শ্বাসকষ্ট, কাশির সাথে রক্ত যাওয়া (হেমোপটিসিস) বা তীব্র বুকে ব্যথা থাকে, তবে অফলাইন বা অনলাইন মূল্যায়নের অপেক্ষা না করে সরাসরি নিকটস্থ জরুরি হাসপাতালে যোগাযোগ করুন।'
                : 'Emergency Notice: If you or the patient is experiencing severe chest pain, shortness of breath, or coughing up blood, seek emergency hospital care immediately. Do not wait for online clinical processing.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

