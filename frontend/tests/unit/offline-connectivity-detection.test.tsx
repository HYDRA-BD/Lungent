/**
 * Test Suite: Reliable Offline & Connectivity Detection
 * Verifies all 8 required scenarios from the prompt:
 * 1. Device starts with an active internet connection: offline banner must not appear.
 * 2. Device loses internet connectivity: offline banner must appear.
 * 3. Internet connectivity is restored without refreshing the page: offline banner must disappear automatically.
 * 4. User switches between online and offline multiple times: status must remain accurate.
 * 5. Application is refreshed while online: it must correctly initialize as online.
 * 6. Application is refreshed while offline: it must correctly initialize as offline.
 * 7. Responses saved during offline mode must remain preserved and synchronize when connectivity returns.
 * 8. A temporary failed connectivity-check request must not incorrectly create a persistent offline state.
 */

import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import { OfflineConnectivityBanner } from '@/components/shared/offline-connectivity-banner'
import { connectivityMonitor } from '@/modules/offline/connectivity'
import { offlineSyncService } from '@/modules/offline/sync-service'
import { saveDraft, clearUserDrafts, getDraft } from '@/modules/offline/indexeddb'
import type { OfflineDraft } from '@/modules/offline/types'

// Mock language provider to satisfy useLanguage
vi.mock('@/i18n', () => ({
  useLanguage: () => ({
    locale: 'en',
    t: (key: string) => key,
  }),
}))

