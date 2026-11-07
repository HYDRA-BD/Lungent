'use client'

import React, { useState } from 'react'
import { Flame, Factory, Cigarette, ShieldCheck, Plus, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { PatientExposureRecord } from '../types'
import { recordPatientExposureAction } from '../actions'

interface PatientExposureListProps {
  patientId: string
  initialExposures?: PatientExposureRecord[]
  allowAdd?: boolean
  className?: string
}

export function PatientExposureList({
  patientId,
  initialExposures = [],
  allowAdd = true,
  className = '',
}: PatientExposureListProps) {
  const [exposures, setExposures] = useState<PatientExposureRecord[]>(initialExposures)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form State
  const [category, setCategory] = useState<'occupational' | 'indoor_biomass' | 'outdoor_air_pollution' | 'secondhand_smoke' | 'other'>('indoor_biomass')
  const [exposureType, setExposureType] = useState('Traditional Chula (Wood/Dung Biomass)')
  const [cookingFuel, setCookingFuel] = useState<'clean_lpg_electric' | 'biomass_wood_dung' | 'kerosene' | 'coal' | 'mixed'>('biomass_wood_dung')
  const [durationYears, setDurationYears] = useState('15')
  const [hoursPerDay, setHoursPerDay] = useState('4')
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | 'unknown'>('moderate')

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'indoor_biomass':
        return <Flame className="h-4 w-4 text-orange-500" />
      case 'occupational':
        return <Factory className="h-4 w-4 text-amber-500" />
      case 'secondhand_smoke':
        return <Cigarette className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const handleAddExposure = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const res = await recordPatientExposureAction({
      patientId,
      exposureCategory: category,
      exposureType,
      cookingFuelType: category === 'indoor_biomass' ? cookingFuel : null,
      durationYears: Number(durationYears) || 1,
      hoursPerDay: Number(hoursPerDay) || null,
      intensity,
      isCurrent: true,
      verificationStatus: 'verified',
    })

    setIsSubmitting(false)

    if (res.success && res.exposure) {
      setExposures([res.exposure, ...exposures])
      setIsDialogOpen(false)
    } else {
      setErrorMsg(res.error || 'Failed to record exposure')
    }
  }

  return (
    <Card className={`border border-border ${className}`} data-testid="patient-exposure-list">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Environmental & Occupational Exposures
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Documented domestic cooking fuels, airborne irritants, and workplace risks
            </p>
          </div>

          {allowAdd && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => setIsDialogOpen(true)}
              data-testid="add-exposure-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Exposure
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {exposures.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
            No specific environmental or occupational exposures documented for this patient.
          </div>
        ) : (
          <div className="space-y-2.5">
            {exposures.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-border/80 bg-muted/10 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-muted border border-border/60">
                    {getCategoryIcon(item.exposureCategory)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      {item.exposureType}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.durationYears} years
                      {item.hoursPerDay && ` • ${item.hoursPerDay} hrs/day`} • {item.intensity} intensity
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {item.exposureCategory.replace('_', ' ')}
                  </Badge>
                  <Badge
                    variant={item.verificationStatus === 'verified' ? 'success' : 'secondary'}
                    className="text-[10px] gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {item.verificationStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Exposure Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Record Patient Exposure"
        description="Document chronic domestic cooking fuel, environmental, or occupational exposure."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              form="exposure-form"
              disabled={isSubmitting}
              data-testid="submit-exposure-btn"
            >
              {isSubmitting ? 'Saving...' : 'Save Exposure'}
            </Button>
          </div>
        }
      >
        <form id="exposure-form" onSubmit={handleAddExposure} className="space-y-3">
          {errorMsg && (
            <div className="p-2 text-xs rounded bg-destructive/10 text-destructive border border-destructive/20">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Exposure Category</Label>
            <Select
              value={category}
              onChange={(e) => {
                const val = e.target.value as 'occupational' | 'indoor_biomass' | 'outdoor_air_pollution' | 'secondhand_smoke' | 'other'
                setCategory(val)
                if (val === 'indoor_biomass') {
                  setExposureType('Traditional Chula (Wood/Dung Biomass)')
                } else if (val === 'occupational') {
                  setExposureType('Industrial Dust / Silica / Shipbreaking')
                } else if (val === 'secondhand_smoke') {
                  setExposureType('Domestic Secondhand Tobacco Smoke')
                } else {
                  setExposureType('Urban Traffic / Brick Kiln Particulates')
                }
              }}
              options={[
                { value: 'indoor_biomass', label: 'Indoor Biomass (রান্নার ধোঁয়া)' },
                { value: 'occupational', label: 'Occupational Hazard (পেশাগত ঝুঁকি)' },
                { value: 'outdoor_air_pollution', label: 'Outdoor Pollution (বহিরঙ্গন দূষণ)' },
                { value: 'secondhand_smoke', label: 'Secondhand Smoke (পরোক্ষ ধূমপান)' },
                { value: 'other', label: 'Other Environmental' },
              ]}
            />
          </div>

          {category === 'indoor_biomass' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Domestic Fuel Type</Label>
              <Select
                value={cookingFuel}
                onChange={(e) =>
                  setCookingFuel(
                    e.target.value as
                      | 'clean_lpg_electric'
                      | 'biomass_wood_dung'
                      | 'kerosene'
                      | 'coal'
                      | 'mixed'
                  )
                }
                options={[
                  { value: 'biomass_wood_dung', label: 'Biomass (Wood / Dung / Crop Straw)' },
                  { value: 'coal', label: 'Coal / Briquettes' },
                  { value: 'kerosene', label: 'Kerosene' },
                  { value: 'mixed', label: 'Mixed Fuels' },
                  { value: 'clean_lpg_electric', label: 'Clean LPG / Electricity' },
                ]}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Specific Exposure Type</Label>
            <Input
              value={exposureType}
              onChange={(e) => setExposureType(e.target.value)}
              placeholder="e.g. Biomass Chula, Asbestos, Silica"
              className="text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (Years)</Label>
              <Input
                type="number"
                value={durationYears}
                onChange={(e) => setDurationYears(e.target.value)}
                min="0"
                max="100"
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hours / Day</Label>
              <Input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                min="0"
                max="24"
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Exposure Intensity</Label>
            <Select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as 'low' | 'moderate' | 'high' | 'unknown')}
              options={[
                { value: 'low', label: 'Low (হালকা)' },
                { value: 'moderate', label: 'Moderate (মাঝারি)' },
                { value: 'high', label: 'High (উচ্চ)' },
                { value: 'unknown', label: 'Unknown' },
              ]}
            />
          </div>
        </form>
      </Dialog>
    </Card>
  )
}
