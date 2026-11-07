'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Globe, Check } from 'lucide-react'
import { BANGLADESH_GEOGRAPHY } from '@/modules/facilities/geographic-data'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export interface SelectedLocationState {
  countryCode: string
  division: string
  district: string
  upazila?: string
  unionOrWard?: string
  addressLine?: string
}

interface GeographicHierarchySelectorProps {
  initialValue?: Partial<SelectedLocationState>
  onChange: (location: SelectedLocationState) => void
  showDetailedAddress?: boolean
  disabled?: boolean
  className?: string
}

export function GeographicHierarchySelector({
  initialValue,
  onChange,
  showDetailedAddress = false,
  disabled = false,
  className = '',
}: GeographicHierarchySelectorProps) {
  const [countryCode] = useState<string>(initialValue?.countryCode || 'BD')
  const [division, setDivision] = useState<string>(initialValue?.division || '')
  const [district, setDistrict] = useState<string>(initialValue?.district || '')
  const [upazila, setUpazila] = useState<string>(initialValue?.upazila || '')
  const [unionOrWard, setUnionOrWard] = useState<string>(initialValue?.unionOrWard || '')
  const [addressLine, setAddressLine] = useState<string>(initialValue?.addressLine || '')

  // Available options derived from BANGLADESH_GEOGRAPHY
  const divisionList = Object.values(BANGLADESH_GEOGRAPHY.divisions)
  const currentDivObj = division ? BANGLADESH_GEOGRAPHY.divisions[division] : undefined
  const districtList = currentDivObj ? Object.values(currentDivObj.districts) : []
  const currentDistObj = district && currentDivObj ? currentDivObj.districts[district] : undefined
  const upazilaList = currentDistObj ? currentDistObj.upazilas : []

  useEffect(() => {
    onChange({
      countryCode,
      division,
      district,
      upazila: upazila || undefined,
      unionOrWard: unionOrWard || undefined,
      addressLine: addressLine || undefined,
    })
  }, [countryCode, division, district, upazila, unionOrWard, addressLine, onChange])

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv)
    setDistrict('')
    setUpazila('')
  }

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist)
    setUpazila('')
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid="geographic-hierarchy-selector">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Division Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" />
            Division / বিভাগ <span className="text-destructive">*</span>
          </Label>
          <Select
            value={division}
            onChange={(e) => handleDivisionChange(e.target.value)}
            disabled={disabled}
            placeholder="Select Division (বিভাগ)"
            data-testid="division-select"
            options={[
              { value: '', label: '-- Select Division (বিভাগ) --' },
              ...divisionList.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.nameBn})`,
              })),
            ]}
          />
        </div>

        {/* District Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            District / জেলা <span className="text-destructive">*</span>
          </Label>
          <Select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled || !division}
            placeholder={division ? 'Select District (জেলা)' : 'Select division first'}
            data-testid="district-select"
            options={[
              { value: '', label: division ? '-- Select District (জেলা) --' : '-- Select division first --' },
              ...districtList.map((dst) => ({
                value: dst.id,
                label: `${dst.name} (${dst.nameBn})`,
              })),
            ]}
          />
        </div>

        {/* Upazila Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            Upazila / উপজেলা
          </Label>
          <Select
            value={upazila}
            onChange={(e) => setUpazila(e.target.value)}
            disabled={disabled || !district}
            placeholder={district ? 'Select Upazila (উপজেলা)' : 'Select district first'}
            data-testid="upazila-select"
            options={[
              { value: '', label: district ? '-- Select Upazila (উপজেলা) --' : '-- Select district first --' },
              ...upazilaList.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.nameBn})`,
              })),
            ]}
          />
        </div>
      </div>

      {showDetailedAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-border/50">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Union / Municipality / Ward (Optional)
            </Label>
            <Input
              value={unionOrWard}
              onChange={(e) => setUnionOrWard(e.target.value)}
              placeholder="e.g. Ward 4 / Union Parisad"
              disabled={disabled}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Village / Road / Area (Privacy-conscious, no GPS coordinates)
            </Label>
            <Input
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Sector 7, Road 12"
              disabled={disabled}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {division && district && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/40">
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Selected: <strong className="text-foreground">{division}</strong> &gt;{' '}
            <strong className="text-foreground">{district}</strong>
            {upazila && (
              <>
                {' '}
                &gt; <strong className="text-foreground">{upazila}</strong>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
