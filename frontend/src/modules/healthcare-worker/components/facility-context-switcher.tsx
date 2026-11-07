'use client'

import React, { useTransition } from 'react'
import { Building2, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useLanguage } from '@/i18n'
import { switchActiveFacilityAction } from '@/modules/healthcare-worker/actions'
import type { Facility } from '@/modules/facilities/types'

interface FacilityContextSwitcherProps {
  activeFacilityId: string
  facilities: Facility[]
  onFacilitySwitched?: (newFacilityId: string) => void
}

export function FacilityContextSwitcher({
  activeFacilityId,
  facilities,
  onFacilitySwitched,
}: FacilityContextSwitcherProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [isPending, startTransition] = useTransition()

  // Default / fallback facility if list is empty
  const activeFacility = facilities.find((f) => f.id === activeFacilityId) || {
    id: activeFacilityId,
    name: 'Dhaka Central Community Clinic',
    nameBn: 'ঢাকা সেন্ট্রাল কমিউনিটি ক্লিনিক',
    facilityId: 'DH-001',
    division: 'Dhaka',
  }

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    if (!newId || newId === activeFacilityId) return

    startTransition(async () => {
      const res = await switchActiveFacilityAction(newId)
      if (res.success && onFacilitySwitched) {
        onFacilitySwitched(newId)
      }
    })
  }

  return (
    <div className="relative inline-flex items-center gap-2 bg-muted/60 hover:bg-muted/90 transition-colors border border-border/80 rounded-xl px-3 py-1.5 shadow-2xs">
      <div className="p-1 rounded-lg bg-primary/10 text-primary">
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Building2 className="size-3.5" />
        )}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {isBn ? 'সক্রিয় স্বাস্থ্যকেন্দ্র' : 'Active Facility'}
        </span>
        <div className="relative flex items-center">
          <select
            value={activeFacilityId}
            onChange={handleSelect}
            disabled={isPending}
            aria-label={isBn ? 'স্বাস্থ্যকেন্দ্র পরিবর্তন করুন' : 'Switch Active Facility'}
            className="appearance-none bg-transparent pr-6 text-xs font-semibold text-foreground cursor-pointer focus:outline-hidden disabled:opacity-50"
          >
            {facilities.length > 0 ? (
              facilities.map((fac) => (
                <option key={fac.id} value={fac.id} className="bg-popover text-foreground">
                  {isBn ? fac.nameBn || fac.name : fac.name} ({fac.facilityId}) - {fac.division}
                </option>
              ))
            ) : (
              <option value={activeFacility.id} className="bg-popover text-foreground">
                {isBn ? activeFacility.nameBn || activeFacility.name : activeFacility.name} (
                {activeFacility.facilityId}) - {activeFacility.division}
              </option>
            )}
          </select>
          <ChevronsUpDown className="pointer-events-none absolute right-0 size-3 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
