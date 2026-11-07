'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { connectivityMonitor } from './connectivity'
import type { ConnectivityState } from './types'

export function useConnectivity(): ConnectivityState & { checkNow: () => Promise<ConnectivityState> } {
  const state = useSyncExternalStore(
    connectivityMonitor.subscribe,
    connectivityMonitor.getSnapshot,
    connectivityMonitor.getServerSnapshot
  )

  const checkNow = useCallback(() => {
    return connectivityMonitor.checkReachability(true)
  }, [])

  return {
    ...state,
    checkNow,
  }
}
