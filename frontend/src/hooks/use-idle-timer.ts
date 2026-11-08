'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface UseIdleTimerOptions {
  /**
   * Inactivity timeout in milliseconds before triggering onIdle.
   * Default: 90,000ms (1.5 minutes / 90 seconds).
   */
  timeoutMs?: number
  /**
   * Callback fired when user has been idle for timeoutMs.
   */
  onIdle: () => void
  /**
   * Callback fired when user resumes activity after being idle.
   */
  onActive?: () => void
  /**
   * Whether the idle timer is currently active.
   * Default: true.
   */
  enabled?: boolean
}

/**
 * useIdleTimer
 * Listens for user interactions (mousemove, mousedown, keydown, touchstart, scroll, wheel)
 * and fires onIdle when no activity has occurred for 90 seconds. Fires onActive upon resume.
 */
export function useIdleTimer({
  timeoutMs = 90000,
  onIdle,
  onActive,
  enabled = true,
}: UseIdleTimerOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isIdleRef = useRef<boolean>(false)
  const onIdleRef = useRef(onIdle)
  const onActiveRef = useRef(onActive)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    onActiveRef.current = onActive
  }, [onActive])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (!enabled) return

    // If currently idle, fire onActive callback immediately
    if (isIdleRef.current) {
      isIdleRef.current = false
      if (onActiveRef.current) {
        onActiveRef.current()
      }
    }

    timerRef.current = setTimeout(() => {
      isIdleRef.current = true
      onIdleRef.current()
    }, timeoutMs)
  }, [timeoutMs, enabled])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      isIdleRef.current = false
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