describe('Reliable Offline Mode & Connectivity Detection', () => {
  const testUserId = 'test-conn-user-uuid'
  let originalFetch: typeof globalThis.fetch

  beforeEach(async () => {
    vi.clearAllMocks()
    originalFetch = globalThis.fetch
    // Default fetch to resolve OK
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    await clearUserDrafts(testUserId)
    // Ensure clean online state before each test
    await act(async () => {
      connectivityMonitor.simulateConnectivity(true, true)
    })
  })

  afterEach(async () => {
    globalThis.fetch = originalFetch
    await act(async () => {
      connectivityMonitor.simulateConnectivity(true, true)
    })
  })

  // ==========================================================================
  // SCENARIO 1: Device starts with active connection -> banner must not appear
  // ==========================================================================
  it('Scenario 1: does not display the offline banner when starting with an active connection', () => {
    connectivityMonitor.simulateConnectivity(true, true)

    const { container } = render(<OfflineConnectivityBanner />)

    // The banner should return null when online and reachable
    expect(container.firstChild).toBeNull()
    expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument()
  })

  // ==========================================================================
  // SCENARIO 2: Device loses connectivity -> banner must appear
  // ==========================================================================
  it('Scenario 2: displays the offline banner immediately when internet connectivity is lost', async () => {
    const { container } = render(<OfflineConnectivityBanner />)
    expect(container.firstChild).toBeNull()

    // Simulate device losing network connectivity
    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/Offline Mode — Limited Assessment Preservation Active/i)).toBeInTheDocument()
    expect(screen.getByText(/Responses are securely stored on this device/i)).toBeInTheDocument()
  })

  // ==========================================================================
  // SCENARIO 3: Connectivity restored without refresh -> banner disappears
  // ==========================================================================
  it('Scenario 3: automatically removes the offline banner when connectivity is restored without page refresh', async () => {
    render(<OfflineConnectivityBanner />)

    // 1. Lose connectivity
    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument()

    // 2. Restore connectivity without refreshing
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })

    // Banner must disappear automatically
    expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument()
  })

  // ==========================================================================
  // SCENARIO 4: Rapid multiple online/offline switches -> status remains accurate
  // ==========================================================================
  it('Scenario 4: accurately reflects status when user switches between online and offline multiple times', async () => {
    render(<OfflineConnectivityBanner />)

    // Switch 1: Offline
    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument()

    // Switch 2: Online
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument()

    // Switch 3: Offline again
    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument()

    // Switch 4: Online again
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument()
  })

  // ==========================================================================
  // SCENARIO 5: Application refreshed while online -> initializes as online
  // ==========================================================================
  it('Scenario 5: initializes cleanly as online without banner when loaded while online', async () => {
    await act(async () => {
      connectivityMonitor.simulateConnectivity(true, true)
    })

    const { container } = render(<OfflineConnectivityBanner />)
    expect(container.firstChild).toBeNull()
    expect(connectivityMonitor.getState().isOnline).toBe(true)
    expect(connectivityMonitor.getState().isBackendReachable).toBe(true)
  })

  // ==========================================================================
  // SCENARIO 6: Application refreshed while offline -> initializes as offline
  // ==========================================================================
  it('Scenario 6: initializes cleanly as offline and displays banner when loaded while offline', async () => {
    await act(async () => {
      connectivityMonitor.simulateConnectivity(false, false)
    })

    render(<OfflineConnectivityBanner />)
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument()
    expect(connectivityMonitor.getState().isOnline).toBe(false)
  })

  // ==========================================================================
  // SCENARIO 7: Offline draft preservation & sync on reconnect
  // ==========================================================================
  it('Scenario 7: preserves saved responses in offline mode and triggers synchronization when connectivity returns', async () => {
    const syncSpy = vi.spyOn(offlineSyncService, 'syncAllPending')

    offlineSyncService.setActiveUser(testUserId)

    // 1. Go offline
    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })

    // 2. Save a response draft while offline
    const draft: OfflineDraft = {
      draftId: 'draft-offline-test-01',
      clientOperationId: 'op-offline-sync-123',
      formType: 'patient_assessment',
      userId: testUserId,
      assessmentType: 'lung_cancer_risk',
      data: { packYears: 25, symptoms: ['cough'] },
      baseVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'saved_locally',
      syncAttempts: 0,
    }
    await saveDraft(draft)

    // Verify draft was safely preserved in offline storage
    const saved = await getDraft('draft-offline-test-01', testUserId)
    expect(saved).toBeDefined()
    expect(saved?.data).toEqual({ packYears: 25, symptoms: ['cough'] })

    // 3. Connectivity returns
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })

    // Verify sync was automatically triggered upon reconnect
    expect(syncSpy).toHaveBeenCalledWith(testUserId)
  })

  // ==========================================================================
  // SCENARIO 8: Transient probe failure does not create persistent offline state
  // ==========================================================================
  it('Scenario 8: does not create a persistent offline state on a single temporary failed probe', async () => {
    // Start healthy and online
    await act(async () => {
      connectivityMonitor.simulateConnectivity(true, true)
    })

    // Mock fetch to reject once (simulating a transient network hiccup / timeout)
    let callCount = 0
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++
      if (callCount === 1) {
        throw new Error('Network timeout (transient blip)')
      }
      return new Response(null, { status: 200 })
    })

    // First probe fails
    await act(async () => {
      await connectivityMonitor.checkReachability(false)
    })

    // Because it's the first failure and navigator.onLine is true,
    // it should NOT immediately mark the application as offline
    expect(connectivityMonitor.getState().isOnline).toBe(true)

    // Fast confirmation retry occurs and succeeds
    await act(async () => {
      await connectivityMonitor.checkReachability(false)
    })

    expect(connectivityMonitor.getState().isOnline).toBe(true)
    expect(connectivityMonitor.getState().isBackendReachable).toBe(true)
  })

  // ==========================================================================
  // SCENARIO 9: "Check Link" button functionality
  // ==========================================================================
  it('Scenario 9: provides working Check Link button that updates status upon manual re-check', async () => {
    // Start offline
    await act(async () => {
      connectivityMonitor.simulateConnectivity(false, false)
    })

    render(<OfflineConnectivityBanner />)
    const checkBtn = screen.getByRole('button', { name: /Check Link/i })
    expect(checkBtn).toBeInTheDocument()

    // Mock successful probe when user clicks Check Link
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))

    await act(async () => {
      fireEvent.click(checkBtn)
    })

    // State is now verified online and reachable
    expect(connectivityMonitor.getState().isOnline).toBe(true)
    expect(connectivityMonitor.getState().isBackendReachable).toBe(true)

    // Banner should disappear after check succeeds
    await waitFor(() => {
      expect(screen.queryByText(/Offline Mode/i)).not.toBeInTheDocument()
    })
  })
})
