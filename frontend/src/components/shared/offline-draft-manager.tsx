'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SyncStatusBadge } from './sync-status-badge'
import { useLanguage } from '@/i18n'
import {
  getDraftsByUser,
  deleteDraft,
  clearUserDrafts,
} from '@/modules/offline/indexeddb'
import { offlineSyncService } from '@/modules/offline/sync-service'
import { resolveConflictAction } from '@/modules/offline/actions'
import type { OfflineDraft, ConflictResolutionChoice } from '@/modules/offline/types'

interface OfflineDraftManagerProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onDraftSelected?: (draft: OfflineDraft) => void
}

export function OfflineDraftManager({
  isOpen,
  onClose,
  userId,
  onDraftSelected,
}: OfflineDraftManagerProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [drafts, setDrafts] = useState<OfflineDraft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [conflictDraft, setConflictDraft] = useState<OfflineDraft | null>(null)
  const [selectedResolution, setSelectedResolution] =
    useState<ConflictResolutionChoice>('use_client')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const loadDrafts = useCallback(async () => {
    try {
      const records = await getDraftsByUser(userId)
      setDrafts(records)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    getDraftsByUser(userId)
      .then((records) => {
        if (isMounted) {
          setDrafts(records)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, userId])

  const handleSyncDraft = async (draftId: string) => {
    await offlineSyncService.syncDraft(draftId, userId)
    await loadDrafts()
  }

  const handleSyncAll = async () => {
    setIsSyncingAll(true)
    try {
      await offlineSyncService.syncAllPending(userId)
      await loadDrafts()
    } finally {
      setIsSyncingAll(false)
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (
      confirm(
        isBn
          ? 'আপনি কি নিশ্চিতভাবে এই ড্রাফটটি মুছে ফেলতে চান?'
          : 'Are you sure you want to discard this local draft?'
      )
    ) {
      await deleteDraft(draftId)
      await loadDrafts()
    }
  }

  const handleClearAll = async () => {
    if (
      confirm(
        isBn
          ? 'ডিভাইসের সকল অফলাইন অ্যাসেসমেন্ট ড্রাফট মুছে ফেলা হবে। আপনি কি নিশ্চিত?'
          : 'All unsynchronized local drafts on this device will be cleared. Are you sure?'
      )
    ) {
      await clearUserDrafts(userId)
      await loadDrafts()
    }
  }

  const handleOpenConflict = (draft: OfflineDraft) => {
    setConflictDraft(draft)
    setSelectedResolution('use_client')
    setResolutionNotes('')
  }

  const handleExecuteResolution = async () => {
    if (!conflictDraft) return
    setIsResolving(true)
    try {
      const res = await resolveConflictAction({
        draftId: conflictDraft.draftId,
        clientOperationId: conflictDraft.clientOperationId,
        choice: selectedResolution,
        resolutionNotes,
        resolvedByUserId: userId,
      })

      if (res.success) {
        if (selectedResolution === 'use_server') {
          await deleteDraft(conflictDraft.draftId)
        } else {
          conflictDraft.syncStatus = 'synced'
          conflictDraft.conflictDetails = undefined
          await offlineSyncService.syncDraft(conflictDraft.draftId, userId)
        }
        setConflictDraft(null)
        await loadDrafts()
      } else {
        alert(res.error || 'Failed to resolve conflict')
      }
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        title={isBn ? 'অফলাইন ড্রাফট ও সিঙ্ক ম্যানেজার' : 'Offline Drafts & Synchronization Hub'}
        description={
          isBn
            ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন থাকাকালীন আপনার ডিভাইসে সংরক্ষিত অ্যাসেসমেন্ট ফর্মের তালিকা।'
            : 'Manage assessment drafts saved locally during network interruptions. Review and sync when connected.'
        }
        size="xl"
      >
        <div className="space-y-4">
          {/* Top Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div className="text-xs text-muted-foreground">
              {drafts.length} {isBn ? 'টি সংরক্ষিত ড্রাফট' : 'saved drafts on this device'}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncAll}
                disabled={isSyncingAll || drafts.length === 0}
                className="h-8 text-xs"
              >
                <RefreshCw className={`size-3.5 mr-1.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                {isBn ? 'সকল ড্রাফট সিঙ্ক করুন' : 'Sync All Pending'}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                disabled={drafts.length === 0}
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5 mr-1" />
                {isBn ? 'সব মুছুন' : 'Clear All'}
              </Button>
            </div>
          </div>

          {/* Drafts List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-primary" />
                {isBn ? 'ড্রাফট লোড হচ্ছে...' : 'Loading local drafts...'}
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground space-y-2">
                <FileText className="size-8 text-muted-foreground/40 mx-auto" />
                <p>{isBn ? 'ডিভাইসে কোনো সংরক্ষিত ড্রাফট নেই।' : 'No offline drafts found on this device.'}</p>
                <p className="text-xs text-muted-foreground/80">
                  {isBn
                    ? 'অফলাইনে ফর্ম পূরণ শুরু করলে তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।'
                    : 'Forms edited while disconnected will automatically appear here.'}
                </p>
              </div>
            ) : (
              drafts.map((draft) => (
                <Card key={draft.draftId} className="border-border">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm capitalize text-foreground">
                          {draft.assessmentType.replace(/_/g, ' ')}
                        </span>
                        <SyncStatusBadge status={draft.syncStatus} showTimestamp={false} />
                      </div>

                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          {isBn ? 'সর্বশেষ সম্পাদনা:' : 'Last modified:'}{' '}
                          {new Date(draft.updatedAt).toLocaleTimeString()}
                        </span>
                        {draft.patientId && (
                          <span>
                            {isBn ? 'রোগী আইডি:' : 'Patient ID:'} {draft.patientId.slice(0, 8)}...
                          </span>
                        )}
                        <span>
                          {isBn ? 'চেষ্টা:' : 'Attempts:'} {draft.syncAttempts}
                        </span>
                      </div>

                      {draft.syncError && (
                        <p className="text-xs text-destructive font-medium">
                          {draft.syncError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {draft.syncStatus === 'conflict_detected' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOpenConflict(draft)}
                          className="h-8 text-xs flex items-center gap-1"
                        >
                          <AlertTriangle className="size-3.5" />
                          {isBn ? 'দ্বন্দ্ব সমাধান' : 'Resolve Conflict'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncDraft(draft.draftId)}
                          disabled={draft.syncStatus === 'synchronizing'}
                          className="h-8 text-xs"
                        >
                          <RefreshCw
                            className={`size-3 mr-1 ${
                              draft.syncStatus === 'synchronizing' ? 'animate-spin' : ''
                            }`}
                          />
                          {isBn ? 'সিঙ্ক' : 'Sync'}
                        </Button>
                      )}

                      {onDraftSelected && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            onDraftSelected(draft)
                            onClose()
                          }}
                          className="h-8 text-xs"
                        >
                          {isBn ? 'পুনরুদ্ধার' : 'Resume'}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDraft(draft.draftId)}
                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-[11px] text-muted-foreground border-t border-border pt-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>
              {isBn
                ? 'ড্রাফটসমূহ ব্রাউজারের IndexedDB-তে AES-GCM-256 বিট অ্যালগরিদমে এনক্রিপ্ট করে রাখা হয়।'
                : 'Drafts are isolated by user account and protected with client-side AES-GCM-256 encryption.'}
            </span>
          </div>
        </div>
      </Dialog>

      {/* Conflict Resolution Sub-Modal */}
      {conflictDraft && (
        <Dialog
          open={!!conflictDraft}
          onClose={() => setConflictDraft(null)}
          title={isBn ? 'অ্যাসেসমেন্ট সংস্করণ দ্বন্দ্ব সনাক্ত হয়েছে' : 'Assessment Concurrency Conflict'}
          description={
            isBn
              ? 'আপনার অফলাইন ড্রাফট সম্পাদনার পর সার্ভারে এই রেকর্ডের একটি নতুন সংস্করণ তৈরি হয়েছে।'
              : 'A newer version of this assessment was updated on the server while this draft was offline.'
          }
          size="lg"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="bg-muted/50 p-3 rounded-lg border border-border space-y-1.5">
              <div className="font-semibold text-foreground">
                {isBn ? 'দ্বন্দ্বের বিবরণ:' : 'Conflict Details:'}
              </div>
              <div className="text-muted-foreground">
                {isBn ? 'স্থানীয় ড্রাফটের বেস ভার্সন:' : 'Local Draft Base Version:'}{' '}
                <span className="font-mono text-foreground font-bold">
                  v{conflictDraft.baseVersion}
                </span>
              </div>
              <div className="text-muted-foreground">
                {isBn ? 'বর্তমান সার্ভার ভার্সন:' : 'Current Server Version:'}{' '}
                <span className="font-mono text-foreground font-bold">
                  v{conflictDraft.conflictDetails?.serverVersion || conflictDraft.baseVersion + 1}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-foreground">
                {isBn ? 'সমাধানের পদ্ধতি নির্বাচন করুন:' : 'Select Resolution Strategy:'}
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
                  <input
                    type="radio"
                    name="resolutionChoice"
                    value="use_client"
                    checked={selectedResolution === 'use_client'}
                    onChange={() => setSelectedResolution('use_client')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {isBn ? 'স্থানীয় ড্রাফট দিয়ে প্রতিস্থাপন করুন' : 'Overwrite Server with Local Draft'}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {isBn
                        ? 'আপনার ডিভাইসের ড্রাফটের তথ্য সার্ভারে চূড়ান্ত হিসেবে সংরক্ষণ করা হবে।'
                        : 'Applies your local offline changes as the latest authoritative revision.'}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer">
                  <input
                    type="radio"
                    name="resolutionChoice"
                    value="use_server"
                    checked={selectedResolution === 'use_server'}
                    onChange={() => setSelectedResolution('use_server')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {isBn ? 'সার্ভার সংস্করণ বজায় রাখুন (ড্রাফট বাতিল)' : 'Keep Server Version (Discard Local Draft)'}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {isBn
                        ? 'সার্ভারের তথ্য বহাল থাকবে এবং স্থানীয় অসঙ্গতিপূর্ণ ড্রাফট মুছে যাবে।'
                        : 'Preserves the server assessment and discards this conflicting local draft.'}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                {isBn ? 'ক্লিনিক্যাল কারণ বা নোট (ঐচ্ছিক):' : 'Clinical Rationale / Notes (Optional):'}
              </label>
              <input
                type="text"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder={
                  isBn
                    ? 'যেমন: ফিল্ড ভিজিটে নিশ্চিত করা তথ্য...'
                    : 'e.g. Field verification overrides previous intake...'
                }
                className="w-full text-xs px-3 py-1.5 rounded-md border border-border bg-background"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConflictDraft(null)}
                disabled={isResolving}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteResolution}
                disabled={isResolving}
                className="flex items-center gap-1.5"
              >
                {isResolving ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                {isBn ? 'সমাধান প্রয়োগ করুন' : 'Apply Resolution'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
