/**
 * Connectivity Monitor and Heartbeat Probe
 * Phase 1.21 — Limited Offline Functionality
 *
 * Combines browser online/offline events with active server reachability checks.
 * Provides resilient connectivity detection:
 * - Accurately detects true loss and restoration of internet connectivity.
 * - Guards against temporary failed requests creating persistent false-offline states.
 * - Supports instant automatic removal of offline banner on network recovery.
 * - Hydration-safe state access for React 19 useSyncExternalStore.
 */

import type { ConnectivityState } from './types'

type ConnectivityListener = (state: ConnectivityState) => void

const SERVER_SNAPSHOT: ConnectivityState = Object.freeze({
  isOnline: true,
  isBackendReachable: true,
  lastCheckedAt: '',
})

function getInitialOnlineStatus(): boolean {
  if (typeof window === 'undefined') return true
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine
  }
  return true
}

export class ConnectivityMonitor {
  private state: ConnectivityState
  private listeners: Set<ConnectivityListener> = new Set()
  private probeTimer: ReturnType<typeof setInterval> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private readonly PROBE_INTERVAL_MS = 30000 // 30 seconds nominal probe
  private readonly RETRY_DELAY_MS = 1500 // Quick confirmation retry on transient failure
  private readonly PROBE_TIMEOUT_MS = 4000 // 4s timeout for reachability check
  private isChecking = false
  private consecutiveFailures = 0
  private inFlightPromise: Promise<ConnectivityState> | null = null

  constructor() {
    const initialOnline = getInitialOnlineStatus()
    this.state = Object.freeze({
      isOnline: initialOnline,
      isBackendReachable: initialOnline,
      lastCheckedAt: new Date().toISOString(),
    })

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      document.addEventListener('visibilitychange', this.handleVisibilityChange)

      this.startPeriodicProbe()

      if (!initialOnline) {
        this.consecutiveFailures = 2
      } else {
        // Run initial reachability check in background
        this.checkReachability().catch(() => {})
      }
    }
  }

  public getState = (): ConnectivityState => {
    return this.state
  }

  public getSnapshot = (): ConnectivityState => {
    return this.state
  }

  public getServerSnapshot = (): ConnectivityState => {
    return SERVER_SNAPSHOT
  }

  public subscribe = (listener: ConnectivityListener): (() => void) => {
    this.listeners.add(listener)
    try {
      listener(this.state)
    } catch {
      // Suppress listener errors during registration
    }
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Checks network reachability via a lightweight probe.
   * @param force - If true, bypasses in-flight debounce and forces an immediate check
   */
  public async checkReachability(force = false): Promise<ConnectivityState> {
    if (this.isChecking && !force && this.inFlightPromise) {
      return this.inFlightPromise
    }

    const browserOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true

    if (!browserOnline) {
      this.consecutiveFailures = 2
      this.updateState({
        isOnline: false,
        isBackendReachable: false,
      })
      return this.state
    }

    this.isChecking = true
    this.inFlightPromise = this.performProbe(force)

    try {
      return await this.inFlightPromise
    } finally {
      this.isChecking = false
      this.inFlightPromise = null
    }
  }

  private async performProbe(force: boolean): Promise<ConnectivityState> {
    const start = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.PROBE_TIMEOUT_MS)

    try {
      // Use lightweight probe with cache-busting timestamp
      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store',
          Pragma: 'no-cache',
        },
      })

      clearTimeout(timeoutId)
      const latencyMs = Date.now() - start

      if (res.ok) {
        this.consecutiveFailures = 0
        if (this.retryTimer) {
          clearTimeout(this.retryTimer)
          this.retryTimer = null
        }
        this.updateState({
          isOnline: true,
          isBackendReachable: true,
          latencyMs,
        })
        return this.state
      } else {
        return this.handleProbeFailure(force)
      }
    } catch {
      clearTimeout(timeoutId)
      return this.handleProbeFailure(force)
    }
  }

  private handleProbeFailure(force: boolean): ConnectivityState {
    this.consecutiveFailures += 1

    // If forced check (e.g. user clicked "Check Link") or reached consecutive failure threshold:
    // Transition to unreachable / offline
    if (force || this.consecutiveFailures >= 2) {
      this.updateState({
        isOnline: false,
        isBackendReachable: false,
      })
      return this.state
    }

    // First background failure: schedule quick confirmation retry before declaring offline
    // (Scenario 8: A temporary failed connectivity-check request must not incorrectly create a persistent offline state)
    if (!this.retryTimer) {
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null
        this.checkReachability().catch(() => {})
      }, this.RETRY_DELAY_MS)
    }

    return this.state
  }

  private handleOnline = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.consecutiveFailures = 0

    // Immediately restore online status so offline banner clears without delay
    this.updateState({
      isOnline: true,
      isBackendReachable: true,
    })

    // Verify in background to confirm actual internet access
    this.checkReachability(true).catch(() => {})
  }

  private handleOffline = () => {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.consecutiveFailures = 2
    this.updateState({
      isOnline: false,
      isBackendReachable: false,
    })
  }

  private handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      const lastChecked = new Date(this.state.lastCheckedAt).getTime()
      const now = Date.now()
      if (!this.state.isBackendReachable || now - lastChecked > this.PROBE_INTERVAL_MS) {
        this.checkReachability().catch(() => {})
      }
    }
  }

  private updateState(partial: Partial<ConnectivityState>) {
    const isOnline = partial.isOnline !== undefined ? partial.isOnline : this.state.isOnline
    const isBackendReachable = partial.isBackendReachable !== undefined ? partial.isBackendReachable : this.state.isBackendReachable
    const latencyMs = partial.latencyMs !== undefined ? partial.latencyMs : this.state.latencyMs

    if (
      isOnline === this.state.isOnline &&
      isBackendReachable === this.state.isBackendReachable &&
      latencyMs === this.state.latencyMs
    ) {
      return
    }

    this.state = Object.freeze({
      isOnline,
      isBackendReachable,
      lastCheckedAt: new Date().toISOString(),
      ...(latencyMs !== undefined ? { latencyMs } : {}),
    })

    this.notify()
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state)
      } catch {
        // Suppress individual listener errors
      }
    }
  }

  private startPeriodicProbe() {
    if (this.probeTimer) clearInterval(this.probeTimer)
    this.probeTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return
      }
      this.checkReachability().catch(() => {})
    }, this.PROBE_INTERVAL_MS)
  }

  /**
   * For testing and simulation purposes: allows deterministic simulation of network state.
   */
  public simulateConnectivity(isOnline: boolean, isBackendReachable?: boolean): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.consecutiveFailures = isOnline && (isBackendReachable ?? isOnline) ? 0 : 2
    this.updateState({
      isOnline,
      isBackendReachable: isBackendReachable ?? isOnline,
    })
  }

  public destroy() {
    if (this.probeTimer) {
      clearInterval(this.probeTimer)
      this.probeTimer = null
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }
    this.listeners.clear()
  }
}

export const connectivityMonitor = new ConnectivityMonitor()
