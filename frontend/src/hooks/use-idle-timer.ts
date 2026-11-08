'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface UseIdleTimerOptions {
  /**
   * Inactivity timeout in milliseconds before triggering onIdle.
   * Default: 120,000ms (2 minutes).
   */
  timeoutMs?: number
  /**
   * Callback fired when user has been idle for timeoutMs.
   */
  onIdle: () => void
  /**
   * Whether the idle timer is currently active.
   * Default: true.
   */
  enabled?: boolean
}

/**
 * useIdleTimer
 * Listens for user interactions (mousemove, mousedown, keydown, touchstart, scroll, wheel)
 * and fires onIdle when no activity has occurred for the specified duration.
 */
export function useIdleTimer({
  timeoutMs = 120000,
  onIdle,
  enabled = true,
}: UseIdleTimerOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (!enabled) return

    timerRef.current = setTimeout(() => {
      onIdleRef.current()
    }, timeoutMs)
  }, [timeoutMs, enabled])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'wheel',
    ]

    const handleUserActivity = () => {
      resetTimer()
    }

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true })
    })

    // Start initial countdown
    resetTimer()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity)
      })
    }
  }, [enabled, resetTimer])

  return { resetTimer }
}

