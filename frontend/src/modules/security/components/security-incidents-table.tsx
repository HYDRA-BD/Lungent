'use client'

import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Plus, Flame } from 'lucide-react'
import { useLanguage } from '@/i18n'
import type {
  SecurityIncident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '../types'
import { reportIncidentAction, updateIncidentStatusAction } from '../actions'

interface SecurityIncidentsTableProps {
  incidents: SecurityIncident[]
  onRefresh?: () => void
}

export function SecurityIncidentsTable({
  incidents,
  onRefresh,
}: SecurityIncidentsTableProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance

  const [createOpen, setCreateOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null)

  // Create form state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<IncidentCategory>('unauthorized_access_attempt')
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('medium')
  const [newAffected, setNewAffected] = useState('Authentication Subsystem, API Gateway')
  const [newContainment, setNewContainment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Manage form state
  const [targetStatus, setTargetStatus] = useState<IncidentStatus>('investigating')
  const [manageNotes, setManageNotes] = useState('')

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsSubmitting(true)
    const res = await reportIncidentAction({
      title: newTitle.trim(),
      category: newCategory,
      severity: newSeverity,
      affectedSystems: newAffected.split(',').map((s) => s.trim()).filter(Boolean),
      containmentNotes: newContainment.trim() || undefined,
    })
    setIsSubmitting(false)

    if (res.success) {
      setCreateOpen(false)
      setNewTitle('')
      setNewContainment('')
      onRefresh?.()
    }
  }

  const openManageModal = (inc: SecurityIncident) => {
    setSelectedIncident(inc)
    setTargetStatus(inc.status)
    setManageNotes(inc.containmentNotes || inc.resolutionSummary || '')
    setManageOpen(true)
  }

  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIncident) return

    setIsSubmitting(true)
    const res = await updateIncidentStatusAction(
      selectedIncident.id,
      targetStatus,
      manageNotes.trim() || 'Incident status updated.'
    )
    setIsSubmitting(false)

    if (res.success) {
      setManageOpen(false)
      onRefresh?.()
    }
  }

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><Flame className="size-3" />{isBn ? 'সংকটপূর্ণ' : 'Critical'}</Badge>
      case 'high':
        return <Badge variant="destructive">{isBn ? 'উচ্চ' : 'High'}</Badge>
      case 'medium':
        return <Badge variant="warning">{isBn ? 'মাঝারি' : 'Medium'}</Badge>
      default:
        return <Badge variant="secondary">{isBn ? 'নিম্ন' : 'Low'}</Badge>
    }
  }

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'reported':
        return <Badge variant="destructive">{isBn ? 'রিপোর্টকৃত' : 'Reported'}</Badge>
      case 'investigating':
        return <Badge variant="warning">{isBn ? 'তদন্তাধীন' : 'Investigating'}</Badge>
      case 'contained':
        return <Badge variant="info">{isBn ? 'নিয়ন্ত্রিত' : 'Contained'}</Badge>
      case 'resolved':
      case 'closed':
        return <Badge variant="success">{isBn ? 'সমাধানকৃত' : 'Resolved'}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'unauthorized_access_attempt':
        return isBn ? 'অননুমোদিত অ্যাক্সেস প্রচেষ্টা' : 'Unauthorized Access Attempt'
      case 'credential_compromise':
        return isBn ? 'ক্রিডেনশিয়াল ঝুঁকি' : 'Credential Compromise'
      case 'data_exposure_suspected':
        return isBn ? 'ডেটা উন্মোচনের সন্দেহ' : 'Data Exposure Suspected'
      case 'cross_facility_violation':
        return isBn ? 'আন্তঃহাসপাতাল সীমা লঙ্ঘন' : 'Cross-Facility Violation'
      case 'brute_force_attack':
        return isBn ? 'ব্রুট-ফোর্স আক্রমণ' : 'Brute Force Attack'
      default:
        return category
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600" />
                {t.tabs.incidents} ({incidents.length})
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'নিরাপত্তা ঝুঁকি, সন্দেহভাজন অননুমোদিত অ্যাক্সেস এবং সাইবার নিরাপত্তা ঘটনার ট্রায়াজ ও নিয়ন্ত্রণ।'
                  : 'Centralized incident response framework: report, investigate, contain, and document security events.'}
              </CardDescription>
            </div>

            <Button
              variant="default"
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() => setCreateOpen(true)}
            >
              {t.reportIncident}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'ঘটনা নং' : 'Incident #'}</TableHead>
                  <TableHead>{isBn ? 'শিরোনাম ও ক্যাটাগরি' : 'Title & Category'}</TableHead>
                  <TableHead>{t.severity}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{isBn ? 'প্রভাবিত সিস্টেম' : 'Affected Systems'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {inc.incidentNumber}
                      <span className="block font-normal text-[11px] text-muted-foreground">
                        {new Date(inc.reportedAt).toLocaleDateString()}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-[280px]">
                      <div className="font-semibold text-foreground text-xs">{inc.title}</div>
                      <span className="text-[11px] text-muted-foreground">
                        {getCategoryLabel(inc.category)}
                      </span>
                      {inc.containmentNotes && (
                        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-1">
                          {inc.containmentNotes}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>{getSeverityBadge(inc.severity)}</TableCell>

                    <TableCell>{getStatusBadge(inc.status)}</TableCell>

                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-1">
                        {inc.affectedSystems.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openManageModal(inc)}
                      >
                        {isBn ? 'ব্যবস্থাপনা' : 'Manage'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Incident Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t.incidentModalTitle}
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="inc-title">{isBn ? 'ঘটনার শিরোনাম' : 'Incident Title'} *</Label>
            <Input
              id="inc-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Unusual login attempts or cross-facility boundary probe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inc-cat">{t.incidentCategory}</Label>
              <Select
                id="inc-cat"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as IncidentCategory)}
                options={[
                  { value: 'unauthorized_access_attempt', label: isBn ? 'অননুমোদিত অ্যাক্সেস' : 'Unauthorized Access' },
                  { value: 'credential_compromise', label: isBn ? 'ক্রিডেনশিয়াল ঝুঁকি' : 'Credential Compromise' },
                  { value: 'data_exposure_suspected', label: isBn ? 'ডেটা ঝুঁকি' : 'Data Exposure Suspected' },
                  { value: 'cross_facility_violation', label: isBn ? 'সীমা লঙ্ঘন' : 'Cross-Facility Violation' },
                  { value: 'brute_force_attack', label: isBn ? 'ব্রুট-ফোর্স' : 'Brute Force Attack' },
                  { value: 'policy_violation', label: isBn ? 'নীতিমালা লঙ্ঘন' : 'Policy Violation' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-sev">{t.severity}</Label>
              <Select
                id="inc-sev"
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                options={[
                  { value: 'low', label: isBn ? 'নিম্ন' : 'Low' },
                  { value: 'medium', label: isBn ? 'মাঝারি' : 'Medium' },
                  { value: 'high', label: isBn ? 'উচ্চ' : 'High' },
                  { value: 'critical', label: isBn ? 'সংকটপূর্ণ' : 'Critical' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc-affected">{isBn ? 'প্রভাবিত সিস্টেমসমূহ (কমা দিয়ে পৃথক)' : 'Affected Systems'}</Label>
            <Input
              id="inc-affected"
              value={newAffected}
              onChange={(e) => setNewAffected(e.target.value)}
              placeholder="Authentication, Patient Registry, Storage"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inc-containment">{isBn ? 'প্রাথমিক নিয়ন্ত্রণমূলক পদক্ষেপ' : 'Immediate Containment Notes'}</Label>
            <Textarea
              id="inc-containment"
              value={newContainment}
              onChange={(e) => setNewContainment(e.target.value)}
              rows={3}
              placeholder="e.g. Temporary IP block applied, active sessions invalidated, user alerted."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? 'রিপোর্ট দাখিল করুন' : 'Submit Incident Report'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Manage Status Dialog */}
      <Dialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title={`${isBn ? 'ঘটনা নিয়ন্ত্রণ ও সমাধান:' : 'Triage Incident:'} ${selectedIncident?.incidentNumber || ''}`}
        size="md"
      >
        <form onSubmit={handleManageSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="manage-status">{t.status}</Label>
            <Select
              id="manage-status"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as IncidentStatus)}
              options={[
                { value: 'investigating', label: isBn ? 'তদন্তাধীন' : 'Investigating' },
                { value: 'contained', label: isBn ? 'নিয়ন্ত্রিত' : 'Contained' },
                { value: 'resolved', label: isBn ? 'সমাধানকৃত' : 'Resolved' },
                { value: 'closed', label: isBn ? 'বন্ধ' : 'Closed' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="manage-notes">{isBn ? 'নিয়ন্ত্রণ ও সমাধানের বিস্তারিত বিবরণ' : 'Containment & Resolution Notes'}</Label>
            <Textarea
              id="manage-notes"
              value={manageNotes}
              onChange={(e) => setManageNotes(e.target.value)}
              rows={3}
              placeholder="Document containment action, credential reset, or root cause analysis..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setManageOpen(false)} disabled={isSubmitting}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.saveChanges}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
