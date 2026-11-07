'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  X,
  Bed,
  Scan,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { calculateHaversineDistance, MANDATORY_DISTANCE_DISCLAIMER } from '../distance'
import type { FacilityMapMarker, GeoCoordinates } from '../types'

interface FacilitySpatialDetailsProps {
  facility: FacilityMapMarker | null
  referenceCoordinates?: GeoCoordinates | null
  onClose: () => void
  isBn?: boolean
}

export function FacilitySpatialDetails({
  facility,
  referenceCoordinates,
  onClose,
  isBn = false,
}: FacilitySpatialDetailsProps) {
  const [copied, setCopied] = useState(false)

  if (!facility) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-border rounded-xl bg-card/50"
        data-testid="facility-details-empty"
      >
        <Building2 className="size-10 text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold text-foreground text-sm">
          {isBn ? 'কোনো স্বাস্থ্যসেবা কেন্দ্র নির্বাচিত হয়নি' : 'No Facility Selected'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
          {isBn
            ? 'মানচিত্রে কোনো মার্কার নির্বাচন করুন বিস্তারিত তথ্য এবং ডায়াগনস্টিক সক্ষমতা দেখতে।'
            : 'Click any facility marker on the interactive map to inspect diagnostic capabilities and coordinates.'}
        </p>
      </div>
    )
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(facility.facilityId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate distance from reference coordinates if provided
  const distanceResult = referenceCoordinates
    ? calculateHaversineDistance(
        referenceCoordinates.latitude,
        referenceCoordinates.longitude,
        facility.latitude,
        facility.longitude
      )
    : null

  const isVerified = facility.verificationStatus === 'verified'

  return (
    <div
      className="h-full flex flex-col border border-border rounded-xl bg-card shadow-sm overflow-hidden"
      data-testid="facility-spatial-details"
    >
      {/* Header Bar */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isVerified ? 'default' : 'outline'}
              className={`text-[10px] px-1.5 py-0 ${
                isVerified
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-amber-500 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isVerified ? (
                <>
                  <ShieldCheck className="size-3 mr-1" />
                  {isBn ? 'যাচাইকৃত কেন্দ্র' : 'Verified Facility'}
                </>
              ) : (
                <>
                  <ShieldAlert className="size-3 mr-1" />
                  {isBn ? 'যাচাইকরণ প্রক্রিয়াধীন' : 'Pending Verification'}
                </>
              )}
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground">
              {facility.facilityId}
            </span>
          </div>
          <h2 className="text-base font-bold text-foreground mt-1.5 leading-snug">
            {isBn ? facility.nameBn : facility.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {facility.facilityTypeName} • {facility.ownershipCategoryName}
          </p>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          title={isBn ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Geographic Coordinates & Location */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-foreground">
                {facility.upazila}, {facility.district}, {facility.division}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {facility.addressLine}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground/80 mt-1">
                WGS84: {facility.latitude.toFixed(4)}°N, {facility.longitude.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Proximity Distance Indicator */}
          {distanceResult && (
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{isBn ? 'সরাসরি দূরত্ব:' : 'Geodesic Distance:'}</span>
                <span className="font-bold text-primary">{distanceResult.distanceKm} km</span>
              </div>
              <p className="text-[10px] text-muted-foreground/80 mt-1 leading-tight italic">
                {MANDATORY_DISTANCE_DISCLAIMER}
              </p>
            </div>
          )}
        </div>

        {/* Clinical & Diagnostic Capabilities */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {isBn ? 'ডায়াগনস্টিক সক্ষমতা ও সেবা' : 'Diagnostic Capabilities & Services'}
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            <div className={`p-2 rounded border text-xs flex items-center justify-between ${
              facility.hasLdctScreening ? 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300' : 'border-border bg-muted/10 text-muted-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <Scan className="size-3.5" />
                <span className="font-medium">
                  {isBn ? 'লো-ডোজ সিটি (LDCT) স্ক্রিনিং' : 'Low-Dose CT (LDCT) Screening'}
                </span>
              </div>
              <Badge variant={facility.hasLdctScreening ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                {facility.hasLdctScreening ? (isBn ? 'উপস্থিত' : 'Available') : (isBn ? 'অনুপস্থিত' : 'Not Present')}
              </Badge>
            </div>

            <div className={`p-2 rounded border text-xs flex items-center justify-between ${
              facility.hasGeneXpert ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300' : 'border-border bg-muted/10 text-muted-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <Activity className="size-3.5" />
                <span className="font-medium">
                  {isBn ? 'জিনএক্সপার্ট যক্ষ্মা (TB) পরীক্ষা' : 'GeneXpert MTB/RIF Assay'}
                </span>
              </div>
              <Badge variant={facility.hasGeneXpert ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                {facility.hasGeneXpert ? (isBn ? 'উপস্থিত' : 'Available') : (isBn ? 'অনুপস্থিত' : 'Not Present')}
              </Badge>
            </div>

            <div className={`p-2 rounded border text-xs flex items-center justify-between ${
              facility.hasDiagnosticCt ? 'border-indigo-500/30 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300' : 'border-border bg-muted/10 text-muted-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <Scan className="size-3.5" />
                <span className="font-medium">
                  {isBn ? 'ডায়াগনস্টিক সিটি স্ক্যানার' : 'Diagnostic CT Scanner'}
                </span>
              </div>
              <Badge variant={facility.hasDiagnosticCt ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                {facility.hasDiagnosticCt ? (isBn ? 'উপস্থিত' : 'Available') : (isBn ? 'অনুপস্থিত' : 'Not Present')}
              </Badge>
            </div>

            <div className={`p-2 rounded border text-xs flex items-center justify-between ${
              facility.hasSpirometry ? 'border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-300' : 'border-border bg-muted/10 text-muted-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <Activity className="size-3.5" />
                <span className="font-medium">
                  {isBn ? 'স্পাইরোমেট্রি ও ফুসফুস পরীক্ষা' : 'Spirometry & PFT'}
                </span>
              </div>
              <Badge variant={facility.hasSpirometry ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                {facility.hasSpirometry ? (isBn ? 'উপস্থিত' : 'Available') : (isBn ? 'অনুপস্থিত' : 'Not Present')}
              </Badge>
            </div>

            <div className={`p-2 rounded border text-xs flex items-center justify-between ${
              facility.hasThoracicSurgery ? 'border-purple-500/30 bg-purple-500/5 text-purple-700 dark:text-purple-300' : 'border-border bg-muted/10 text-muted-foreground'
            }`}>
              <div className="flex items-center gap-2">
                <Building2 className="size-3.5" />
                <span className="font-medium">
                  {isBn ? 'থোরাসিক সার্জারি ও বক্ষ শল্যচিকিৎসা' : 'Thoracic Surgery Unit'}
                </span>
              </div>
              <Badge variant={facility.hasThoracicSurgery ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                {facility.hasThoracicSurgery ? (isBn ? 'উপস্থিত' : 'Available') : (isBn ? 'অনুপস্থিত' : 'Not Present')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Operational Capacity */}
        {facility.operationalCapacity && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {isBn ? 'অপারেশনাল সক্ষমতা' : 'Operational Capacity'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {facility.operationalCapacity.totalBeds !== undefined && (
                <div className="p-2 rounded border border-border bg-muted/20">
                  <div className="text-muted-foreground text-[10px] flex items-center gap-1">
                    <Bed className="size-3" />
                    {isBn ? 'মোট শয্যা' : 'Total Beds'}
                  </div>
                  <div className="font-bold text-foreground text-sm mt-0.5">
                    {facility.operationalCapacity.totalBeds}
                  </div>
                </div>
              )}
              {facility.operationalCapacity.ldctScanners !== undefined && (
                <div className="p-2 rounded border border-border bg-muted/20">
                  <div className="text-muted-foreground text-[10px] flex items-center gap-1">
                    <Scan className="size-3" />
                    {isBn ? 'LDCT স্ক্যানার' : 'LDCT Scanners'}
                  </div>
                  <div className="font-bold text-foreground text-sm mt-0.5">
                    {facility.operationalCapacity.ldctScanners}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(facility.contactPhone || facility.contactEmail) && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {isBn ? 'যোগাযোগ' : 'Contact Information'}
            </h4>
            <div className="space-y-1.5 text-xs">
              {facility.contactPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 text-primary" />
                  <span>{facility.contactPhone}</span>
                </div>
              )}
              {facility.contactEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 text-primary" />
                  <span>{facility.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operational Disclaimer Alert */}
        <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <strong>{isBn ? 'সতর্কতা:' : 'Notice:'}</strong>{' '}
            {isBn
              ? 'তালিকায় অন্তর্ভুক্তি তাত্ক্ষণিক অ্যাপয়েন্টমেন্ট বা মেশিনের সার্বক্ষণিক কার্যকারিতা নিশ্চিত করে না। সরাসরি রেফারাল নিশ্চিত করুন।'
              : 'Registry existence does NOT guarantee real-time scanner uptime or immediate appointment slots. Requisition requires clinical validation.'}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={handleCopyId}
          data-testid="copy-facility-id-btn"
        >
          {copied ? <Check className="size-3.5 mr-1 text-emerald-600" /> : <Copy className="size-3.5 mr-1" />}
          {copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'আইডি কপি' : 'Copy ID')}
        </Button>

        <Link
          href={`/admin/facilities/${facility.id}`}
          className={buttonVariants({ size: 'sm', className: 'h-8 text-xs' })}
        >
          <ExternalLink className="size-3.5 mr-1" />
          {isBn ? 'সম্পূর্ণ প্রোফাইল' : 'View Facility'}
        </Link>
      </div>
    </div>
  )
}
