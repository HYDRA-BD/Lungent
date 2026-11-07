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
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building,
} from 'lucide-react'
import { useLanguage } from '@/i18n'
import type { GovernanceMember, GovernanceMeeting, GovernanceBody } from '../types'
import { verifyMemberCredentialsAction } from '../actions'

interface CabBoardCardProps {
  body: GovernanceBody
  members: GovernanceMember[]
  meetings: GovernanceMeeting[]
  onRefresh?: () => void
}

export function CabBoardCard({
  body,
  members,
  meetings,
  onRefresh,
}: CabBoardCardProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const handleVerify = async (memberId: string) => {
    setVerifyingId(memberId)
    await verifyMemberCredentialsAction(memberId)
    setVerifyingId(null)
    onRefresh?.()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'chair':
        return <Badge variant="default">{isBn ? 'বোর্ড চেয়ার' : 'Board Chair'}</Badge>
      case 'vice_chair':
        return <Badge variant="secondary">{isBn ? 'ভাইস চেয়ার' : 'Vice Chair'}</Badge>
      case 'biostatistician':
        return <Badge variant="outline">{isBn ? 'বায়োস্ট্যাটিস্টিসিয়ান' : 'Biostatistician'}</Badge>
      case 'clinical_reviewer':
        return <Badge variant="info">{isBn ? 'ক্লিনিক্যাল পর্যালোচক' : 'Clinical Reviewer'}</Badge>
      case 'secretary':
        return <Badge variant="outline">{isBn ? 'সদস্য সচিব' : 'Secretary'}</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* CAB Board Charter Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5 text-indigo-600" />
                {body.name}
              </CardTitle>
              <CardDescription>
                {body.jurisdiction} | {isBn ? 'প্রতিষ্ঠা: জানুয়ারি ২০২৫' : 'Established: January 2025'}
              </CardDescription>
            </div>
            <Badge variant="success" size="lg">
              {isBn ? 'সক্রিয় পরিষদ' : 'Active Governance Authority'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/40 p-3.5 text-xs text-muted-foreground leading-relaxed border">
            <span className="font-semibold text-foreground">{t.boardCharter}: </span>
            {body.charterSummary}
          </div>
        </CardContent>
      </Card>

      {/* Member Directory Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
          <Users className="size-4 text-blue-600" />
          {t.boardMembers} ({members.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="border flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{member.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{member.specialization}</p>
                  </div>
                  {getRoleBadge(member.role)}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isBn ? 'প্রতিষ্ঠান:' : 'Affiliation:'}</span>
                    <span className="font-medium text-foreground text-right truncate max-w-[160px]">
                      {member.institutionalAffiliation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isBn ? 'নিবন্ধন নম্বর:' : 'Reg No:'}</span>
                    <span className="font-mono text-foreground font-semibold">
                      {member.medicalRegistrationNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{isBn ? 'মেয়াদ:' : 'Term:'}</span>
                    <span>
                      {member.termStartDate} ~ {member.termEndDate || '2028'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  {member.credentialsVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="size-3.5" />
                      {t.verifiedBadge}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(member.id)}
                      disabled={verifyingId === member.id}
                    >
                      {verifyingId === member.id
                        ? isBn
                          ? 'যাচাই হচ্ছে...'
                          : 'Verifying...'
                        : isBn
                          ? 'সনদ যাচাই করুন'
                          : 'Verify Credentials'}
                    </Button>
                  )}

                  {member.hasActiveConflict ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="size-3.5" />
                      {t.conflictDeclared}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t.noConflict}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CAB Meetings & Minutes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-indigo-600" />
            {t.meetingMinutes}
          </CardTitle>
          <CardDescription>
            {isBn
              ? 'বোর্ডের আনুষ্ঠানিক বৈঠক, কোরামের উপস্থিতি, রেজোলিউশন ও অনুমোদনের সংরক্ষিত কার্যবিবরণী।'
              : 'Official Clinical Advisory Board convening records, quorum verifications, agendas, and formal resolutions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600 mr-2">
                      {meeting.meetingNumber}
                    </span>
                    <span className="font-semibold text-sm text-foreground">{meeting.title}</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {isBn ? 'কোরাম উপস্থিত ও সম্পন্ন' : 'Quorum Present & Confirmed'}
                  </Badge>
                </div>

                <div className="text-xs space-y-1.5 text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">{t.agenda}: </span>
                    {meeting.agenda}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{t.resolutions}: </span>
                    {meeting.resolutions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
